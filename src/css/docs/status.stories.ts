import { html } from 'lit';

export default {
  title: 'Foundation/Examples/Status'
};

export const Status = {
  render: () => html`
    <style>
      .status-demo {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .status-demo > div {
        padding: var(--nve-ref-size-400);
      }

      .neutral {
        background: var(--nve-sys-status-neutral-background);
        color: var(--nve-sys-status-neutral-color);
      }

      .info {
        background: var(--nve-sys-status-info-background);
        color: var(--nve-sys-status-info-color);
      }

      .success {
        background: var(--nve-sys-status-success-background);
        color: var(--nve-sys-status-success-color);
      }

      .warning {
        background: var(--nve-sys-status-warning-background);
        color: var(--nve-sys-status-warning-color);
      }

      .danger {
        background: var(--nve-sys-status-danger-background);
        color: var(--nve-sys-status-danger-color);
      }
    </style>
    <section nve-theme="light" class="status-demo">
      <div class="neutral">
        neutral
      </div>
      <div class="info">
        info
      </div>
      <div class="success">
        success
      </div>
      <div class="warning">
        warning
      </div>
      <div class="danger">
        danger
      </div>
    </section>
    <section nve-theme="dark" class="status-demo">
      <div class="neutral">
        neutral
      </div>
      <div class="info">
        info
      </div>
      <div class="success">
        success
      </div>
      <div class="warning">
        warning
      </div>
      <div class="danger">
        danger
      </div>
    </section>
  `
}
