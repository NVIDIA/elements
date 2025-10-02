import { html } from 'lit';
import '@nvidia-elements/code/codeblock/languages/typescript.js'
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Labs/Code/Codeblock',
  component: 'nve-codeblock'
};

/**
 * @summary Basic codeblock with syntax highlighting for source code.
 */
export const Default = {
  render: () => html`
<nve-codeblock language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
`
};

/**
 * @summary Codeblock with flat container styling for minimal visual emphasis.
 */
export const Flat = {
  render: () => html`
<nve-codeblock container="flat" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
`
};

/**
 * @summary Demonstrates light and dark theme variations for different UI contexts.
 */
export const Theme = {
  render: () => html`
<nve-codeblock nve-theme="light" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
<br />
<nve-codeblock nve-theme="dark" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
`
};

/**
 * @summary Codeblock with copy button action for easy code sharing and reuse.
 */
export const Copy = {
  render: () => html`
<nve-codeblock language="typescript">
  <nve-icon-button slot="actions" icon-name="copy" container="flat"></nve-icon-button>
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
`
};

/**
 * @summary Codeblock using the code property for programmatic/dynamic usage.
 */
export const Code = {
  render: () => html`
<nve-codeblock language="typescript"></nve-codeblock>
<script type="module">
  import '@nvidia-elements/code/codeblock/define.js';
  import '@nvidia-elements/code/codeblock/languages/typescript.js';
  const codeblock = document.querySelector('nve-codeblock');
  codeblock.code = 'console.log("hello, world!")';
</script>
`
};

/**
 * @summary Codeblock with line numbers for easier code reference and debugging.
 */
export const LineNumbers = {
  render: () => html`
<nve-codeblock language="typescript" line-numbers>
function getTime(): number {
  return new Date().getTime();
}
</nve-codeblock>
`
}

/**
 * @summary Codeblock with specific line highlighting to draw attention to important code sections.
 */
export const Highlight = {
  render: () => html`
<nve-codeblock language="typescript" line-numbers highlight="2">
function getTime(): number {
  return new Date().getTime();
}
</nve-codeblock>
`
}

/**
 * @summary Codeblock with constrained height demonstrating scrollable overflow behavior for long code.
 * @tags test-case
 */
export const Overflow = {
  render: () => html`
<nve-codeblock language="typescript" line-numbers highlight="2" style="height: 100px;">
  import{LitElement as t,html as e}from"lit";import{property as s}from"lit/decorators/property.js";import{state as o}from"lit/decorators/state.js";
  import{unsafeHTML as i}from"lit/directives/unsafe-html.js";
  import{useStyles as r,shiftLeft as n}from"@nvidia-elements/core/internal";
  import l from"./codeblock.css.js";
  import a from"highlight.js/lib/core";
  import h from"highlight.js/lib/languages/shell";
</nve-codeblock>
`
};

/**
 * @summary Comparison of line wrapping vs horizontal scrolling for long code lines in constrained widths.
 * @tags test-case
 */
export const LineWrap = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-codeblock language="json" style="--white-space: pre-wrap; width: 400px;">
<template>
[
  {"id":"h100","name":"H100 SXM5","series":"H100 Series","architecture":"Hopper","process_node":"4nm","cuda_cores":16896,"rt_cores":0,"tensor_cores":528,"base_clock":1410,"boost_clock":1980,"memory":{"size":"80GB","type":"HBM3","bandwidth":"3350 GB/s","bus_width":5120},"ai_performance":{"fp32_tflops":67,"tensor_tflops":1979,"transformer_engine":true,"fp8_support":true,"nvlink_bandwidth":"900 GB/s"},"power_consumption":700,"msrp":25000,"release_date":"2022-03-22","ai_workloads":["large_language_models","training","inference","hpc"]},
  {"id":"a100","name":"A100 SXM4","series":"A100 Series","architecture":"Ampere","process_node":"7nm","cuda_cores":6912,"rt_cores":0,"tensor_cores":432,"base_clock":765,"boost_clock":1410,"memory":{"size":"80GB","type":"HBM2e","bandwidth":"2039 GB/s","bus_width":5120},"ai_performance":{"fp32_tflops":19.5,"tensor_tflops":624,"sparsity_support":true,"multi_instance_gpu":7,"nvlink_bandwidth":"600 GB/s"},"power_consumption":400,"msrp":15000,"release_date":"2020-05-14","ai_workloads":["training","inference","data_analytics","hpc"]}
]
</template>
  </nve-codeblock>

  <nve-codeblock language="json"  style="width: 400px;">
<template>
[
  {"id":"h100","name":"H100 SXM5","series":"H100 Series","architecture":"Hopper","process_node":"4nm","cuda_cores":16896,"rt_cores":0,"tensor_cores":528,"base_clock":1410,"boost_clock":1980,"memory":{"size":"80GB","type":"HBM3","bandwidth":"3350 GB/s","bus_width":5120},"ai_performance":{"fp32_tflops":67,"tensor_tflops":1979,"transformer_engine":true,"fp8_support":true,"nvlink_bandwidth":"900 GB/s"},"power_consumption":700,"msrp":25000,"release_date":"2022-03-22","ai_workloads":["large_language_models","training","inference","hpc"]},
  {"id":"a100","name":"A100 SXM4","series":"A100 Series","architecture":"Ampere","process_node":"7nm","cuda_cores":6912,"rt_cores":0,"tensor_cores":432,"base_clock":765,"boost_clock":1410,"memory":{"size":"80GB","type":"HBM2e","bandwidth":"2039 GB/s","bus_width":5120},"ai_performance":{"fp32_tflops":19.5,"tensor_tflops":624,"sparsity_support":true,"multi_instance_gpu":7,"nvlink_bandwidth":"600 GB/s"},"power_consumption":400,"msrp":15000,"release_date":"2020-05-14","ai_workloads":["training","inference","data_analytics","hpc"]}
]
</template>
  </nve-codeblock>
</div>
`
}
