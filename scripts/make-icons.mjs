import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const svgPath = 'build/icons-concepts/icon-05-seal.svg';
const outDir = 'build/icons';
mkdirSync(outDir, { recursive: true });

const sizes = [16, 32, 48, 64, 128, 256];
const svg = readFileSync(svgPath);

const pngBuffers = [];
for (const size of sizes) {
  const buf = await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toBuffer();
  writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  pngBuffers.push({ size, buf });
  console.log('png', size);
}

// ICO: PNG-encoded entries (Vista+)
function buildIco(entries) {
  const count = entries.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * count;
  const dirs = [];
  const blobs = [];
  for (const { size, buf } of entries) {
    const w = size >= 256 ? 0 : size;
    const h = size >= 256 ? 0 : size;
    dirs.push({
      w,
      h,
      colors: 0,
      reserved: 0,
      planes: 1,
      bitCount: 32,
      bytesInRes: buf.length,
      offset,
    });
    blobs.push(buf);
    offset += buf.length;
  }
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const dirBuf = Buffer.alloc(entrySize * count);
  dirs.forEach((d, i) => {
    const base = i * entrySize;
    dirBuf.writeUInt8(d.w, base);
    dirBuf.writeUInt8(d.h, base + 1);
    dirBuf.writeUInt8(d.colors, base + 2);
    dirBuf.writeUInt8(d.reserved, base + 3);
    dirBuf.writeUInt16LE(d.planes, base + 4);
    dirBuf.writeUInt16LE(d.bitCount, base + 6);
    dirBuf.writeUInt32LE(d.bytesInRes, base + 8);
    dirBuf.writeUInt32LE(d.offset, base + 12);
  });
  return Buffer.concat([header, dirBuf, ...blobs]);
}

// Prefer largest for sharp quality - rebuild all sizes from 256 source for crispness
const sharpPngs = [];
for (const size of sizes) {
  const buf = await sharp(svg, { density: 600 }).resize(size, size).png().toBuffer();
  sharpPngs.push({ size, buf });
}

const ico = buildIco(sharpPngs);
writeFileSync(path.join(outDir, 'icon.ico'), ico);
// also 512 master for other platforms
const master = await sharp(svg, { density: 600 }).resize(512, 512).png().toBuffer();
writeFileSync(path.join(outDir, 'icon.png'), master);
console.log('ico + png done', path.join(outDir, 'icon.ico'));
