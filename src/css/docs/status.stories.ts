import { html } from 'lit';

export default {
  title: 'Foundations/Tokens/Examples'
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
        padding: var(--mlv-ref-size-400);
      }

      .neutral {
        background: var(--mlv-sys-status-neutral-background);
        color: var(--mlv-sys-status-neutral-color);
      }

      .info {
        background: var(--mlv-sys-status-info-background);
        color: var(--mlv-sys-status-info-color);
      }

      .success {
        background: var(--mlv-sys-status-success-background);
        color: var(--mlv-sys-status-success-color);
      }

      .warning {
        background: var(--mlv-sys-status-warning-background);
        color: var(--mlv-sys-status-warning-color);
      }

      .danger {
        background: var(--mlv-sys-status-danger-background);
        color: var(--mlv-sys-status-danger-color);
      }
    </style>
    <section mlv-theme="root light" class="status-demo">
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
    <section mlv-theme="root dark" class="status-demo">
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
