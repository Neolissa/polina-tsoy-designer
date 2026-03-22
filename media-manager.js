#!/usr/bin/env node

/**
 * Portfolio Media Manager
 * 
 * Automated image and video processing system for portfolio websites.
 * Handles optimization, responsive images, organization, and backup.
 */

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const chokidar = require('chokidar');
const { glob } = require('glob');
const { SingleBar } = require('cli-progress');
const chalk = require('chalk').default;
const { Command } = require('commander');
const mime = require('mime-types');
const fastGlob = require('fast-glob');

// Load configuration
const config = require('./media.config.js');

// Initialize command line interface
const program = new Command();

// Utility functions
const utils = {
  // Format file size in human readable format
  formatBytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Generate alt text from filename
  generateAltText: (filename) => {
    const name = path.parse(filename).name;
    // Convert kebab-case and snake_case to readable text
    const readable = name
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    return `${config.seo.altPrefix}${readable}`;
  },

  // Create directory if it doesn't exist
  ensureDir: async (dir) => {
    await fs.ensureDir(dir);
  },

  // Get file extension
  getFileExtension: (filename) => {
    return path.extname(filename).toLowerCase();
  },

  // Check if file is an image
  isImage: (filename) => {
    const ext = utils.getFileExtension(filename);
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'].includes(ext);
  },

  // Check if file is a video
  isVideo: (filename) => {
    const ext = utils.getFileExtension(filename);
    return ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
  },

  // Check if file is a PDF
  isPDF: (filename) => {
    return utils.getFileExtension(filename) === '.pdf';
  }
};

// Media processing functions
const processor = {
  // Process a single image file
  processImage: async (sourcePath, outputPath, filename) => {
    try {
      const image = sharp(sourcePath);
      const metadata = await image.metadata();
      
      // Create output directory
      await utils.ensureDir(path.dirname(outputPath));
      
      // Generate optimized versions
      const tasks = [];
      
      // 1. Generate responsive sizes
      for (const size of config.image.responsiveSizes) {
        if (metadata.width && metadata.width > size) {
          const responsivePath = outputPath.replace(
            path.extname(outputPath),
            `${config.naming.responsiveSuffix.replace('{width}', size)}${path.extname(outputPath)}`
          );
          
          tasks.push(
            image
              .resize(size, null, { 
                withoutEnlargement: true,
                fit: 'inside'
              })
              .jpeg({ quality: config.image.quality.jpeg })
              .toFile(responsivePath)
          );
        }
      }
      
      // 2. Generate WebP version
      if (config.image.formats.includes('webp')) {
        const webpPath = outputPath.replace(path.extname(outputPath), '.webp');
        tasks.push(
          image
            .webp({ quality: config.image.quality.webp })
            .toFile(webpPath)
        );
      }
      
      // 3. Generate AVIF version
      if (config.image.formats.includes('avif')) {
        const avifPath = outputPath.replace(path.extname(outputPath), '.avif');
        tasks.push(
          image
            .avif({ quality: config.image.quality.avif })
            .toFile(avifPath)
        );
      }
      
      // 4. Generate optimized main version
      const quality = metadata.format === 'png' ? config.image.quality.png : config.image.quality.jpeg;
      tasks.push(
        image
          .jpeg({ quality })
          .png({ quality })
          .toFile(outputPath)
      );
      
      await Promise.all(tasks);
      
      return {
        success: true,
        originalSize: metadata.size,
        outputPath: outputPath
      };
    } catch (error) {
      console.error(chalk.red(`Error processing image ${filename}:`), error.message);
      return { success: false, error: error.message };
    }
  },

  // Process a single video file (placeholder - would need ffmpeg)
  processVideo: async (sourcePath, outputPath, filename) => {
    // For now, just copy the file with a message
    // In a full implementation, this would use ffmpeg for compression
    console.log(chalk.yellow(`Video processing for ${filename} would require ffmpeg setup`));
    await fs.copy(sourcePath, outputPath);
    return { success: true, outputPath };
  },

  // Process a single PDF file
  processPDF: async (sourcePath, outputPath, filename) => {
    // For PDFs, just copy to processed folder for now
    await fs.copy(sourcePath, outputPath);
    return { success: true, outputPath };
  },

  // Main processing function
  processFile: async (sourcePath, relativePath) => {
    const filename = path.basename(sourcePath);
    const ext = utils.getFileExtension(filename);
    
    // Determine output path based on organization settings
    let outputPath = path.join(config.paths.processed, relativePath);
    
    if (config.organization.byType) {
      const typeDir = utils.isImage(filename) ? 'images' : utils.isVideo(filename) ? 'videos' : 'documents';
      outputPath = path.join(config.paths.processed, typeDir, relativePath);
    }
    
    // Create backup
    if (config.backup.keepOriginals) {
      const backupPath = path.join(config.paths.originals, relativePath);
      await utils.ensureDir(path.dirname(backupPath));
      await fs.copy(sourcePath, backupPath);
    }
    
    let result;
    
    if (utils.isImage(filename)) {
      result = await processor.processImage(sourcePath, outputPath, filename);
    } else if (utils.isVideo(filename)) {
      result = await processor.processVideo(sourcePath, outputPath, filename);
    } else if (utils.isPDF(filename)) {
      result = await processor.processPDF(sourcePath, outputPath, filename);
    } else {
      // For other files, just copy
      await utils.ensureDir(path.dirname(outputPath));
      await fs.copy(sourcePath, outputPath);
      result = { success: true, outputPath };
    }
    
    return result;
  }
};

// Main processing function
const processMedia = async (sourceDir) => {
  // Handle Commander.js passing an object instead of string
  if (typeof sourceDir !== 'string') {
    sourceDir = config.paths.source;
  }
  console.log(chalk.blue('🚀 Starting media processing...'));
  
  // Ensure all directories exist
  await utils.ensureDir(config.paths.processed);
  if (config.backup.keepOriginals) {
    await utils.ensureDir(config.paths.originals);
  }
  
  // Find all media files
  const patterns = [
    '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', 
    '**/*.webp', '**/*.avif', '**/*.svg',
    '**/*.mp4', '**/*.webm', '**/*.mov', '**/*.avi',
    '**/*.pdf'
  ];
  
  // Use recursive file search to find all media files
  const files = [];
  
  const searchDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.mp4', '.webm', '.mov', '.avi', '.pdf'];
        
        if (validExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  };
  
  console.log('Searching in directory:', sourceDir);
  searchDir(sourceDir);
  
  if (files.length === 0) {
    console.log(chalk.yellow('No media files found to process.'));
    return;
  }
  
  console.log(chalk.blue(`Found ${files.length} files to process`));
  
  // Process files with progress bar
  const progressBar = new SingleBar({
    format: 'Processing [{bar}] {percentage}% | {value}/{total} files | {filename}',
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true
  });
  
  progressBar.start(files.length, 0, { filename: '' });
  
  let processed = 0;
  let successful = 0;
  let failed = 0;
  
  for (const file of files) {
    const relativePath = path.relative(sourceDir, file);
    const result = await processor.processFile(file, relativePath);
    
    progressBar.update(++processed, { filename: path.basename(file) });
    
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }
  
  progressBar.stop();
  
  console.log(chalk.green(`✅ Processing complete!`));
  console.log(chalk.green(`   Successful: ${successful}`));
  console.log(chalk.red(`   Failed: ${failed}`));
};

// Watch for changes
const watchMedia = async () => {
  console.log(chalk.blue('👀 Watching for media changes...'));
  
  const watcher = chokidar.watch(config.paths.source, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });
  
  watcher
    .on('add', async (path) => {
      console.log(chalk.green(`➕ New file detected: ${path}`));
      await processor.processFile(path, path.replace(config.paths.source + '/', ''));
    })
    .on('change', async (path) => {
      console.log(chalk.yellow(`📝 File changed: ${path}`));
      await processor.processFile(path, path.replace(config.paths.source + '/', ''));
    })
    .on('error', (error) => console.error(chalk.red(`Watcher error: ${error}`)));
};

// Clean processed files
const cleanMedia = async () => {
  console.log(chalk.blue('🧹 Cleaning processed media files...'));
  
  if (await fs.pathExists(config.paths.processed)) {
    await fs.remove(config.paths.processed);
    console.log(chalk.green('✅ Processed files cleaned'));
  }
  
  if (await fs.pathExists(config.paths.originals)) {
    await fs.remove(config.paths.originals);
    console.log(chalk.green('✅ Backup files cleaned'));
  }
};

// Create backup
const createBackup = async () => {
  console.log(chalk.blue('💾 Creating backup...'));
  
  await utils.ensureDir(config.paths.originals);
  
  const files = await fastGlob('**/*', { 
    cwd: config.paths.source,
    absolute: true 
  });
  
  for (const file of files) {
    const relativePath = path.relative(config.paths.source, file);
    const backupPath = path.join(config.paths.originals, relativePath);
    await utils.ensureDir(path.dirname(backupPath));
    await fs.copy(file, backupPath);
  }
  
  console.log(chalk.green('✅ Backup created'));
};

// Show help
const showHelp = () => {
  console.log(chalk.blue('Portfolio Media Manager'));
  console.log('');
  console.log('Available commands:');
  console.log('  npm run media:process    - Process all media files');
  console.log('  npm run media:watch      - Watch for changes and process automatically');
  console.log('  npm run media:clean      - Clean processed and backup files');
  console.log('  npm run media:backup     - Create backup of source files');
  console.log('  npm run media:optimize   - Optimize existing processed files');
  console.log('  npm run media:help       - Show this help');
  console.log('');
  console.log('Configuration is in media.config.js');
};

// CLI setup
program
  .name('media-manager')
  .description('Automated image and video management for portfolio websites')
  .version('1.0.0');

program
  .command('process')
  .description('Process all media files')
  .action(processMedia);

program
  .command('watch')
  .description('Watch for changes and process automatically')
  .action(watchMedia);

program
  .command('clean')
  .description('Clean processed and backup files')
  .action(cleanMedia);

program
  .command('backup')
  .description('Create backup of source files')
  .action(createBackup);

program
  .command('help')
  .description('Show help')
  .action(showHelp);

// Handle optimize command (would implement advanced optimization)
program
  .command('optimize')
  .description('Optimize existing processed files')
  .action(async () => {
    console.log(chalk.blue('🔧 Advanced optimization would run here'));
    console.log(chalk.yellow('This would implement additional compression and optimization'));
  });

// Parse arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  showHelp();
}