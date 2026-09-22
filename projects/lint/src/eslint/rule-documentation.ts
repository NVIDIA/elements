// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

declare const __ELEMENTS_PAGES_BASE_URL__: string;

type LintRuleCategory = 'Accessibility' | 'Best Practice';
export type LintRuleExampleLanguage = 'css' | 'html' | 'json';

interface LintRuleDocumentationInput {
  name: string;
  description: string;
  category: LintRuleCategory;
  recommended: boolean;
  examples: {
    language: LintRuleExampleLanguage;
    valid: string;
    invalid: string;
  };
}

export interface LintRuleDocumentation extends LintRuleDocumentationInput {
  url: string;
}

export function defineRuleDocumentation(documentation: LintRuleDocumentationInput): LintRuleDocumentation {
  return {
    ...documentation,
    url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/rules/${documentation.name}/`
  };
}
