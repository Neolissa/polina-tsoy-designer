# Portfolio Media Manager

Automated image and video management system for your portfolio website.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Process All Media Files
```bash
npm run media:process
```

### Watch for Changes (Auto-Process)
```bash
npm run media:watch
```

### Clean Processed Files
```bash
npm run media:clean
```

## Commands

- `npm run media:process` - Process all media files in the source directory
- `npm run media:watch` - Watch for changes and process automatically
- `npm run media:clean` - Clean processed and backup files
- `npm run media:backup` - Create backup of source files
- `npm run media:optimize` - Optimize existing processed files
- `npm run media:help` - Show help

## Configuration

Edit `media.config.js` to customize:
- Image quality settings
- Responsive image sizes
- Output directories
- File organization
- SEO settings

## File Structure

```
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
```

## Usage Workflow

1. **Add new files** to the `images/` directory
2. **Run processing**: `npm run media:process`
3. **Use processed files** in your HTML from `images-processed/`
4. **Optional**: Run `npm run media:watch` for automatic processing

## HTML Helper

Use `node html-helper.js` to generate optimized HTML image tags with:
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
```bash
npm install --force sharp
```

### Permission Issues
On macOS/Linux, if you get permission errors:
```bash
chmod +x media-manager.js
```

### Configuration Problems
Check `media.config.js` for correct paths and settings.

## Support

For issues or questions, check the configuration file and ensure all paths are correct.
