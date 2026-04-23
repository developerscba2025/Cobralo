import fs from 'fs';
import path from 'path';

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Replacements
            content = content.replace(/bg-black\/60/g, 'bg-black/20 dark:bg-black/60');
            content = content.replace(/bg-black\/80/g, 'bg-black/20 dark:bg-black/80');
            content = content.replace(/bg-black\/85/g, 'bg-black/20 dark:bg-black/85');
            content = content.replace(/bg-slate-900\/60 dark:bg-black\/80/g, 'bg-black/20 dark:bg-black/80');
            content = content.replace(/bg-slate-900\/60 dark:bg-black\/60/g, 'bg-black/20 dark:bg-black/60');
            content = content.replace(/bg-zinc-900\/60/g, 'bg-black/20 dark:bg-black/60');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed', fullPath);
            }
        }
    }
}

findAndReplace(path.join(process.cwd(), 'src/components'));
