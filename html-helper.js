/**
 * HTML Helper for Media Manager
 * 
 * Generates optimized HTML image tags with responsive images, 
 * lazy loading, and proper alt text for your portfolio.
 */

const fs = require('fs-extra');
const path = require('path');
const config = require('./media.config.js');

// Generate responsive image HTML
function generateResponsiveImage(src, alt, className = '', width = null, height = null) {
  const baseName = path.parse(src).name;
  const ext = path.parse(src).ext;
  const dir = path.dirname(src);
  
  // Build srcset for responsive images
  let srcset = '';
  let webpSrcset = '';
  
  if (config.image.responsiveSizes) {
    srcset = config.image.responsiveSizes
      .map(size => `${dir}/${baseName}-${size}w${ext} ${size}w`)
      .join(', ');
    
    webpSrcset = config.image.responsiveSizes
      .map(size => `${dir}/${baseName}-${size}w.webp ${size}w`)
      .join(', ');
  }
  
  // Build sizes attribute (you can customize this based on your layout)
  const sizes = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
  
  // Build HTML
  let html = `<picture>`;
  
  // WebP source for modern browsers
  if (config.image.formats.includes('webp')) {
    html += `\n  <source srcset="${webpSrcset}" sizes="${sizes}" type="image/webp">`;
  }
  
  // AVIF source for advanced browsers
  if (config.image.formats.includes('avif')) {
    const avifSrcset = config.image.responsiveSizes
      .map(size => `${dir}/${baseName}-${size}w.avif ${size}w`)
      .join(', ');
    html += `\n  <source srcset="${avifSrcset}" sizes="${sizes}" type="image/avif">`;
  }
  
  // Fallback to original image
  html += `\n  <img src="${src}"`;
  
  if (srcset) {
    html += ` srcset="${srcset}"`;
  }
  
  html += ` sizes="${sizes}"`;
  html += ` alt="${alt}"`;
  
  if (className) {
    html += ` class="${className}"`;
  }
  
  if (width) {
    html += ` width="${width}"`;
  }
  
  if (height) {
    html += ` height="${height}"`;
  }
  
  // Add lazy loading
  html += ` loading="lazy"`;
  
  // Add decoding for better performance
  html += ` decoding="async"`;
  
  html += ` style="max-width: 100%; height: auto;">`;
  
  html += `\n</picture>`;
  
  return html;
}

// Generate simple image tag (for cases where picture element isn't needed)
function generateSimpleImage(src, alt, className = '', width = null, height = null) {
  let html = `<img src="${src}"`;
  html += ` alt="${alt}"`;
  
  if (className) {
    html += ` class="${className}"`;
  }
  
  if (width) {
    html += ` width="${width}"`;
  }
  
  if (height) {
    html += ` height="${height}"`;
  }
  
  html += ` loading="lazy"`;
  html += ` decoding="async"`;
  html += ` style="max-width: 100%; height: auto;">`;
  
  return html;
}

// Generate video HTML with fallbacks
function generateVideo(src, poster = '', className = '', width = null, height = null) {
  let html = `<video`;
  
  if (className) {
    html += ` class="${className}"`;
  }
  
  if (width) {
    html += ` width="${width}"`;
  }
  
  if (height) {
    html += ` height="${height}"`;
  }
  
  html += ` controls preload="metadata"`;
  
  if (poster) {
    html += ` poster="${poster}"`;
  }
  
  html += `>`;
  
  // Multiple source formats
  const baseName = path.parse(src).name;
  const dir = path.dirname(src);
  
  // MP4 source (most compatible)
  html += `\n  <source src="${src}" type="video/mp4">`;
  
  // WebM source for Firefox
  html += `\n  <source src="${dir}/${baseName}.webm" type="video/webm">`;
  
  html += `\n  Your browser does not support the video tag.`;
  html += `\n</video>`;
  
  return html;
}

// Generate CSS for image optimization
function generateImageCSS() {
  return `
/* Image Optimization Styles */
img, picture img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Lazy loading placeholder */
img[loading="lazy"] {
  opacity: 0;
  transition: opacity 0.3s ease;
}

img[loading="lazy"][src] {
  opacity: 1;
}

/* Responsive image containers */
.responsive-image {
  position: relative;
  overflow: hidden;
}

.responsive-image img {
  transition: transform 0.3s ease;
}

.responsive-image:hover img {
  transform: scale(1.05);
}

/* Video optimization */
video {
  max-width: 100%;
  height: auto;
  background-color: #000;
}

/* High DPI support */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  img[srcset] {
    image-rendering: -webkit-optimize-contrast;
  }
}`;
}

// Generate example HTML snippets
function generateExamples() {
  const examples = {
    heroImage: generateResponsiveImage(
      'images/hero-docsbird.png',
      'DocsBird hero image showing the product interface',
      'hero-image'
    ),
    
    caseStudyImage: generateResponsiveImage(
      'images/case-Docsbird.png',
      'DocsBird case study cover image',
      'case-image'
    ),
    
    simpleImage: generateSimpleImage(
      'images/about-me.jpg',
      'Photo of Polina Tsoy, Product Designer',
      'profile-photo'
    ),
    
    videoExample: generateVideo(
      'videos/demo.mp4',
      'images/video-poster.jpg',
      'demo-video'
    )
  };
  
  return examples;
}

// Export functions
module.exports = {
  generateResponsiveImage,
  generateSimpleImage,
  generateVideo,
  generateImageCSS,
  generateExamples
};

// If run directly, show examples
if (require.main === module) {
  console.log('=== HTML Helper Examples ===\n');
  
  const examples = generateExamples();
  
  console.log('1. Hero Image (Responsive):');
  console.log(examples.heroImage);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('2. Case Study Image (Responsive):');
  console.log(examples.caseStudyImage);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('3. Simple Image:');
  console.log(examples.simpleImage);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('4. Video with Fallbacks:');
  console.log(examples.videoExample);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('5. CSS for Image Optimization:');
  console.log(generateImageCSS());
}