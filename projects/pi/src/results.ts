// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_LINES,
  formatSize,
  truncateHead,
  type AgentToolResult
} from '@earendil-works/pi-coding-agent';
import type { ToolOutput } from '@internals/tools';

export interface ElementsToolDetails {
  toolName: string;
  result?: unknown;
  truncation?: {
    outputPath: string;
    totalBytes: number;
    totalLines: number;
  };
}

function formatResult(result: unknown, message?: string): string {
  if (typeof result === 'string') return result;
  if (result !== undefined) return JSON.stringify(result, null, 2);
  return message || 'Complete';
}

async function writeFullOutput(toolCallId: string, output: string): Promise<string> {
  const outputDirectory = await mkdtemp(join(tmpdir(), 'nvidia-elements-pi-'));
  const outputPath = join(outputDirectory, `${toolCallId.replaceAll(/[^a-zA-Z0-9_-]/g, '_')}.txt`);
  await writeFile(outputPath, output, { encoding: 'utf8', mode: 0o600 });
  return outputPath;
}

export function getElementsToolError(output: ToolOutput): Error {
  const result = output.result === undefined ? '' : `\n\n${formatResult(output.result)}`;
  return new Error(`${output.message || 'Elements tool failed.'}${result}`);
}

export async function createElementsToolResult(
  toolCallId: string,
  toolName: string,
  output: ToolOutput
): Promise<AgentToolResult<ElementsToolDetails>> {
  const text = formatResult(output.result, output.message);
  const truncation = truncateHead(text, { maxBytes: DEFAULT_MAX_BYTES, maxLines: DEFAULT_MAX_LINES });

  if (!truncation.truncated) {
    return {
      content: [{ type: 'text', text }],
      details: { toolName, result: output.result }
    };
  }

  const outputPath = await writeFullOutput(toolCallId, text);
  const notice = `\n\n[Output truncated to ${truncation.outputLines} of ${truncation.totalLines} lines (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}). Full output saved to: ${outputPath}]`;

  return {
    content: [{ type: 'text', text: `${truncation.content}${notice}` }],
    details: {
      toolName,
      truncation: { outputPath, totalBytes: truncation.totalBytes, totalLines: truncation.totalLines }
    }
  };
}
