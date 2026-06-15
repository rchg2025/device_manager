const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/app');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let updatedFiles = 0;

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // We will find lines that have { name: { contains: ... } } and replace with nameSearch.
    // E.g. { name: { contains: q, mode: 'insensitive' } }
    // We replace it with { nameSearch: { contains: normalizeForSearch(q), mode: 'insensitive' } }
    
    // Also we need to inject the import if we modify
    const containsRegex = /name:\s*\{\s*contains:\s*([^,]+),\s*mode:\s*(['"`]insensitive['"`])\s*\}/g;
    
    if (containsRegex.test(content)) {
      content = content.replace(containsRegex, (match, queryVar, modeStr) => {
        return `nameSearch: { contains: normalizeForSearch(${queryVar.trim()}), mode: ${modeStr} }`;
      });
      
      // Also description and handlerName in maintenance
      const descRegex = /description:\s*\{\s*contains:\s*([^,]+),\s*mode:\s*(['"`]insensitive['"`])\s*\}/g;
      if (descRegex.test(content)) {
        content = content.replace(descRegex, (match, queryVar, modeStr) => {
          return `searchString: { contains: normalizeForSearch(${queryVar.trim()}), mode: ${modeStr} }`;
        });
      }

      // handlerName
      const handlerRegex = /handlerName:\s*\{\s*contains:\s*([^,]+),\s*mode:\s*(['"`]insensitive['"`])\s*\}/g;
      if (handlerRegex.test(content)) {
        content = content.replace(handlerRegex, (match, queryVar, modeStr) => {
          return `searchString: { contains: normalizeForSearch(${queryVar.trim()}), mode: ${modeStr} }`;
        });
      }

      // Add import if not exists
      if (!content.includes('normalizeForSearch')) {
         // Insert at the top after "use client" if it exists, or just at the top
         if (content.startsWith('"use client"')) {
            content = content.replace('"use client"', '"use client"\nimport { normalizeForSearch } from "@/lib/search-utils";\n');
         } else {
            content = `import { normalizeForSearch } from "@/lib/search-utils";\n` + content;
         }
      }
      
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
      updatedFiles++;
    }
  }
});

console.log(`Finished updating ${updatedFiles} files.`);
