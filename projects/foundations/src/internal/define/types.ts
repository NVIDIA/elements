// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface ElementDefinition extends CustomElementConstructor {
  metadata: { version: string; tag: string };
  elementDefinitions?: { [key: string]: ElementDefinition };
  shadowRootOptions?: { customElementRegistry?: CustomElementRegistry | null };
}
