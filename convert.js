const fs = require('fs');
const sharp = require('sharp');

async function process() {
  await sharp('public/icon.png')
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');
    
  await sharp('public/icon.png')
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');
    
  console.log('Successfully generated exact 512x512 and 192x192 PNG files!');
}

process().catch(console.error);
