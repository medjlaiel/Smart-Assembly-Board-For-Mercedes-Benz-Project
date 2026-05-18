/**
 * Generate a simple robot icon PNG for the AI Assistant tab.
 * Run: node scripts/generate_robot_icon.js
 */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const SIZE = 36;
const pixels = Buffer.alloc(SIZE * SIZE * 4, 0); // RGBA

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const idx = (y * SIZE + x) * 4;
  pixels[idx] = r;
  pixels[idx + 1] = g;
  pixels[idx + 2] = b;
  pixels[idx + 3] = a;
}

function fillRect(x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setPixel(x, y, r, g, b, a);
    }
  }
}

function fillCircle(cx, cy, radius, r, g, b, a = 255) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= radius) {
        setPixel(x, y, r, g, b, a);
      }
    }
  }
}

// Primary color #20B2AA
const R = 0x20, G = 0xB2, B = 0xAA;

// Robot head (main rectangle)
fillRect(6, 6, 29, 25, R, G, B);

// Antenna
fillRect(17, 2, 18, 5, R, G, B);
fillCircle(17, 2, 2, R, G, B);

// Eyes (white circles)
fillCircle(13, 14, 3, 255, 255, 255);
fillCircle(22, 14, 3, 255, 255, 255);

// Eye pupils (dark)
fillCircle(13, 14, 1.5, 0x0F, 0x17, 0x2A);
fillCircle(22, 14, 1.5, 0x0F, 0x17, 0x2A);

// Mouth (rectangle)
fillRect(13, 20, 22, 21, 255, 255, 255);

// Body below head
fillRect(10, 26, 25, 29, R, G, B);

// Arms
fillRect(4, 16, 5, 25, R, G, B);
fillRect(30, 16, 31, 25, R, G, B);

// Create PNG
function createPNG(width, height, pixelData) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx] = pixelData[srcIdx];
      rawData[dstIdx + 1] = pixelData[srcIdx + 1];
      rawData[dstIdx + 2] = pixelData[srcIdx + 2];
      rawData[dstIdx + 3] = pixelData[srcIdx + 3];
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const png = createPNG(SIZE, SIZE, pixels);
const outputPath = path.join(__dirname, '..', 'app', 'src', 'assets', 'ai-assistant.png');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, png);
console.log('Robot icon created at:', outputPath);