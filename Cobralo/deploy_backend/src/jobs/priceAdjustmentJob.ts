import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../db';

/**
 * Job to automate price adjustments based on Argentine Inflation (IPC)
 * Logic: 50% of monthly IPC is applied to the base price.
 */

interface IPCData {
    fecha: string;
    valor: number;
}

export async function checkAndScheduleIPCAdjustment() {
    console.log('--- 📉 Checking for new IPC data ---');
    try {
        // 1. Fetch latest inflation from community API (INDEC data)
        const response = await axios.get<IPCData[]>('https://api.argentinadatos.com/v1/indices/inflacion');
        const latest = response.data[response.data.length - 1];

        if (!latest) return;

        // 2. Check if we already processed this month
        const lastProcessedKey = `last_ipc_date_processed`;
        const lastProcessed = await prisma.systemSetting.findUnique({ where: { key: lastProcessedKey } });
        
        if (lastProcessed?.value === latest.fecha) {
            console.log(`IPC for ${latest.fecha} already processed.`);
            return;
        }

        // 3. Calculate adjustment (50% of IPC)
        // Note: latest.valor is usually the monthly variation (e.g., 4.2 for 4.2%)
        const ipcValue = latest.valor;
        const adjustmentPercent = ipcValue / 2;
        const multiplier = 1 + (adjustmentPercent / 100);

        // 4. Schedule for next month
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        const adjustmentData = {
            percent: adjustmentPercent,
            multiplier: multiplier,
            activationDate: nextMonth.toISOString(),
            sourceDate: latest.fecha,
            applied: false
        };

        await prisma.systemSetting.upsert({
            where: { key: 'pending_price_adjustment' },
            update: { value: JSON.stringify(adjustmentData), type: 'json' },
            create: { key: 'pending_price_adjustment', value: JSON.stringify(adjustmentData), type: 'json' }
        });

        await prisma.systemSetting.upsert({
            where: { key: lastProcessedKey },
            update: { value: latest.fecha },
            create: { key: lastProcessedKey, value: latest.fecha }
        });

        console.log(`✅ Scheduled ${adjustmentPercent}% increase for ${nextMonth.toLocaleDateString()}`);

    } catch (error) {
        console.error('Error fetching IPC data:', error);
    }
}

export async function applyScheduledAdjustments() {
    console.log('--- 🚀 Applying scheduled price adjustments ---');
    try {
        const pendingSetting = await prisma.systemSetting.findUnique({ where: { key: 'pending_price_adjustment' } });
        if (!pendingSetting) return;

        const data = JSON.parse(pendingSetting.value);
        if (data.applied) return;

        const activationDate = new Date(data.activationDate);
        const now = new Date();

        if (now >= activationDate) {
            // Apply multiplier to the global ipc_multiplier
            const currentMultiplierSetting = await prisma.systemSetting.findUnique({ where: { key: 'ipc_multiplier' } });
            const currentMultiplier = parseFloat(currentMultiplierSetting?.value || '1.0');
            const newMultiplier = currentMultiplier * data.multiplier;

            await prisma.systemSetting.update({
                where: { key: 'ipc_multiplier' },
                data: { value: newMultiplier.toString() }
            });

            await prisma.systemSetting.update({
                where: { key: 'last_ipc_update' },
                data: { value: now.toISOString() }
            });

            // Mark as applied
            data.applied = true;
            await prisma.systemSetting.update({
                where: { key: 'pending_price_adjustment' },
                data: { value: JSON.stringify(data) }
            });

            console.log(`🔥 Applied adjustment! New global multiplier: ${newMultiplier}`);
        }
    } catch (error) {
        console.error('Error applying price adjustment:', error);
    }
}

/**
 * Initialize Price Adjustment Cron Jobs
 */
export function initPriceAdjustmentCron() {
    // 1. Check for inflation data daily at 4:00 PM (INDEC usually publishes at 4:00 PM)
    cron.schedule('0 16 * * *', () => {
        checkAndScheduleIPCAdjustment();
    });

    // 2. Check for activation every hour
    cron.schedule('0 * * * *', () => {
        applyScheduledAdjustments();
    });

    console.log('⏰ Scheduled Price Adjustment Jobs');
}
