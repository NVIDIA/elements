import tokens from '@nvidia-elements/themes/index.json' with { type: 'json' };

export async function tokensShortcode(...tokenArgs) {
  const formattedTokens = Object.entries(tokens)
    .filter(([name]) =>
      tokenArgs.some(token => {
        if (token.startsWith('=')) {
          const exactToken = token.substring(1);
          return name.endsWith(exactToken);
        }
        return name.includes(token);
      })
    )
    .map(([name, value]) => [`--${name}`, `--${value}`]);
  return renderTokenTable(formattedTokens);
}

function renderTokenTable(tokens) {
  return /* html */ `
  <style>
    .tokens-table {
      width: 100%;
      text-align: left;

      th {
        font-weight: 400;
      }
      
      td {
        padding-bottom: var(--nve-ref-space-xxs);
      }
      
      td > div {
        background: var(--nve-ref-border-color);
        min-height: var(--nve-ref-size-1000);
        display: flex;
        align-items: center;
        width: 100%;
      }
      
      td:last-child,
      td:nth-child(2) {
        min-width: 190px;
      }
      
      nve-copy-button {
        opacity: 0;
      }
      
      td:hover nve-copy-button {
        opacity: 1;
      }
    }
  </style>
  <table class="tokens-table">
    <thead>
      <tr>
        <th>Token</th>
        <th>Value</th>
        <th>Demo</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${tokens
        .map(([name, value]) => {
          return /* html */ `<tr>
        <td nve-layout="row gap:xs align:vertical-center">
          ${name} <nve-copy-button aria-label="Copy to clipboard" value="${name}" container="flat" behavior-copy></nve-copy-button>
        </td>
        <td>
          <code style="user-select: none">${value}</code>
        </td>
        <td>
          ${name.includes('ref-size') || name.includes('ref-space') ? /* html */ `<div style="width: var(${name})"></div>` : ''}
          ${name.includes('ref-color') || name.includes('sys-visualization') ? /* html */ `<div style="background: var(${name})"></div>` : ''}
          ${name.includes('ref-font-family') ? /* html */ `<div style="font-family: var(${name}); background: transparent">font</div>` : ''}
          ${name.includes('ref-font-weight') ? /* html */ `<div style="font-weight: var(${name}); background: transparent">weight</div>` : ''}
          ${name.includes('ref-font-line-height') ? /* html */ `<div style="font-line-height: var(${name}); background: transparent">line-height</div>` : ''}
          ${name.includes('ref-font-size') ? /* html */ `<div style="font-size: var(${name}); background: transparent">size</div>` : ''}
          ${name.includes('ref-border-radius') ? /* html */ `<div style="border-radius: var(${name}); width: 100px; height: 100px"></div>` : ''}
          ${name.includes('ref-border-color') ? /* html */ `<div style="background: var(${name})"></div>` : ''}
          ${name.includes('ref-border-width') ? /* html */ `<div style="border: 1px solid var(--nve-ref-border-color); background: transparent; border-width: var(${name})"></div>` : ''}
          ${name.includes('ref-opacity') ? /* html */ `<div style="opacity: var(${name}); background: #000"></div>` : ''}
          ${name.includes('ref-shadow') ? /* html */ `<div style="padding: 12px; background: transparent;"><div style="box-shadow: var(${name}); background: var(--nve-sys-layer-container-background)"></div></div>` : ''}
          ${
            name.includes('ref-animation-duration')
              ? /* html */ `
            <div style="background: transparent">
              <div class="animation">
                <div style="animation-duration: var(${name})"></div>
              </div>
            </div>
          `
              : ''
          }
          ${name.includes('sys-status') || name.includes('sys-support') ? /* html */ `<div style="background: var(${name})"></div>` : ''}
          ${name.includes('sys-text') ? /* html */ `<div style="background: var(${name})"></div>` : ''}
          ${name.includes('sys-accent') ? /* html */ `<div style="background: var(${name})"></div>` : ''}
          ${name.includes('sys-interaction') ? /* html */ `<div style="background: var(${name})"></div>` : ''}
          ${name.includes('sys-layer') ? /* html */ `<div style="background: var(${name})"></div>` : ''}
        </td>
      </tr>`;
        })
        .join('')}
    </tbody>
  </table>`.replaceAll('\n', '');
}
