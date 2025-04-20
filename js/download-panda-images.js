/**
 * Panda-themed Image Downloader
 * This script downloads panda-themed images for the car rental website
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Array of panda-themed image URLs
const pandaImages = [
  {
    id: 'hero-bg',
    name: "Panda Hero Background",
    url: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef3?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTh8fGN1dGUlMjBwYW5kYXxlbnwwfHx8fDE3NDUwMDE4MDB8MA&w=1920&q=80"
  },
  {
    id: 'panda-logo',
    name: "Panda Logo",
    url: "https://images.unsplash.com/photo-1566487097168-e91a4f38bee2?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTZ8fGN1dGUlMjBwYW5kYXxlbnwwfHx8fDE3NDUwMDE4MDB8MA&w=200&q=80"
  },
  {
    id: 'panda-car-1',
    name: "Panda Car 1",
    url: "https://images.unsplash.com/photo-1612692259003-d53cbd3f35e1?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTl8fGN1dGUlMjBwYW5kYXxlbnwwfHx8fDE3NDUwMDE4MDB8MA&w=800&q=80"
  },
  {
    id: 'panda-car-2',
    name: "Panda Car 2",
    url: "https://images.unsplash.com/photo-1525382455947-f319bc05fb35?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8cGFuZGF8ZW58MHx8fHwxNzQ0OTA0ODA3fDA&w=800&q=80"
  },
  {
    id: 'panda-car-3',
    name: "Panda Car 3",
    url: "https://images.unsplash.com/photo-1527118732049-c88155f2107c?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8cGFuZGF8ZW58MHx8fHwxNzQ0OTA0ODA3fDA&w=800&q=80"
  },
  {
    id: 'panda-bamboo-1',
    name: "Panda with Bamboo",
    url: "https://images.unsplash.com/photo-1470093851219-69951fcbb533?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTB8fHBhbmRhfGVufDB8fHx8MTc0NDkwNDgwN3ww&w=800&q=80"
  },
  {
    id: 'panda-cute-1',
    name: "Cute Panda",
    url: "https://images.unsplash.com/photo-1617553603954-d02293d2dbb8?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTZ8fHBhbmRhfGVufDB8fHx8MTc0NDkwNDgwN3ww&w=800&q=80"
  },
  {
    id: 'panda-sleeping',
    name: "Sleeping Panda",
    url: "https://images.unsplash.com/photo-1591382386627-349b692688ff?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NXx8cGFuZGF8ZW58MHx8fHwxNzQ0OTA0ODA3fDA&w=800&q=80"
  }
];

// Function to download an image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded: ${filepath}`);
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete the file if there was an error
          console.error(`Error writing to file: ${filepath}`, err);
          reject(err);
        });
      } else {
        console.error(`Failed to download ${url}, status code: ${response.statusCode}`);
        reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${url}:`, err);
      reject(err);
    });
  });
}

// Main function to download all images
async function downloadAllImages() {
  const imagesDir = path.join(__dirname, '../images');
  
  // Create images directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`Created directory: ${imagesDir}`);
  }
  
  console.log('Starting download of panda-themed images...');
  
  // Download each image
  for (const image of pandaImages) {
    const filepath = path.join(imagesDir, `panda-${image.id}.jpg`);
    
    try {
      await downloadImage(image.url, filepath);
    } catch (error) {
      console.error(`Failed to download image ${image.id}:`, error);
    }
  }
  
  console.log('All panda-themed images downloaded successfully!');
}

// Run the download function
downloadAllImages().catch(err => {
  console.error('Error in main download process:', err);
});
