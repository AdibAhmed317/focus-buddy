import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sizes = [16, 32, 48, 128];

async function generateIcons() {
  const sourcePath = path.resolve(__dirname, '../public/logo.png');

  for (const size of sizes) {
    const outputPath = path.resolve(__dirname, `../public/icon-${size}.png`);
    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated icon-${size}.png`);
  }
}

generateIcons().catch(console.error);
