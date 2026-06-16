const { execSync } = require('child_process');

const platform = process.argv[2]; // 'firefox' or 'chrome'

if (!platform) {
  console.error("Usage: node lint.js <firefox|chrome>");
  process.exit(1);
}

try {
  // Run web-ext lint with json output
  const lintOutput = execSync('npx web-ext lint --source-dir ./src --output json --no-input', {
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8'
  });
  
  processLint(JSON.parse(lintOutput));
} catch (err) {
  // web-ext lint exits with non-zero code if errors are found, so execSync will throw.
  // The stdout is still available on the error object if it ran.
  if (err.stdout) {
    try {
      processLint(JSON.parse(err.stdout));
    } catch (e) {
      console.error("Failed to parse lint JSON output:", e.message);
      console.error(err.stdout);
      process.exit(1);
    }
  } else {
    console.error("Error executing web-ext lint:", err.message);
    process.exit(1);
  }
}

function processLint(data) {
  let errors = data.errors || [];
  let warnings = data.warnings || [];
  let notices = data.notices || [];

  if (platform === 'chrome') {
    // Filter out Firefox-specific errors/warnings for Chrome build
    errors = errors.filter(e => e.code !== "BACKGROUND_SERVICE_WORKER_NOFALLBACK" && e.code !== "ADDON_ID_REQUIRED");
    warnings = warnings.filter(w => w.code !== "BACKGROUND_SERVICE_WORKER_NOFALLBACK" && w.code !== "ADDON_ID_REQUIRED");
    notices = notices.filter(n => n.code !== "BACKGROUND_SERVICE_WORKER_NOFALLBACK" && n.code !== "ADDON_ID_REQUIRED");
  }

  console.log(`────────────────────────────────────────────`);
  console.log(`  Lint (${platform}) │ ${errors.length} errors │ ${warnings.length} warnings │ ${notices.length} notices`);
  console.log(`────────────────────────────────────────────`);

  if (errors.length > 0) {
    console.error("\nErrors:");
    errors.forEach(e => {
      console.error(`- [${e.code}] ${e.message}`);
      if (e.file) console.error(`  at ${e.file}:${e.line || 0}:${e.column || 0}`);
    });
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach(w => {
      console.log(`- [${w.code}] ${w.message}`);
      if (w.file) console.log(`  at ${w.file}:${w.line || 0}:${w.column || 0}`);
    });
  }

  if (process.env.GITHUB_OUTPUT) {
    const fs = require('fs');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `errors=${errors.length}\nwarnings=${warnings.length}\nnotices=${notices.length}\n`);
  }

  if (errors.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
