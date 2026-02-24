import { createWriteStream, existsSync, mkdirSync, symlinkSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { extract as tarExtract } from 'tar';

// This script is used to install the latest version of Vale.
// It is used in the prepare script to ensure that Vale is installed
// before the build process starts.

const VERSION = '3.13.0';
const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN_DIR = join(__dirname, 'bin');

const PLATFORM_MAP = {
  darwin: 'macOS',
  linux: 'Linux',
  win32: 'Windows'
};

const ARCH_MAP = {
  x64: '64-bit',
  arm64: 'arm64'
};

function getBinaryPath() {
  const ext = process.platform === 'win32' ? '.exe' : '';
  return join(BIN_DIR, `vale${ext}`);
}

function isInstalled(binaryPath) {
  if (!existsSync(binaryPath)) {
    return false;
  }

  try {
    const output = execSync(`"${binaryPath}" --version`, { encoding: 'utf-8' }).trim();
    // vale --version outputs "vale v3.13.0" or similar
    return output.includes(VERSION);
  } catch {
    return false;
  }
}

function findSystemBinary() {
  try {
    const cmd = process.platform === 'win32' ? 'where vale' : 'which vale';
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function isSynced() {
  const rootDir = join(__dirname, '..', '..');
  const ini = readFileSync(join(rootDir, '.vale.ini'), 'utf-8');
  const match = ini.match(/^Packages\s*=\s*(.+)$/m);
  if (!match) {
    return true;
  }

  const stylesPath = join(rootDir, 'config', 'vale', 'styles');
  const packages = match[1]
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
  return packages.every(pkg => existsSync(join(stylesPath, pkg)));
}

function getDownloadUrl() {
  const platform = PLATFORM_MAP[process.platform];
  const arch = ARCH_MAP[process.arch];

  if (!platform) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  if (!arch) {
    throw new Error(`Unsupported architecture: ${process.arch}`);
  }

  const ext = process.platform === 'win32' ? 'zip' : 'tar.gz';
  return `https://github.com/errata-ai/vale/releases/download/v${VERSION}/vale_${VERSION}_${platform}_${arch}.${ext}`;
}

async function extractTarGz(response, binaryPath) {
  const tmpFile = `${binaryPath}.tar.gz`;

  try {
    const fileStream = createWriteStream(tmpFile);
    await pipeline(response.body, fileStream);

    mkdirSync(BIN_DIR, { recursive: true });
    await tarExtract({ file: tmpFile, cwd: BIN_DIR, filter: path => path === 'vale' });
  } finally {
    const { unlinkSync } = await import('node:fs');
    try {
      unlinkSync(tmpFile);
    } catch {
      // ignore cleanup errors
    }
  }
}

async function extractZip(response, binaryPath) {
  const { Open } = await import('unzipper');
  const tmpFile = `${binaryPath}.zip`;

  try {
    const fileStream = createWriteStream(tmpFile);
    await pipeline(response.body, fileStream);

    const directory = await Open.file(tmpFile);
    const valeEntry = directory.files.find(f => f.path === 'vale.exe');
    if (!valeEntry) {
      throw new Error('vale.exe not found in archive');
    }

    mkdirSync(BIN_DIR, { recursive: true });
    const outStream = createWriteStream(binaryPath);
    await pipeline(valeEntry.stream(), outStream);
  } finally {
    const { unlinkSync } = await import('node:fs');
    try {
      unlinkSync(tmpFile);
    } catch {
      // ignore cleanup errors
    }
  }
}

async function install() {
  const binaryPath = getBinaryPath();

  if (!isInstalled(binaryPath)) {
    // Check for a system-installed Vale (e.g. Docker CI image) before downloading
    const systemBinary = findSystemBinary();

    if (systemBinary) {
      mkdirSync(BIN_DIR, { recursive: true });
      symlinkSync(systemBinary, binaryPath);
      console.log(`Vale symlinked from ${systemBinary} to ${binaryPath}`);
    } else {
      const url = getDownloadUrl();
      console.log(`Downloading Vale v${VERSION} from ${url}...`);

      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      mkdirSync(BIN_DIR, { recursive: true });

      if (process.platform === 'win32') {
        await extractZip(response, binaryPath);
      } else {
        await extractTarGz(response, binaryPath);
      }

      // Make binary executable on Unix
      if (process.platform !== 'win32') {
        const { chmodSync } = await import('node:fs');
        chmodSync(binaryPath, 0o755);
      }

      console.log(`Vale v${VERSION} installed to ${binaryPath}`);
    }
  }

  // Sync style packages (Google, write-good) defined in .vale.ini
  if (!isSynced()) {
    execSync(`"${binaryPath}" sync`, { stdio: 'inherit', cwd: join(__dirname, '..', '..') });
  }
}

install().catch(err => {
  console.error('Failed to install Vale:', err.message);
  process.exit(1);
});
