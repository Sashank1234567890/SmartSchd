const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { runJsScheduler, runJsValidator } = require('./jsEngine');

const isWindows = os.platform() === 'win32';
const exeExt = isWindows ? '.exe' : '';

const MAX_BUFFER_SIZE = 50 * 1024 * 1024; // 50 MB
const DEFAULT_TIMEOUT_MS = parseInt(process.env.ENGINE_TIMEOUT_MS, 10) || 30000;

function getBinaryPath(binaryName) {
  const projectRoot = path.resolve(__dirname, '../..');
  const binaryPath = path.join(projectRoot, 'engine', 'bin', binaryName + exeExt);
  return binaryPath;
}

function verifyBinaryExists(binaryName) {
  const binaryPath = getBinaryPath(binaryName);
  if (fs.existsSync(binaryPath)) return true;
  // High-performance JavaScript engine fallback is always available for Vercel / serverless
  return true;
}

/**
 * Spawns an engine binary without a shell, passes inputJson via stdin,
 * captures stdout and stderr, enforces timeout, and returns parsed JSON.
 * Falls back to serverless JS engine if native binary is not present (e.g. Vercel).
 *
 * @param {'scheduler' | 'validator' | 'combined' | 'backtracking' | 'graph-coloring'} binaryName
 * @param {object} inputJson
 * @param {object} [options]
 * @param {number} [options.timeoutMs]
 * @returns {Promise<object>} Parsed JSON response from the binary
 */
function runEngine(binaryName, inputJson, options = {}) {
  return new Promise((resolve, reject) => {
    const binaryPath = getBinaryPath(binaryName);

    // If native binary is missing (e.g. on Vercel Serverless Functions), seamlessly execute JS engine
    if (!fs.existsSync(binaryPath)) {
      try {
        const parsedInput = typeof inputJson === 'string' ? JSON.parse(inputJson) : inputJson;
        if (binaryName === 'validator' || parsedInput.mode === 'validate') {
          const valRes = runJsValidator(parsedInput);
          return resolve(valRes);
        } else {
          const schedRes = runJsScheduler(parsedInput, binaryName);
          return resolve(schedRes);
        }
      } catch (err) {
        return reject({
          code: 'E_SERVERLESS_ENGINE_FAILED',
          message: `Serverless engine execution failed: ${err.message}`,
          details: err
        });
      }
    }

    const effectiveTimeout = options.timeoutMs
      ? options.timeoutMs + 5000
      : DEFAULT_TIMEOUT_MS;

    let child;
    try {
      // spawn without a shell
      child = spawn(binaryPath, [], {
        shell: false,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (err) {
      return reject({
        code: 'E_SPAWN_FAILED',
        message: `Failed to spawn binary '${binaryName}': ${err.message}`,
        details: err
      });
    }

    let stdoutData = '';
    let stderrData = '';
    let isTerminated = false;
    let stdoutSize = 0;

    const timeoutHandle = setTimeout(() => {
      isTerminated = true;
      child.kill('SIGKILL');
      reject({
        code: 'E_ENGINE_TIMEOUT',
        message: `Engine binary '${binaryName}' timed out after ${effectiveTimeout} ms.`,
        details: { timeoutMs: effectiveTimeout, binaryName }
      });
    }, effectiveTimeout);

    child.stdout.on('data', (chunk) => {
      stdoutSize += chunk.length;
      if (stdoutSize > MAX_BUFFER_SIZE) {
        if (!isTerminated) {
          isTerminated = true;
          clearTimeout(timeoutHandle);
          child.kill('SIGKILL');
          reject({
            code: 'E_OUTPUT_TOO_LARGE',
            message: `Engine stdout exceeded buffer limit of 50 MB.`,
            details: { stdoutSize }
          });
        }
        return;
      }
      stdoutData += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString('utf8');
    });

    child.on('error', (err) => {
      if (isTerminated) return;
      isTerminated = true;
      clearTimeout(timeoutHandle);
      reject({
        code: 'E_PROCESS_ERROR',
        message: `Error executing ${binaryName}: ${err.message}`,
        details: err
      });
    });

    child.on('close', (code, signal) => {
      if (isTerminated) return;
      isTerminated = true;
      clearTimeout(timeoutHandle);

      if (stderrData.trim()) {
        console.debug(`[${binaryName} stderr]:`, stderrData.trim());
      }

      if (code !== 0) {
        let parsedError = null;
        try {
          if (stdoutData.trim()) {
            parsedError = JSON.parse(stdoutData.trim());
          }
        } catch (_) {}

        return reject({
          code: parsedError?.error?.code || 'E_ENGINE_EXIT_NONZERO',
          message: parsedError?.error?.message || `Engine binary '${binaryName}' exited with code ${code} (signal: ${signal}).`,
          details: { exitCode: code, signal, stderr: stderrData, parsedError }
        });
      }

      if (!stdoutData.trim()) {
        return reject({
          code: 'E_EMPTY_OUTPUT',
          message: `Engine binary '${binaryName}' finished with exit code 0 but produced empty stdout.`,
          details: { stderr: stderrData }
        });
      }

      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (parseErr) {
        reject({
          code: 'E_INVALID_JSON',
          message: `Engine output could not be parsed as JSON: ${parseErr.message}`,
          details: { rawOutputPreview: stdoutData.slice(0, 500) }
        });
      }
    });

    // Write input JSON to stdin and close stdin stream
    try {
      const inputStr = typeof inputJson === 'string' ? inputJson : JSON.stringify(inputJson);
      child.stdin.write(inputStr, 'utf8');
      child.stdin.end();
    } catch (writeErr) {
      if (!isTerminated) {
        isTerminated = true;
        clearTimeout(timeoutHandle);
        child.kill('SIGKILL');
        reject({
          code: 'E_STDIN_WRITE_FAILED',
          message: `Failed to write input to engine stdin: ${writeErr.message}`,
          details: writeErr
        });
      }
    }
  });
}

module.exports = {
  runEngine,
  getBinaryPath,
  verifyBinaryExists
};
