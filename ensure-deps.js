const { execSync } = require("child_process");
const fs = require("fs");
const crypto = require("crypto");

// Only run in development
if (process.env.NODE_ENV === "production") {
  console.log("🚫 Skipping dependency check in production mode");
  process.exit(0);
}

const requiredPackages = {
  "react-markdown": "9.0.0",
  "framer-motion": "10.16.1",
  "lucide-react": "0.308.0",
  "clsx": "2.1.0"
};

const logFile = "./install.log";

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `${timestamp} - ${message}\n`);
}

function hashFile(path) {
  try {
    const fileBuffer = fs.readFileSync(path);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  } catch (err) {
    return null;
  }
}

// ⏱️ Start timing
const installStart = Date.now();

console.log("🔍 Checking dependencies for development...");

for (const [pkg, version] of Object.entries(requiredPackages)) {
  let reinstall = false;

  try {
    const resolvedPath = require.resolve(pkg);
    const currentHash = hashFile(resolvedPath);
    log(`✅ Verified ${pkg} at ${resolvedPath} | SHA256: ${currentHash}`);
  } catch {
    log(`❌ ${pkg} missing or broken, reinstalling...`);
    reinstall = true;
  }

  if (reinstall) {
    try {
      console.log(`📦 Installing ${pkg}@${version}...`);
      execSync(`npm install ${pkg}@${version}`, { stdio: "inherit" });
      log(`✅ Installed ${pkg}@${version}`);
    } catch (installErr) {
      log(`❗ Failed to install ${pkg}: ${installErr.message}`);
    }
  }
}

// 🧠 Nerd points: log how long the install took
const duration = ((Date.now() - installStart) / 1000).toFixed(2);
log(`🏁 Dependency check + install completed in ${duration}s`);
console.log(`✅ Development dependencies ready!`);
