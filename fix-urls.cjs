const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.next' || file === 'out') return;
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filepath));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(filepath);
        }
    });
    return results;
}

const files = walk('./app');
const libFiles = walk('./lib');
const allFiles = [...files, ...libFiles];

let totalUpdated = 0;

allFiles.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;
        
        // Fix string concatenations or basic literals if any
        let newContent = content.replace(/\`\$\{process\.env\.NEXT_PUBLIC_API_URL\}\/api([^\`]*)\`/g, "apiUrl(`$1`)");
        
        // Sometimes it's without template literals: process.env.NEXT_PUBLIC_API_URL + "/api/..."
        newContent = newContent.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\+\s*["']\/api([^"']*)["']/g, "apiUrl('$1')");
        
        // Also handle the BetterAuth issue in lib/auth.js right here, safely
        if (file.includes('auth.js')) {
            newContent = newContent.replace(
                'baseURL: process.env.BETTER_AUTH_URL || "https://flovia.vercel.app"',
                'baseURL: process.env.NEXT_PUBLIC_API_URL || "https://flovia.vercel.app"'
            );
        }

        if (newContent !== originalContent) {
            content = newContent;
            
            // Step 2: Ensure import exists IF we added apiUrl
            if (content.includes('apiUrl(') && !content.includes('apiUrl } from')) {
                const lines = content.split('\n');
                let lastImportIdx = -1;
                for(let i=0; i<lines.length; i++) {
                    if(lines[i].startsWith('import ')) {
                        lastImportIdx = i;
                    }
                }
                if (lastImportIdx !== -1) {
                    lines.splice(lastImportIdx + 1, 0, "import { apiUrl } from '@/lib/apiUrl';");
                    content = lines.join('\n');
                }
            }
            
            fs.writeFileSync(file, content, 'utf8');
            console.log(`✅ Updated ${file}`);
            totalUpdated++;
        }
    } catch(e) {
        console.error(`Failed on ${file}:`, e.message);
    }
});

console.log(`\n🎉 Successfully updated ${totalUpdated} files.`);
