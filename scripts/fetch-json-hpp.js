const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../engine/third_party');
const targetFile = path.join(targetDir, 'json.hpp');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest, cb) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      // follow redirect
      return download(res.headers.location, dest, cb);
    }
    if (res.statusCode !== 200) {
      return cb(new Error(`Download failed with HTTP ${res.statusCode}`));
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    cb(err);
  });
}

console.log('Downloading nlohmann/json single header...');
download('https://github.com/nlohmann/json/releases/download/v3.11.3/json.hpp', targetFile, (err) => {
  if (err) {
    console.error('Download error:', err.message);
    process.exit(1);
  }
  const stats = fs.statSync(targetFile);
  console.log(`json.hpp downloaded successfully! Size: ${stats.size} bytes`);
});
