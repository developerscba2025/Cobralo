import { runReminderJob } from './jobs/reminderJob';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Manual test script for reminders
 */
async function test() {
    console.log('--- Manual Reminders Test Started ---');
    await runReminderJob();
    console.log('--- Manual Reminders Test Finished ---');
    process.exit(0);
}

test().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
