import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/dropzone/define.js';

export default {
  title: 'Elements/Dropzone',
  component: 'nve-dropzone'
};

export const Default = {
  render: () => html`
<nve-dropzone name="files" style="--min-height: 200px;"></nve-dropzone>`
};


export const Icon = {
  render: () => html`
<nve-dropzone name="files">
  <nve-icon slot="icon" name="document"></nve-icon>
</nve-dropzone>
`
};

export const Form = {
  render: () => html`
<form id="form-demo" nve-layout="column gap:lg">
  <section>
    <nve-dropzone name="files"></nve-dropzone>
  </section>
  <nve-button>submit</nve-button>
</form>
<script type="module">
  const form = document.querySelector('#form-demo');
  const dropzone = document.querySelector('#form-demo nve-dropzone');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const files = formData.getAll('files');

    console.log('Selected files:', files);
  });

  dropzone.addEventListener('change', e => {
    console.log('change', e.target.value);
  });
</script>
`
};
