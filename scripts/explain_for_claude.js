#!/usr/bin/env node
/**
 * SmartSched Project Explainer for Claude
 *
 * Usage:
 *   node scripts/explain_for_claude.js
 *
 * This script reads docs/CLAUDE_PROJECT_EXPLANATION.md and copies it
 * directly to your system clipboard (on macOS using pbcopy) so you can
 * immediately paste (Cmd+V) it into Claude!
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const docPath = path.resolve(__dirname, '../docs/CLAUDE_PROJECT_EXPLANATION.md');

if (!fs.existsSync(docPath)) {
  console.error(`Error: Documentation file not found at ${docPath}`);
  process.exit(1);
}

const content = fs.readFileSync(docPath, 'utf8');

console.log('='.repeat(70));
console.log('  SmartSched Project Explainer for Claude');
console.log('='.repeat(70));
console.log('\n📄 Loaded dossier from: docs/CLAUDE_PROJECT_EXPLANATION.md');
console.log(`📊 Size: ${content.length} characters (~${Math.round(content.split(/\s+/).length)} words)\n`);

// Try copying to clipboard on macOS
try {
  if (process.platform === 'darwin') {
    execSync('pbcopy', { input: content });
    console.log('✅ SUCCESS: Copied full Claude dossier to your clipboard!');
    console.log('👉 You can now open Claude and press Cmd + V (Paste) to explain the project.\n');
  } else {
    console.log('👉 Copy the contents of docs/CLAUDE_PROJECT_EXPLANATION.md into Claude.\n');
  }
} catch (err) {
  console.log('👉 Could not copy to clipboard automatically. Open docs/CLAUDE_PROJECT_EXPLANATION.md to copy.\n');
}

console.log('Quick Overview of What Claude Will Learn:');
console.log('  1. Problem Context: Why timetable generation is an NP-complete CSP');
console.log('  2. 4 Scheduling Algorithms: Greedy, Backtracking (Forward Checking), DSATUR Graph Coloring, Combined Hybrid');
console.log('  3. Real College Rules: Branch-locked lecture halls (101/201/301/401/PG/PhD) & sub-section interleaving (CS1/CS2)');
console.log('  4. Dual-Engine Architecture: High-performance C++17 binaries + Serverless JS fallback for Vercel');
console.log('  5. Full System Stack: MERN (React, Node, Express, MongoDB Atlas) + 7 University Presets + Vercel Deployment');
console.log('='.repeat(70));
