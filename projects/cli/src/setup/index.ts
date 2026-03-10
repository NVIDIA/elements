#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const nve = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'index.js');
spawn('node', [nve, 'project.setup'], { stdio: 'inherit' }).on('close', code => process.exit(code ?? 0));
