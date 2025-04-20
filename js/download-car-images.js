const fs = require('fs');
const https = require('https');
const path = require('path');

// Car image URLs from various free sources
const carImages = [
  {
    id: 1,
    title: "Red Sports Car",
    url: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Luxury Black Car",
    url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Classic Car",
    url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Modern SUV",
    url: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "White Sedan",
    url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Blue Sports Car",
    url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 7,
    title: "Vintage Car",
    url: "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 8,
    title: "Luxury Interior",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop"
  }
];

// Function to download an image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filename);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filename, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Create car-images directory if it doesn't exist
const carImagesDir = path.join(__dirname, '../images/cars');
if (!fs.existsSync(carImagesDir)) {
  fs.mkdirSync(carImagesDir, { recursive: true });
  console.log('Created car-images directory');
}

// Download all car images
async function downloadAllCarImages() {
  console.log('Starting download of car images...');
  
  for (const car of carImages) {
    const filename = path.join(carImagesDir, `car-${car.id}.jpg`);
    try {
      await downloadImage(car.url, filename);
    } catch (error) {
      console.error(`Error downloading ${car.title}:`, error.message);
    }
  }
  
  console.log('All car downloads completed!');
}

downloadAllCarImages();
