// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ToolDefinition } from '@earendil-works/pi-coding-agent';
import { Text } from '@earendil-works/pi-tui';
import type { TSchema } from 'typebox';
import type { ElementsToolDetails } from './results.js';

type ResultRenderer = NonNullable<ToolDefinition<TSchema, ElementsToolDetails>['renderResult']>;

interface ValidationSummary {
  files: number;
  errors: number;
  warnings: number;
}

interface ReportCheck {
  status?: string;
  message?: string;
}

function formatCount(count: number, name: string): string {
  return `${count} ${name}${count === 1 ? '' : 's'}`;
}

function getTextContent(result: Parameters<ResultRenderer>[0]): string {
  const content = result.content[0];
  return content?.type === 'text' ? content.text : '';
}

function isValidationSummary(value: unknown): value is ValidationSummary {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'files' in value &&
    'errors' in value &&
    'warnings' in value &&
    typeof value.files === 'number' &&
    typeof value.errors === 'number' &&
    typeof value.warnings === 'number'
  );
}

function getStructuredValidationSummary(value: unknown): ValidationSummary | undefined {
  if (typeof value !== 'object' || value === null || !('summary' in value)) return undefined;
  return isValidationSummary(value.summary) ? value.summary : undefined;
}

function getValidationSummary(result: Parameters<ResultRenderer>[0]): ValidationSummary | undefined {
  const structuredSummary = getStructuredValidationSummary(result.details?.result);
  if (structuredSummary) return structuredSummary;
  const match = getTextContent(result).match(/(\d+) files?, (\d+) errors?, (\d+) warnings?/);
  if (!match) return undefined;
  return { files: Number(match[1]), errors: Number(match[2]), warnings: Number(match[3]) };
}

function getReportChecks(result: Parameters<ResultRenderer>[0]): ReportCheck[] {
  const value = result.details?.result;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [];
  return Object.values(value).filter(
    (check): check is ReportCheck => typeof check === 'object' && check !== null && !Array.isArray(check)
  );
}

function renderExpandedText(text: string, expanded: boolean, theme: Parameters<ResultRenderer>[2]): string {
  if (!expanded || !text) return '';
  return `\n${theme.fg('dim', text)}`;
}

export const renderValidationResult: ResultRenderer = (result, { expanded, isPartial }, theme) => {
  if (isPartial) return new Text(theme.fg('warning', 'Validating Elements template…'), 0, 0);
  const summary = getValidationSummary(result);
  if (!summary) return new Text(getTextContent(result), 0, 0);
  const color = summary.errors > 0 ? 'error' : summary.warnings > 0 ? 'warning' : 'success';
  const label = [
    formatCount(summary.errors, 'error'),
    formatCount(summary.warnings, 'warning'),
    formatCount(summary.files, 'file')
  ].join(' · ');
  const text = `${theme.fg(color, label)}${renderExpandedText(getTextContent(result), expanded, theme)}`;
  return new Text(text, 0, 0);
};

export const renderProjectValidationResult: ResultRenderer = (result, { expanded, isPartial }, theme) => {
  if (isPartial) return new Text(theme.fg('warning', 'Checking Elements project…'), 0, 0);
  const checks = getReportChecks(result);
  if (checks.length === 0) return new Text(getTextContent(result), 0, 0);
  const failed = checks.filter(check => check.status === 'danger').length;
  const warnings = checks.filter(check => check.status === 'warning').length;
  const passed = checks.length - failed - warnings;
  const color = failed > 0 ? 'error' : warnings > 0 ? 'warning' : 'success';
  const summary = theme.fg(
    color,
    `${formatCount(passed, 'passed')} · ${formatCount(warnings, 'warning')} · ${formatCount(failed, 'failed')}`
  );
  const details = checks.map(check => `${check.status ?? 'unknown'}: ${check.message ?? ''}`).join('\n');
  return new Text(`${summary}${renderExpandedText(details, expanded, theme)}`, 0, 0);
};
