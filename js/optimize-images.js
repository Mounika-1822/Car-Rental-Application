/**
 * Image Optimizer Script
 * This script compresses the product images to lower quality versions
 * to improve page load performance.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directory containing the product images
const imagesDir = path.join(__dirname, '../images');

// Output directory for optimized images (using the same directory)
const outputDir = imagesDir;

// Quality setting for JPEG compression (lower = smaller file size, lower quality)
const QUALITY = 30; // Very low quality as requested

// Width for resizing (smaller dimensions = smaller file size)
const WIDTH = 400;

// Function to optimize an image
async function optimizeImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(WIDTH) // Resize to specified width
      .jpeg({ quality: QUALITY }) // Compress with low quality
      .toFile(outputPath + '.temp');
    
    // Replace original with optimized version
    fs.renameSync(outputPath + '.temp', outputPath);
    
    const stats = fs.statSync(outputPath);
    console.log(`Optimized: ${path.basename(outputPath)} - ${Math.round(stats.size / 1024)}KB`);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
  }
}

// Process all product images
async function optimizeAllImages() {
  try {
    const files = fs.readdirSync(imagesDir);
    
    // Filter for product image files
    const productImages = files.filter(file => 
      file.startsWith('product-') && file.endsWith('.jpg')
    );
    
    console.log(`Found ${productImages.length} product images to optimize`);
    
    // Process each image
    for (const file of productImages) {
      const inputPath = path.join(imagesDir, file);
      const outputPath = path.join(outputDir, file);
      
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      console.log(`Original: ${file} - ${Math.round(originalStats.size / 1024)}KB`);
      
      await optimizeImage(inputPath, outputPath);
    }
    
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error during image optimization:', error);
  }
}

// Run the optimization
optimizeAllImages();
