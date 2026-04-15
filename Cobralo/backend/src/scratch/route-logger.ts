import express from 'express';
import authRouter from '../routes/auth';

const app = express();
app.use('/api/auth', authRouter);

function printRoutes(stack: any[], prefix = '') {
    stack.forEach(layer => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            console.log(`${methods} ${prefix}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle.stack) {
            const newPrefix = prefix + layer.regexp.source
                .replace('^\\', '')
                .replace('\\/?(?=\\/|$)', '')
                .replace('\\/', '/');
            printRoutes(layer.handle.stack, newPrefix);
        }
    });
}

console.log('--- REGISTERED ROUTES ---');
printRoutes((app as any)._router.stack);
console.log('-------------------------');
