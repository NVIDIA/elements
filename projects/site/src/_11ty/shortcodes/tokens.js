import metadata from '@nvidia-elements/themes/index.metadata.json' with { type: 'json' };

export async function tokensShortcode(...tokenArgs) {
  const formattedTokens = metadata
    .filter(token =>
      tokenArgs.some(arg => {
        if (arg.startsWith('=')) {
          const exactToken = arg.substring(1);
          return token.name.endsWith(exactToken);
        }
        return token.name.includes(arg);
      })
    )
    .map(token => ({
      name: `--${token.name}`,
      value: `--${token.value}`,
      description: token.description ?? ''
    }));
  return renderTokenTable(formattedTokens);
}

function renderTokenTable(tokens) {
  const hasDescriptions = tokens.some(token => token.description);
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

      .token-description {
        color: var(--nve-sys-text-muted-color);
        font-size: var(--nve-ref-font-size-100);
      }
    }
  </style>
  <table class="tokens-table">
    <thead>
      <tr>
        <th>Token</th>
        <th>Value</th>
        ${hasDescriptions ? '<th>Description</th>' : ''}
        <th>Demo</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${tokens
        .map(token => {
          const { name, value, description } = token;
          return /* html */ `<tr>
        <td nve-layout="row gap:xs align:vertical-center">
          ${name} <nve-copy-button aria-label="Copy to clipboard" value="${name}" container="flat" behavior-copy></nve-copy-button>
        </td>
        <td>
          <code style="user-select: none">${value}</code>
        </td>
        ${hasDescriptions ? `<td class="token-description">${description}</td>` : ''}
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
