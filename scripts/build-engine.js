const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const exeExt = isWindows ? '.exe' : '';

const projectRoot = path.resolve(__dirname, '..');
const engineDir = path.join(projectRoot, 'engine');
const binDir = path.join(engineDir, 'bin');
const srcDir = path.join(engineDir, 'src');

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

console.log('Building C++17 engine binaries...');
console.log(`Platform: ${os.platform()} (${os.arch()})`);

function compileBinary(sourceFiles, outputName) {
  const outputFile = path.join(binDir, outputName + exeExt);
  const includeDir = path.join(engineDir, 'third_party');
  
  const args = [
    '-std=c++17',
    '-O2',
    `-I${engineDir}`,
    `-I${includeDir}`,
    `-I${srcDir}`,
    ...sourceFiles,
    '-o',
    outputFile
  ];

  console.log(`Compiling ${outputName} -> ${outputFile}`);
  console.log(`Command: g++ ${args.join(' ')}`);

  const result = spawnSync('g++', args, {
    cwd: engineDir,
    stdio: 'inherit'
  });

  if (result.error) {
    console.error(`Failed to invoke g++ for ${outputName}:`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Compilation of ${outputName} failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }

  console.log(`Successfully built: ${outputFile}`);
}

// scheduler sources — do NOT include backtracking or graph_coloring (they have their own main)
const schedulerSources = [path.join(srcDir, 'scheduler.cpp')];
// If common.cpp exists, include it
if (fs.existsSync(path.join(srcDir, 'common.cpp'))) {
  schedulerSources.push(path.join(srcDir, 'common.cpp'));
}

const validatorSources = [path.join(srcDir, 'validator_main.cpp')];
if (fs.existsSync(path.join(srcDir, 'constraint_validator.cpp'))) {
  validatorSources.push(path.join(srcDir, 'constraint_validator.cpp'));
}

compileBinary(schedulerSources, 'scheduler');
compileBinary(validatorSources, 'validator');

// Backtracking binary (standalone)
const backtrackingSrc = path.join(srcDir, 'backtracking_scheduler.cpp');
if (fs.existsSync(backtrackingSrc)) {
  compileBinary([backtrackingSrc], 'backtracking');
}

// Graph-coloring binary (standalone, Phase 6)
const graphColoringSrc = path.join(srcDir, 'graph_coloring.cpp');
if (fs.existsSync(graphColoringSrc)) {
  compileBinary([graphColoringSrc], 'graph-coloring');
}

// Combined / Hybrid binary (Graph-Coloring + Backtracking)
const combinedSrc = path.join(srcDir, 'combined_scheduler.cpp');
if (fs.existsSync(combinedSrc)) {
  compileBinary([combinedSrc], 'combined');
}

console.log('All engine binaries built successfully!');
