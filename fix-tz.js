const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk('src/app');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace toLocaleDateString
  content = content.replace(/\.toLocaleDateString\('vi-VN'\)/g, ".toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })");
  content = content.replace(/\.toLocaleDateString\("vi-VN"\)/g, ".toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })");
  
  // Replace toLocaleTimeString with options
  content = content.replace(/\.toLocaleTimeString\('vi-VN', \{ hour: '2-digit', minute: '2-digit' \}\)/g, ".toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    modifiedCount++;
  }
});

console.log('Total files modified:', modifiedCount);
