// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/dropzone/define.js';

export default {
  title: 'Elements/Dropzone',
  component: 'nve-dropzone'
};

/**
 * @summary Basic file dropzone with drag-and-drop area for file upload interactions.
 */
export const Default = {
  render: () => html`
<nve-dropzone name="files" style="--min-height: 200px;"></nve-dropzone>`
};

/**
 * @summary Dropzone with custom icon slot showing visual feedback on hover and highlight states.
 */
export const Icon = {
  render: () => html`
<style>
  nve-dropzone nve-icon {
    --color: red;
    background: var(--nve-sys-layer-canvas-accent-background);
  }

  nve-dropzone[highlighted] nve-icon,
  nve-dropzone:hover nve-icon {
    --color: var(--nve-sys-text-white-color);
    background: var(--nve-sys-accent-primary-background);
  }
</style>
<nve-dropzone name="files">
  <nve-icon slot="icon" name="document"></nve-icon>
</nve-dropzone>
`
};

/**
 * @summary Dropzone integrated with form validation showing file type and size constraint errors.
 */
export const Form = {
  render: () => html`
<form id="form-demo" nve-layout="column gap:lg">
  <section>
    <nve-control>
      <nve-dropzone name="files" accept="image/gif, image/jpeg, image/png" max-file-size="1048576"></nve-dropzone>
      <nve-control-message error="typeMismatch">Unsupported file type — this upload only accepts images</nve-control-message>
      <nve-control-message error="rangeOverflow">File too big - maximum 1.00 MB allowed</nve-control-message>
    </nve-control>
  </section>
  <nve-button type="submit">submit</nve-button>
</form>
<script type="module">
  const form = document.querySelector('#form-demo');
  const dropzone = document.querySelector('#form-demo nve-dropzone');

  dropzone.addEventListener('change', e => {
    console.log('change', e.target.value);
    const files = e.target.value;
    console.log('Validity:', e.target.validity);
    console.log('Validation Message:', e.target.validationMessage);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const files = formData.getAll('files');

    if (form.checkValidity()) {
      console.log('Form submitted successfully!');
    } else {
      console.log('Form validation failed');
    }
  });
</script>
`
};
