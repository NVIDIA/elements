import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.nve');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface UpdateConfig {
  lastCheck: number;
  latestSha: string;
}

export interface NveConfig {
  update: UpdateConfig;
}

const DEFAULT_CONFIG: NveConfig = {
  update: { lastCheck: 0, latestSha: '' }
};

export function readNveConfig(): NveConfig {
  try {
    if (existsSync(CONFIG_FILE)) {
      const data = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
      return { ...DEFAULT_CONFIG, ...data };
    }
  } catch {
    // ignore read errors
  }
  return { ...DEFAULT_CONFIG };
}

export function saveNveConfig(config: NveConfig): void {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch {
    // ignore write errors
  }
}
