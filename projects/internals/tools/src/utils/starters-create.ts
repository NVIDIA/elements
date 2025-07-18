import { execSync, spawn } from 'node:child_process';
import { cwd } from 'node:process';
import { dirname, join, parse, resolve } from 'node:path';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import AdmZip from 'adm-zip';
import type { Starter } from './starters-data.js';
import { startersData } from './starters-data.js';

export async function createStarter(starter: Starter, outDir: string = resolve(cwd())) {
  const downloadPath = startersData[starter].zip;
  const archivePath = `${outDir}/${starter}.zip`;
  const extractedPath = `${outDir}/${starter}`;
  await downloadStarter(downloadPath, archivePath);
  await extractStarter(archivePath, extractedPath);
  await setupStarterGit(extractedPath);
  await setupStarterNPM(extractedPath);
  console.log('🎉 Starter created successfully');
  return extractedPath;
}

export async function downloadStarter(starterPath: string, outPath: string) {
  console.log('⏳ Downloading starter...');
  const response = await fetch(starterPath);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(outPath, buffer);
}

export async function extractStarter(archivePath: string, outDir: string) {
  const zip = new AdmZip(archivePath);
  zip.extractAllTo(outDir, true);
  unlinkSync(archivePath);
}

async function setupStarterGit(extractedDir: string) {
  const hasGit = await isCommandAvailable('git');
  if (hasGit && !isGitRepository(extractedDir)) {
    console.log('🔄 Initializing git...');
    execSync(`cd ${extractedDir} && git init`, {
      stdio: 'inherit'
    });
  } else {
    console.log('🔄 Skipping git initialization...');
  }
}

function isGitRepository(directoryPath) {
  // Check if .git directory exists directly in the given path
  const gitDirPath = join(directoryPath, '.git');
  if (existsSync(gitDirPath)) {
    return true;
  }

  // If not found, traverse up the parent directories
  let currentPath = directoryPath;
  while (currentPath !== parse(currentPath).root) {
    const parentGitDirPath = join(currentPath, '.git');
    if (existsSync(parentGitDirPath)) {
      return true;
    }
    currentPath = dirname(currentPath);
  }

  return false;
}

async function setupStarterNPM(extractedDir: string) {
  const npmClient = await getNPMClient();
  try {
    await installFromRegistry(extractedDir);
  } catch {
    try {
      await loginRegistry(extractedDir);
      await installFromRegistry(extractedDir);
    } catch (e) {
      console.error(e);
      console.error(
        `⚠️ Error installing dependencies, in the "${extractedDir}" directory run "${npmClient} login" then "${npmClient} install"`
      );
    }
  }
}

async function loginRegistry(extractedDir: string) {
  const npmClient = await getNPMClient();
  console.log('🔒 Logging in to registry...');
  execSync(`cd ${extractedDir} && ${npmClient} login`, {
    stdio: 'inherit'
  });
}

async function installFromRegistry(extractedDir: string) {
  const npmClient = await getNPMClient();
  console.log('📦 Installing dependencies...');
  execSync(`cd ${extractedDir} && ${npmClient} install`, {
    stdio: 'inherit'
  });
}

export async function startStarter(extractedPath: string) {
  const npmClient = await getNPMClient();
  if (npmClient) {
    console.log('🚀 Starting project...');

    try {
      execSync(`cd ${extractedPath} && ${npmClient} run dev`, {
        stdio: 'inherit'
      });
    } catch (e) {
      console.error(e);
    }
  }
}

async function getNPMClient() {
  const hasNPM = await isCommandAvailable('npm');
  const hasPNPM = await isCommandAvailable('pnpm');
  return hasPNPM ? 'pnpm' : hasNPM ? 'npm' : null;
}

function isCommandAvailable(command) {
  return new Promise(resolve => {
    const child = spawn(command, ['--version']);
    child.on('error', () => resolve(false));
    child.on('close', code => resolve(code === 0));
  });
}
