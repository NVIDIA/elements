// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Skill } from './registry.js';

function formatYamlString(value: string): string {
  return JSON.stringify(value);
}

export function formatSkillMarkdown(skill: Skill): string {
  return `---
name: ${formatYamlString(skill.name)}
title: ${formatYamlString(skill.title)}
description: ${formatYamlString(skill.description)}
---

${skill.context.trim()}
`;
}
