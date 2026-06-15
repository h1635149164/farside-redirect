const fs = require('fs');
const path = require('path');

function merge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

if (process.argv.length < 5) {
  console.error("Usage: node merge.js <common.json> <target.json> <output.json>");
  process.exit(1);
}

const file1 = path.resolve(process.argv[2]);
const file2 = path.resolve(process.argv[3]);
const outFile = path.resolve(process.argv[4]);

try {
  const json1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
  const json2 = JSON.parse(fs.readFileSync(file2, 'utf8'));
  const result = merge(json1, json2);
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8');
} catch (err) {
  console.error("Error merging manifests:", err.message);
  process.exit(1);
}
