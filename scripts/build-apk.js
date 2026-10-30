const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const rootDir = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(rootDir, 'android-build');
const SHELL_DIR = path.join(BUILD_DIR, 'shell');

const JAVA_EXE = 'C:\\Program Files\\Java\\jre1.8.0_511\\bin\\java.exe';
const APKSIGNER_JAR = path.join(BUILD_DIR, 'apksigner.jar');
const KEYSTORE = path.join(BUILD_DIR, 'debug.keystore');

console.log('🚀 STARTING HABITOPS FAST ANDROID APK BUILD (v1.1.0)');

// CRC32 Lookup Table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(buf) {
  let a = 1;
  let b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function replaceAllBuffer(buf, searchBuf, replaceBuf) {
  if (searchBuf.length !== replaceBuf.length) {
    throw new Error('Search and replace buffers must have identical byte length');
  }
  const out = Buffer.from(buf);
  let idx = 0;
  while ((idx = out.indexOf(searchBuf, idx)) !== -1) {
    replaceBuf.copy(out, idx);
    idx += searchBuf.length;
  }
  return out;
}

// 1. Load & patch Android shell binaries for HabitOps (com.antigravity.habitcraf)
let manifestBuf = fs.readFileSync(path.join(SHELL_DIR, 'AndroidManifest.xml'));
manifestBuf = replaceAllBuffer(
  manifestBuf,
  Buffer.from('companion', 'utf16le'),
  Buffer.from('habitcraf', 'utf16le')
);

let arscBuf = fs.readFileSync(path.join(SHELL_DIR, 'resources.arsc'));
arscBuf = replaceAllBuffer(
  arscBuf,
  Buffer.from('Antigrav Companion', 'utf8'),
  Buffer.from('HabitOps Engine   ', 'utf8')
);
arscBuf = replaceAllBuffer(
  arscBuf,
  Buffer.from('companion', 'utf16le'),
  Buffer.from('habitcraf', 'utf16le')
);

let dexBuf = fs.readFileSync(path.join(SHELL_DIR, 'classes.dex'));
dexBuf = replaceAllBuffer(
  dexBuf,
  Buffer.from('companion', 'utf8'),
  Buffer.from('habitcraf', 'utf8')
);
dexBuf = replaceAllBuffer(
  dexBuf,
  Buffer.from('AntigravPrefs', 'utf8'),
  Buffer.from('HabitOpsPrefs', 'utf8')
);
// Recompute DEX SHA-1 signature (bytes 12..31) over bytes 32..end
const dexSha1 = crypto.createHash('sha1').update(dexBuf.subarray(32)).digest();
dexSha1.copy(dexBuf, 12);
// Recompute DEX Adler32 checksum (bytes 8..11 LE) over bytes 12..end
const dexAdler = adler32(dexBuf.subarray(12));
dexBuf.writeUInt32LE(dexAdler, 8);

const iconBuf = fs.readFileSync(path.join(SHELL_DIR, 'ic_launcher.png'));

// 2. Collect all HabitOps web files into assets/dist/...
const entries = [
  { name: 'AndroidManifest.xml', data: manifestBuf, store: false },
  { name: 'resources.arsc', data: arscBuf, store: true },
  { name: 'res/drawable/ic_launcher.png', data: iconBuf, store: true },
  { name: 'classes.dex', data: dexBuf, store: false }
];

function addWebFile(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return;
  const normalized = relPath.split(path.sep).join('/');
  const ext = path.extname(normalized).toLowerCase();
  const store = ['.png', '.jpg', '.jpeg', '.webp', '.mp3', '.wav'].includes(ext);
  let fileData = fs.readFileSync(fullPath);
  if (normalized === 'index.html') {
    const htmlStr = fileData.toString('utf8').replace(
      '</head>',
      '<script>window.HABITOPS_NATIVE_APK=true;</script></head>'
    );
    fileData = Buffer.from(htmlStr, 'utf8');
  }
  entries.push({
    name: `assets/dist/${normalized}`,
    data: fileData,
    store
  });
}

function walkDir(relDir) {
  const fullDir = path.join(rootDir, relDir);
  if (!fs.existsSync(fullDir)) return;
  for (const item of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const childRel = path.join(relDir, item.name);
    if (item.isDirectory()) {
      walkDir(childRel);
    } else {
      addWebFile(childRel);
    }
  }
}

['index.html', 'manifest.json', 'sw.js'].forEach(addWebFile);
['css', 'js', 'assets'].forEach(walkDir);

// 3. Build 4-byte ZipAligned APK in memory
const localParts = [];
const centralParts = [];
let offset = 0;

for (const entry of entries) {
  const nameBuf = Buffer.from(entry.name, 'utf8');
  const uncompressed = entry.data;
  const crc = crc32(uncompressed);
  const compressed = entry.store
    ? uncompressed
    : zlib.deflateRawSync(uncompressed, { level: 9 });
  const method = entry.store ? 0 : 8;

  // 4-byte alignment padding for uncompressed (STORED) entries
  let extraLen = 0;
  if (entry.store) {
    const dataStart = offset + 30 + nameBuf.length;
    const pad = (4 - (dataStart % 4)) % 4;
    extraLen = pad;
  }
  const extraBuf = Buffer.alloc(extraLen, 0);

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0); // signature
  localHeader.writeUInt16LE(20, 4);         // version needed
  localHeader.writeUInt16LE(0, 6);          // flags
  localHeader.writeUInt16LE(method, 8);     // compression method
  localHeader.writeUInt16LE(0, 10);         // mod time
  localHeader.writeUInt16LE(0x21, 12);      // mod date
  localHeader.writeUInt32LE(crc, 14);       // crc32
  localHeader.writeUInt32LE(compressed.length, 18);
  localHeader.writeUInt32LE(uncompressed.length, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(extraBuf.length, 28);

  const cdHeader = Buffer.alloc(46);
  cdHeader.writeUInt32LE(0x02014b50, 0);    // central dir signature
  cdHeader.writeUInt16LE(20, 4);            // version made by
  cdHeader.writeUInt16LE(20, 6);            // version needed
  cdHeader.writeUInt16LE(0, 8);             // flags
  cdHeader.writeUInt16LE(method, 10);       // compression
  cdHeader.writeUInt16LE(0, 12);            // mod time
  cdHeader.writeUInt16LE(0x21, 14);         // mod date
  cdHeader.writeUInt32LE(crc, 16);          // crc32
  cdHeader.writeUInt32LE(compressed.length, 20);
  cdHeader.writeUInt32LE(uncompressed.length, 24);
  cdHeader.writeUInt16LE(nameBuf.length, 28);
  cdHeader.writeUInt16LE(0, 30);            // extra len in CD
  cdHeader.writeUInt16LE(0, 32);            // comment len
  cdHeader.writeUInt16LE(0, 34);            // disk num
  cdHeader.writeUInt16LE(0, 36);            // internal attrs
  cdHeader.writeUInt32LE(0, 38);            // external attrs
  cdHeader.writeUInt32LE(offset, 42);       // local header offset

  localParts.push(localHeader, nameBuf, extraBuf, compressed);
  centralParts.push(cdHeader, nameBuf);

  offset += 30 + nameBuf.length + extraBuf.length + compressed.length;
}

const cdOffset = offset;
const cdBuf = Buffer.concat(centralParts);

const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(entries.length, 8);
eocd.writeUInt16LE(entries.length, 10);
eocd.writeUInt32LE(cdBuf.length, 12);
eocd.writeUInt32LE(cdOffset, 16);
eocd.writeUInt16LE(0, 20);

const alignedApkPath = path.join(BUILD_DIR, 'aligned.apk');
fs.writeFileSync(alignedApkPath, Buffer.concat([...localParts, cdBuf, eocd]));
console.log(`✓ Packaged & 4-byte aligned ${entries.length} entries (${alignedApkPath})`);

// 4. Sign with local apksigner.jar on C: drive
const finalApkPath = path.join(BUILD_DIR, 'habitops.apk');
execFileSync(
  JAVA_EXE,
  [
    '-jar', APKSIGNER_JAR,
    'sign',
    '--ks', KEYSTORE,
    '--ks-pass', 'pass:android',
    '--key-pass', 'pass:android',
    '--ks-key-alias', 'androiddebugkey',
    '--out', finalApkPath,
    alignedApkPath
  ],
  { stdio: 'inherit' }
);

// 5. Copy to project root & companion download folder for instant phone download
const rootApkPath = path.join(rootDir, 'habitops.apk');
fs.copyFileSync(finalApkPath, rootApkPath);

// Maintain legacy habitcraft.apk copy for backwards compatibility
fs.copyFileSync(finalApkPath, path.join(BUILD_DIR, 'habitcraft.apk'));
fs.copyFileSync(finalApkPath, path.join(rootDir, 'habitcraft.apk'));

const companionPublicOps = 'C:\\Users\\AUGUSTINE\\Documents\\Antigrav\\proj9-antigravapp\\public\\habitops.apk';
const companionDistOps = 'C:\\Users\\AUGUSTINE\\Documents\\Antigrav\\proj9-antigravapp\\dist\\habitops.apk';
const companionPublicCraft = 'C:\\Users\\AUGUSTINE\\Documents\\Antigrav\\proj9-antigravapp\\public\\habitcraft.apk';
const companionDistCraft = 'C:\\Users\\AUGUSTINE\\Documents\\Antigrav\\proj9-antigravapp\\dist\\habitcraft.apk';
try {
  fs.copyFileSync(finalApkPath, companionPublicOps);
  fs.copyFileSync(finalApkPath, companionPublicCraft);
  if (fs.existsSync(path.dirname(companionDistOps))) {
    fs.copyFileSync(finalApkPath, companionDistOps);
    fs.copyFileSync(finalApkPath, companionDistCraft);
  }
} catch (e) {}

const sizeKb = (fs.statSync(finalApkPath).size / 1024).toFixed(1);
console.log('=================================================================');
console.log('🎉 HABITOPS ANDROID APK COMPILED & SIGNED SUCCESSFULLY!');
console.log(`📦 APK File: ${finalApkPath}`);
console.log(`📦 Root Copy: ${rootApkPath}`);
console.log(`📊 APK Size: ${sizeKb} KB`);
console.log('=================================================================');
