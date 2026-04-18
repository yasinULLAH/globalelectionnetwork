const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Simple script to convert markdown to PDF using pandoc if available
// Or provide instructions for manual conversion

async function convertToPDF() {
  const markdownPath = path.join(__dirname, '../docs/Funding_Proposal_2026.md');
  const pdfPath = path.join(__dirname, '../public/Funding_Proposal_2026.pdf');

  console.log('Converting markdown to PDF...');
  console.log(`Input: ${markdownPath}`);
  console.log(`Output: ${pdfPath}`);

  try {
    // Try using pandoc if available
    await execPromise(`pandoc "${markdownPath}" -o "${pdfPath}" --pdf-engine=xelatex -V geometry:margin=1in`);
    console.log('✅ PDF created successfully using pandoc!');
  } catch (error) {
    console.log('❌ Pandoc not available or failed.');
    console.log('\nAlternative options:');
    console.log('1. Install pandoc: https://pandoc.org/installing.html');
    console.log('2. Use online converter: https://www.markdowntopdf.com/');
    console.log('3. Use Typora or other markdown editor with PDF export');
    console.log('4. Use VS Code with "Markdown PDF" extension');
    
    // Copy markdown to public as fallback
    fs.copyFileSync(markdownPath, path.join(__dirname, '../public/Funding_Proposal_2026.md'));
    console.log('\n📄 Markdown file copied to public folder as fallback.');
  }
}

convertToPDF().catch(console.error);
