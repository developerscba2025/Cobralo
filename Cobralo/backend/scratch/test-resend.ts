import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const testEmail = async () => {
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cobralo <onboarding@resend.dev>';
    const targetEmail = 'Support@cobralo.info'; // Test target

    console.log('--- Resend API Test ---');
    console.log('Key:', resendKey ? (resendKey.substring(0, 7) + '...') : 'MISSING');
    console.log('From:', fromEmail);
    console.log('Target:', targetEmail);

    if (!resendKey) {
        console.error('❌ Error: RESEND_API_KEY no está configurado en .env');
        return;
    }

    try {
        const response = await axios.post(
            'https://api.resend.com/emails',
            {
                from: fromEmail,
                to: [targetEmail],
                subject: 'Test Resend API',
                html: '<strong>Este es un correo de prueba de Cobralo.</strong>'
            },
            {
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Éxito:', response.data);
    } catch (error: any) {
        console.error('❌ Error de Resend:');
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
            
            // Check specific common errors
            const code = error.response.data.name;
            if (code === 'validation_error' && fromEmail.includes('onboarding@resend.dev')) {
                console.error('\n⚠️ HIPÓTESIS CONFIRMADA:');
                console.error('Resend bloqueó el envío porque estás usando el dominio de prueba "onboarding@resend.dev".');
                console.log('SOLUCIÓN: Debes verificar tu dominio cobralo.info en el panel de Resend y configurar RESEND_FROM_EMAIL en tu .env');
            }
        } else {
            console.error(error.message);
        }
    }
};

testEmail();
