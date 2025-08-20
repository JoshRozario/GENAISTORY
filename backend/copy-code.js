#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import clipboardy from 'clipboardy';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.vscode',
  '.idea',
  'coverage',
  '.nyc_output',
  'logs',
  '*.log',
  '.env',
  '.env.*',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '*.tsbuildinfo',
  '.DS_Store',
  'Thumbs.db'
];

// File extensions to include
const INCLUDE_EXTENSIONS = [
  '.js', '.ts', '.tsx', '.jsx',
  '.md', '.txt',
  '.html', '.css', '.scss', '.less',
];

function shouldExclude(filePath, fileName) {
  // Check exclude patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.includes('*')) {
      // Handle wildcard patterns
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      if (regex.test(fileName) || regex.test(filePath)) {
        return true;
      }
    } else {
      // Handle directory/file names
      if (filePath.includes(pattern) || fileName === pattern) {
        return true;
      }
    }
  }
  return false;
}

function shouldInclude(fileName) {
  // Always include files without extensions (like Dockerfile, README)
  if (!fileName.includes('.')) {
    return ['Dockerfile', 'README', 'LICENSE', 'CHANGELOG'].some(name => 
      fileName.toUpperCase().includes(name)
    );
  }

  // Check if file extension is in our include list
  const ext = path.extname(fileName).toLowerCase();
  return INCLUDE_EXTENSIONS.includes(ext);
}

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.relative(baseDir, fullPath);
      
      if (shouldExclude(relativePath, item)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...getAllFiles(fullPath, baseDir));
      } else if (stat.isFile() && shouldInclude(item)) {
        files.push({
          path: fullPath,
          relativePath: relativePath.replace(/\\/g, '/'), // Normalize path separators
          name: item
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

function formatFileContent(file) {
  try {
    const content = fs.readFileSync(file.path, 'utf-8');
    const separator = '='.repeat(60);
    
    return `${separator}
FILE: ${file.relativePath}
${separator}

${content}

`;
  } catch (error) {
    return `${separator}
FILE: ${file.relativePath}
${separator}

[Error reading file: ${error.message}]

`;
  }
}

async function copyToClipboard(text) {
  try {
    await clipboardy.write(text);
  } catch (error) {
    throw new Error(`Failed to copy to clipboard: ${error.message}`);
  }
}

function main() {
  console.log('🔍 Scanning backend codebase...');
  
  const files = getAllFiles(__dirname);
  
  if (files.length === 0) {
    console.log('❌ No files found to copy');
    return;
  }
  
  console.log(`📁 Found ${files.length} files:`);
  files.forEach(file => console.log(`   ${file.relativePath}`));
  
  console.log('\n📋 Copying to clipboard...');
  
  let output = `BACKEND CODEBASE CONTENTS
Generated: ${new Date().toISOString()}
Total files: ${files.length}

`;
  
  // Sort files for consistent output
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  
  for (const file of files) {
    output += formatFileContent(file);
  }
  
  copyToClipboard(output)
    .then(() => {
      console.log('✅ Backend codebase copied to clipboard successfully!');
      console.log(`📊 Total characters: ${output.length.toLocaleString()}`);
    })
    .catch((error) => {
      console.error('❌ Failed to copy to clipboard:', error.message);
      console.log('\n📝 Output content:');
      console.log(output);
    });
}

main();