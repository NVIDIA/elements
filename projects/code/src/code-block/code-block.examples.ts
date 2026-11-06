// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/code/code-block/languages/typescript.js'
import '@nvidia-elements/code/code-block/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/copy-button/define.js';

export default {
  title: 'Labs/Code/Codeblock',
  component: 'nve-code-block'
};

/**
 * @summary Basic codeblock with syntax highlighting for source code.
 */
export const Default = {
  render: () => html`
<nve-code-block language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-code-block>
`
};

/**
 * @summary Codeblock with flat container styling for minimal visual emphasis.
 */
export const Flat = {
  render: () => html`
<nve-code-block container="flat" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-code-block>
`
};

/**
 * @summary Light and dark theme variations for different UI contexts.
 */
export const Theme = {
  render: () => html`
<nve-code-block nve-theme="light" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-code-block>
<br />
<nve-code-block nve-theme="dark" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-code-block>
`
};

/**
 * @summary Codeblock with copy button action for easy code sharing and reuse.
 */
export const Copy = {
  render: () => html`
<nve-code-block language="typescript">
  <nve-icon-button slot="actions" icon-name="copy" container="flat"></nve-icon-button>
  function getTime(): number {
    return new Date().getTime();
  }
</nve-code-block>
`
};

/**
 * @summary Codeblock using the code property for programmatic/dynamic usage.
 */
export const Code = {
  render: () => html`
<nve-code-block language="typescript" id="code-property"></nve-code-block>
<script type="module">
  import '@nvidia-elements/code/code-block/define.js';
  import '@nvidia-elements/code/code-block/languages/typescript.js';
  const codeblock = document.querySelector('nve-code-block#code-property');
  codeblock.code = 'console.log("hello, world!")';
</script>
`
};

/**
 * @summary Codeblock with line numbers for easier code reference and debugging.
 */
export const LineNumbers = {
  render: () => html`
<nve-code-block language="typescript" line-numbers>
function getTime(): number {
  return new Date().getTime();
}
</nve-code-block>
`
}

/**
 * @summary Codeblock with specific line highlighting to draw attention to important code sections.
 */
export const Highlight = {
  render: () => html`
<nve-code-block language="typescript" line-numbers highlight="2">
function getTime(): number {
  return new Date().getTime();
}
</nve-code-block>
`
}

/**
 * @summary Codeblock with constrained height for scrollable overflow behavior with long code.
 * @tags test-case
 */
export const Overflow = {
  render: () => html`
<nve-code-block language="typescript" line-numbers highlight="2" style="height: 100px;">
  import{LitElement as t,html as e}from"lit";import{property as s}from"lit/decorators/property.js";import{state as o}from"lit/decorators/state.js";
  import{unsafeHTML as i}from"lit/directives/unsafe-html.js";
  import{shiftLeft as n}from"@nvidia-elements/core/internal";
  import{useStyles as r}from"@nvidia-elements/foundations/internal/styles";
  import l from"./code-block.css.js";
  import a from"highlight.js/lib/core";
  import h from"highlight.js/lib/languages/shell";
</nve-code-block>
`
};

/**
 * @summary Comparison of line wrapping vs horizontal scrolling for long code lines in constrained widths.
 * @tags test-case
 */
export const LineWrap = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-code-block language="json" style="--white-space: pre-wrap; width: 400px;">
<template>
[
  {"id":"h100","name":"H100 SXM5","series":"H100 Series","architecture":"Hopper","process_node":"4nm","cuda_cores":16896,"rt_cores":0,"tensor_cores":528,"base_clock":1410,"boost_clock":1980,"memory":{"size":"80GB","type":"HBM3","bandwidth":"3350 GB/s","bus_width":5120},"ai_performance":{"fp32_tflops":67,"tensor_tflops":1979,"transformer_engine":true,"fp8_support":true,"nvlink_bandwidth":"900 GB/s"},"power_consumption":700,"msrp":25000,"release_date":"2022-03-22","ai_workloads":["large_language_models","training","inference","hpc"]},
  {"id":"a100","name":"A100 SXM4","series":"A100 Series","architecture":"Ampere","process_node":"7nm","cuda_cores":6912,"rt_cores":0,"tensor_cores":432,"base_clock":765,"boost_clock":1410,"memory":{"size":"80GB","type":"HBM2e","bandwidth":"2039 GB/s","bus_width":5120},"ai_performance":{"fp32_tflops":19.5,"tensor_tflops":624,"sparsity_support":true,"multi_instance_gpu":7,"nvlink_bandwidth":"600 GB/s"},"power_consumption":400,"msrp":15000,"release_date":"2020-05-14","ai_workloads":["training","inference","data_analytics","hpc"]}
]
</template>
  </nve-code-block>

  <nve-code-block language="json"  style="width: 400px;">
<template>
[
  {"id":"h100","name":"H100 SXM5","series":"H100 Series","architecture":"Hopper","process_node":"4nm","cuda_cores":16896,"rt_cores":0,"tensor_cores":528,"base_clock":1410,"boost_clock":1980,"memory":{"size":"80GB","type":"HBM3","bandwidth":"3350 GB/s","bus_width":5120},"ai_performance":{"fp32_tflops":67,"tensor_tflops":1979,"transformer_engine":true,"fp8_support":true,"nvlink_bandwidth":"900 GB/s"},"power_consumption":700,"msrp":25000,"release_date":"2022-03-22","ai_workloads":["large_language_models","training","inference","hpc"]},
  {"id":"a100","name":"A100 SXM4","series":"A100 Series","architecture":"Ampere","process_node":"7nm","cuda_cores":6912,"rt_cores":0,"tensor_cores":432,"base_clock":765,"boost_clock":1410,"memory":{"size":"80GB","type":"HBM2e","bandwidth":"2039 GB/s","bus_width":5120},"ai_performance":{"fp32_tflops":19.5,"tensor_tflops":624,"sparsity_support":true,"multi_instance_gpu":7,"nvlink_bandwidth":"600 GB/s"},"power_consumption":400,"msrp":15000,"release_date":"2020-05-14","ai_workloads":["training","inference","data_analytics","hpc"]}
]
</template>
  </nve-code-block>
</div>
`
}

/**
 * @summary Keep a source label and supporting information visible while reviewing code.
 */
export const HeaderFooter = {
  render: () => html`
<nve-code-block id="header-footer-code" language="shell">
  <nve-code-block-header>
    <nve-icon name="terminal" slot="prefix"></nve-icon>
    <span nve-text="body">Setup</span>
    <nve-copy-button slot="suffix" aria-label="Copy setup commands" container="inline" behavior-copy></nve-copy-button>
  </nve-code-block-header>
  <template>
# install CLI
curl -fsSL https://nvidia.github.io/elements/install.sh | bash

# create a new project
nve project.create

# configure dependencies and MCP tools
nve project.setup
  </template>
  <nve-code-block-footer>
    <span slot="prefix" nve-text="body">Shell</span>
    <span nve-text="body">Run from the project directory.</span>
    <span slot="suffix" nve-text="body">Ready</span>
  </nve-code-block-footer>
</nve-code-block>
<script type="module">
  import '@nvidia-elements/code/code-block/define.js';
  import '@nvidia-elements/core/copy-button/define.js';
  const codeblock = document.querySelector('#header-footer-code');
  const button = codeblock.querySelector('nve-copy-button');
  button.value = codeblock.querySelector('template').content.textContent.trim();
  codeblock.code = button.value;
</script>
  `
};


/**
 * @summary Codeblock with container styling for different visual contexts.
 * @tags test-case
 */
export const ContainerHeaderFooter = {
  render: () => html`
<div nve-layout="column gap:md">
<nve-code-block language="shell" container="inline">
  <nve-code-block-header>
    <span nve-text="body">Setup</span>
    <nve-icon-button slot="suffix" icon-name="copy" aria-label="Copy setup commands" container="inline"></nve-icon-button>
  </nve-code-block-header>
  <template>
# install CLI
curl -fsSL https://nvidia.github.io/elements/install.sh | bash

# create a new project
nve project.create

# configure dependencies and MCP tools
nve project.setup
  </template>
  <nve-code-block-footer><span nve-text="body">Shell commands</span></nve-code-block-footer>
</nve-code-block>

<nve-code-block language="shell" container="flat">
  <nve-code-block-header>
    <span nve-text="body">Setup</span>
    <nve-icon-button slot="suffix" icon-name="copy" aria-label="Copy setup commands" container="inline"></nve-icon-button>
  </nve-code-block-header>
  <template>
# install CLI
curl -fsSL https://nvidia.github.io/elements/install.sh | bash

# create a new project
nve project.create

# configure dependencies and MCP tools
nve project.setup
  </template>
  <nve-code-block-footer><span nve-text="body">Shell commands</span></nve-code-block-footer>
</nve-code-block>
<nve-code-block language="shell">
  <nve-code-block-header>
    <span nve-text="body">Setup</span>
    <nve-icon-button slot="suffix" icon-name="copy" aria-label="Copy setup commands" container="inline"></nve-icon-button>
  </nve-code-block-header>
  <template>
# install CLI
curl -fsSL https://nvidia.github.io/elements/install.sh | bash

# create a new project
nve project.create

# configure dependencies and MCP tools
nve project.setup
  </template>
  <nve-code-block-footer><span nve-text="body">Shell commands</span></nve-code-block-footer>
</nve-code-block>
</div>
  `
};