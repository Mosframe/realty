// zip.js
// Node.js로 dist 폴더를 zip 파일로 압축하는 스크립트
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// package.json에서 버전 읽기
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version || 'unknown';
const zipName = `realty-v${version}.zip`;
const outputPath = path.join('dist', zipName);

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log(`${outputPath} 파일이 생성되었습니다.`);
});

archive.on('error', function(err){
  throw err;
});

archive.pipe(output);
archive.directory('dist/', false);
archive.finalize();
