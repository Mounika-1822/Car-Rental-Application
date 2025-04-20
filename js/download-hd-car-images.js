/**
 * HD Car Image Downloader
 * This script downloads high-quality car images and saves them to the images folder
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Array of HD car image URLs
const hdCarImages = [
  {
    id: 1,
    name: "Red Sports Car",
    url: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FyfGVufDB8fDB8fHww&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    name: "Classic Vintage Car",
    url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyfGVufDB8fDB8fHww&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    name: "Modern SUV",
    url: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    name: "Luxury Sedan",
    url: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2FyfGVufDB8fDB8fHww&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 5,
    name: "Electric Vehicle",
    url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGNhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 6,
    name: "Sports Coupe",
    url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyfGVufDB8fDB8fHww&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 7,
    name: "Off-road Vehicle",
    url: "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGNhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 8,
    name: "Convertible",
    url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 9,
    name: "Muscle Car",
    url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2FyfGVufDB8fDB8fHww&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 10,
    name: "Compact Car",
    url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1200&q=80"
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
  
  console.log('Starting download of HD car images...');
  
  // Download each image
  for (const image of hdCarImages) {
    const filepath = path.join(imagesDir, `product-${image.id}.jpg`);
    
    try {
      await downloadImage(image.url, filepath);
    } catch (error) {
      console.error(`Failed to download image ${image.id}:`, error);
    }
  }
  
  console.log('All HD car images downloaded successfully!');
}

// Run the download function
downloadAllImages().catch(err => {
  console.error('Error in main download process:', err);
});
