#!/usr/bin/env node

/**
 * Setup Script for Portfolio Media Manager
 * 
 * This script helps you install and configure the media management system.
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk').default;

console.log(chalk.blue('🚀 Setting up Portfolio Media Manager...'));

// Check if Node.js is installed
try {
  const nodeVersion = process.version;
  console.log(chalk.green(`✅ Node.js ${nodeVersion} detected`));
} catch (error) {
  console.log(chalk.red('❌ Node.js is not installed. Please install Node.js first.'));
  process.exit(1);
}

// Check if package.json exists
if (!fs.existsSync('./package.json')) {
  console.log(chalk.yellow('⚠️  package.json not found. Creating a basic one...'));
  
  const basicPackage = {
    "name": "portfolio-media-manager",
    "version": "1.0.0",
    "description": "Automated image and video management system for portfolio website",
    "main": "media-manager.js",
    "scripts": {
      "media:process": "node media-manager.js process",
      "media:watch": "node media-manager.js watch",
      "media:clean": "node media-manager.js clean",
      "media:backup": "node media-manager.js backup",
      "media:optimize": "node media-manager.js optimize",
      "media:help": "node media-manager.js help"
    },
    "keywords": ["media", "images", "optimization", "portfolio", "automation"],
    "author": "Your Name",
    "license": "MIT",
    "dependencies": {
      "sharp": "^0.33.5",
      "chokidar": "^3.6.0",
      "glob": "^10.4.5",
      "fs-extra": "^11.3.0",
      "cli-progress": "^3.12.0",
      "chalk": "^5.3.0",
      "commander": "^12.1.0",
      "mime-types": "^2.1.35",
      "fast-glob": "^3.3.2"
    }
  };
  
  fs.writeFileSync('./package.json', JSON.stringify(basicPackage, null, 2));
  console.log(chalk.green('✅ Created package.json'));
}

// Install dependencies
console.log(chalk.blue('📦 Installing dependencies...'));
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log(chalk.green('✅ Dependencies installed successfully'));
} catch (error) {
  console.log(chalk.red('❌ Failed to install dependencies'));
  console.log(error.message);
  process.exit(1);
}

// Create necessary directories
const config = require('./media.config.js');

console.log(chalk.blue('📁 Creating directories...'));

const dirsToCreate = [
  config.paths.processed,
  config.paths.originals,
  path.join(config.paths.processed, 'images'),
  path.join(config.paths.processed, 'videos'),
  path.join(config.paths.processed, 'documents')
];

dirsToCreate.forEach(dir => {
  try {
    fs.ensureDirSync(dir);
    console.log(chalk.green(`✅ Created directory: ${dir}`));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to create directory: ${dir}`));
  }
});

// Create .gitignore entries for processed files
const gitignorePath = './.gitignore';
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

const mediaManagerEntries = [
  '# Media Manager',
  config.paths.processed + '/',
  config.paths.originals + '/',
  'node_modules/',
  '*.log',
  '.DS_Store'
];

const newEntries = mediaManagerEntries.filter(entry => !gitignoreContent.includes(entry));

if (newEntries.length > 0) {
  gitignoreContent += '\n' + newEntries.join('\n');
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log(chalk.green('✅ Updated .gitignore with media manager entries'));
}

// Make media-manager.js executable
try {
  fs.chmodSync('./media-manager.js', '755');
  console.log(chalk.green('✅ Made media-manager.js executable'));
} catch (error) {
  console.log(chalk.yellow('⚠️  Could not make media-manager.js executable (this is optional)'));
}

// Create a README for the media manager
const readmeContent = `# Portfolio Media Manager

Automated image and video management system for your portfolio website.

## Quick Start

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Process All Media Files
\`\`\`bash
npm run media:process
\`\`\`

### Watch for Changes (Auto-Process)
\`\`\`bash
npm run media:watch
\`\`\`

### Clean Processed Files
\`\`\`bash
npm run media:clean
\`\`\`

## Commands

- \`npm run media:process\` - Process all media files in the source directory
- \`npm run media:watch\` - Watch for changes and process automatically
- \`npm run media:clean\` - Clean processed and backup files
- \`npm run media:backup\` - Create backup of source files
- \`npm run media:optimize\` - Optimize existing processed files
- \`npm run media:help\` - Show help

## Configuration

Edit \`media.config.js\` to customize:
- Image quality settings
- Responsive image sizes
- Output directories
- File organization
- SEO settings

## File Structure

\`\`\`
images/                    # Your original files (source)
├── case-Docsbird.png
├── hero-docsbird.png
└── ...

images-processed/         # Optimized files (output)
├── images/
│   ├── case-Docsbird.png
│   ├── case-Docsbird-400w.png
│   ├── case-Docsbird-800w.png
│   ├── case-Docsbird.webp
│   └── ...
└── videos/
    └── ...

images-originals/         # Backup of originals
└── case-Docsbird.png
\`\`\`

## Usage Workflow

1. **Add new files** to the \`images/\` directory
2. **Run processing**: \`npm run media:process\`
3. **Use processed files** in your HTML from \`images-processed/\`
4. **Optional**: Run \`npm run media:watch\` for automatic processing

## HTML Helper

Use \`node html-helper.js\` to generate optimized HTML image tags with:
- Responsive images (srcset)
- WebP/AVIF fallbacks
- Lazy loading
- Proper alt text

## Benefits

- **Faster loading**: Optimized images load quicker
- **Better SEO**: Proper alt text and image descriptions
- **Mobile optimization**: Responsive images for all devices
- **Easy maintenance**: Simple commands for all operations
- **Backup safety**: Original files are preserved

## Troubleshooting

### Sharp Installation Issues
If you get Sharp installation errors:
\`\`\`bash
npm install --force sharp
\`\`\`

### Permission Issues
On macOS/Linux, if you get permission errors:
\`\`\`bash
chmod +x media-manager.js
\`\`\`

### Configuration Problems
Check \`media.config.js\` for correct paths and settings.

## Support

For issues or questions, check the configuration file and ensure all paths are correct.
`;

fs.writeFileSync('./MEDIA-MANAGER-README.md', readmeContent);
console.log(chalk.green('✅ Created MEDIA-MANAGER-README.md'));

// Final instructions
console.log('\n' + '='.repeat(60));
console.log(chalk.green('🎉 Setup Complete!'));
console.log('');
console.log(chalk.blue('Next steps:'));
console.log('1. Review media.config.js and adjust settings if needed');
console.log('2. Run "npm run media:process" to process existing images');
console.log('3. Use "npm run media:watch" for automatic processing');
console.log('4. Check MEDIA-MANAGER-README.md for detailed usage');
console.log('');
console.log(chalk.yellow('💡 Tip: Run "node html-helper.js" to see HTML examples'));
console.log('='.repeat(60));