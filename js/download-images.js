const fs = require('fs');
const https = require('https');
const path = require('path');

// Product data from Fake Store API
const products = [
  {
    "id": 1,
    "title": "Fjallraven Backpack",
    "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
  },
  {
    "id": 2,
    "title": "Mens Casual T-Shirt",
    "image": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg"
  },
  {
    "id": 3,
    "title": "Mens Cotton Jacket",
    "image": "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg"
  },
  {
    "id": 4,
    "title": "Mens Casual Slim Fit",
    "image": "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
  },
  {
    "id": 5,
    "title": "Women's Gold Bracelet",
    "image": "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg"
  },
  {
    "id": 6,
    "title": "Gold Petite Micropave",
    "image": "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg"
  },
  {
    "id": 7,
    "title": "White Gold Princess Ring",
    "image": "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg"
  },
  {
    "id": 8,
    "title": "Rose Gold Earrings",
    "image": "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg"
  },
  {
    "id": 9,
    "title": "External Hard Drive",
    "image": "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg"
  },
  {
    "id": 10,
    "title": "SanDisk SSD",
    "image": "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg"
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

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Created images directory');
}

// Download all images
async function downloadAllImages() {
  console.log('Starting download of images...');
  
  for (const product of products) {
    const filename = path.join(imagesDir, `product-${product.id}.jpg`);
    try {
      await downloadImage(product.image, filename);
    } catch (error) {
      console.error(`Error downloading ${product.title}:`, error.message);
    }
  }
  
  console.log('All downloads completed!');
}

downloadAllImages();
