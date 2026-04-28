const fs = require('fs');

const htmlPath = 'dashboard-c4-mss.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Extract CSS
const styleRegex = /<style>([\s\S]*?)<\/style>/;
const styleMatch = html.match(styleRegex);

if (styleMatch) {
  const cssContent = styleMatch[1].trim();
  fs.writeFileSync('styles.css', cssContent, 'utf8');
  html = html.replace(styleRegex, '<link rel="stylesheet" href="styles.css">');
  console.log('Extracted styles.css');
} else {
  console.log('No <style> block found');
}

// Extract JS
// Looking for the embedded script block. The external ones have src=
const scriptRegex = /<script>([\s\S]*?)<\/script>/;
const scriptMatch = html.match(scriptRegex);

if (scriptMatch) {
  const jsContent = scriptMatch[1].trim();
  fs.writeFileSync('script.js', jsContent, 'utf8');
  html = html.replace(scriptRegex, '<script src="script.js"></script>');
  console.log('Extracted script.js');
} else {
  console.log('No embedded <script> block found');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Updated dashboard-c4-mss.html');
