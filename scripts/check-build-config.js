// scripts/check-build-config.js
/**
 * Pre-build safety check to prevent ignoreBuildErrors from being deployed
 * 
 * This script ensures that next.config.ts does not contain ignoreBuildErrors: true
 * which would bypass TypeScript type checking in production builds.
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'next.config.ts');

// Check if config file exists
if (!fs.existsSync(configPath)) {
  console.error(`❌ ERROR: next.config.ts not found at ${configPath}`);
  process.exit(1);
}

const configContent = fs.readFileSync(configPath, 'utf8');

// Check for ignoreBuildErrors (case-insensitive, handles various formats)
const hasIgnoreBuildErrors = /ignoreBuildErrors\s*:\s*true/i.test(configContent);

if (hasIgnoreBuildErrors) {
  console.error('\n❌ ERROR: ignoreBuildErrors is set in next.config.ts');
  console.error('   This is not allowed in production builds.');
  console.error('   Please fix all TypeScript errors instead.');
  console.error('   Run: npm run type-check\n');
  process.exit(1);
}

console.log('✅ Build config check passed: ignoreBuildErrors is not set');
process.exit(0);

