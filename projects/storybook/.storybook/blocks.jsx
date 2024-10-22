import { LitElement, html, css } from 'lit';
import { createComponent } from '@lit/react';
import React, { useState } from 'react';
import { Unstyled, useOf } from '@storybook/blocks';
import { Story } from '@storybook/addon-docs';
import { addons } from '@storybook/preview-api';
import { updateScope, getRenderString } from './utils.js';
import { getPlaygroundURL } from './playground-url.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/code/codeblock/define.js';
import('@nvidia-elements/code/codeblock/languages/css.js');
import('@nvidia-elements/code/codeblock/languages/html.js');
import('@nvidia-elements/code/codeblock/languages/javascript.js');
import('@nvidia-elements/code/codeblock/languages/json.js');
import('@nvidia-elements/code/codeblock/languages/markdown.js');
import('@nvidia-elements/code/codeblock/languages/typescript.js');
import('@nvidia-elements/code/codeblock/languages/xml.js');

export const H1 = ({ children }) => (
  <Unstyled>
    <h1 nve-text="display">{children}</h1>
  </Unstyled>
)

export const H2 = (args) => {
  const id = new URLSearchParams(window.location.search).get('id');
  return (
  <Unstyled>
    <div nve-layout="column gap:xs align:stretch pad-top:xl">
      <h2 nve-text="heading xl" id={args.id} className="dynamic-anchor">
        <a href={`./?path=/docs/${id}#${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
        {args.children}
      </h2>
      <nve-divider></nve-divider>
    </div>
  </Unstyled>
  )
}

export const H3 = (args) => {
  const id = new URLSearchParams(window.location.search).get('id');
  return (
  <Unstyled>
    <h3 id={args.id} nve-text="heading lg"  nve-layout="pad-top:lg" className="dynamic-anchor">
      <a href={`./?path=/docs/${id}#${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
      {args.children}
    </h3>
  </Unstyled>
  )
}

export const H4 = (args) => {
  const id = new URLSearchParams(window.location.search).get('id');
  return (
  <Unstyled>
    <h4 id={args.id} nve-text="heading md"  nve-layout="pad-top:lg" className="dynamic-anchor">
      <a href={`./?path=/docs/${id}#${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
      {args.children}
    </h4>
  </Unstyled>
  )
}

export const P = (args) => {
  return (
  <Unstyled>  
    <p nve-text="body">{args.children}</p>
  </Unstyled>
  )
}

export const UL = (args) => {
  return (
  <Unstyled>
    <ul nve-text="list" nve-layout="column gap:xs">{args.children}</ul>
  </Unstyled>
  )
}

export const OL = (args) => {
  return (
  <Unstyled>
    <ol nve-text="list" nve-layout="column gap:xs">{args.children}</ol>
  </Unstyled>
  )
}

export const CODE = (args) => {
  // workaround https://github.com/storybookjs/storybook/issues/20634
  const globals = { ...addons.getChannel().data.setGlobals[0].globals, ...window.NVE_SB_GLOBALS };
  const code = updateScope(args.children, {
    scope: globals?.scope ?? 'mlv',
    sourceType: globals?.sourceType ?? ''
  });

  return <code nve-text="code">{code}</code>
}

export const PRE = (args) => {
  // workaround https://github.com/storybookjs/storybook/issues/20634
  if (args.children?.props?.children) {
    const globals = { ...addons.getChannel().data.setGlobals[0].globals, ...window.NVE_SB_GLOBALS };
    const code = updateScope(args.children.props.children, {
      scope: globals?.scope ?? 'mlv',
      sourceType: globals?.sourceType ?? ''
    });

    // return (<Source dark code={code} language={args.children.props.className.replace('language-', '')} />)
    return <Unstyled>
      <nve-codeblock style={{'--padding': 'var(--nve-ref-space-lg)', 'fontSize': '14px'}} code={code} language={args.children.props.className.replace('language-', '').replace('bash', 'markdown').replace('shell', 'markdown')}></nve-codeblock>
    </Unstyled>
  } else {
    return (args.children)
  }
}


class DocsCanvas extends LitElement {
  static properties = {
    source: {type: String},
    playground: {type: String},
    _sourceType: { state: true },
    _showSource: { state: true }
  };

  static styles = [css`
    :host {
      --padding: var(--nve-ref-space-xl) var(--nve-ref-space-lg);
    }

    nve-codeblock {
      --padding: var(--nve-ref-space-lg);
      --border-radius: 0;
      font-size: 14px;
    }

    nve-toolbar {
      --border-radius: 0;
      --padding: 0 var(--nve-ref-space-xxs);
      --border-bottom: 0;
      overflow: hidden;
      border-bottom-right-radius: var(--nve-ref-border-radius-md);
      border-bottom-left-radius: var(--nve-ref-border-radius-md);
      border-top: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    }

    [name='story'] {
      padding: var(--padding);
      display: block;
      resize: horizontal;
      overflow: auto;
      width: 100%;
    }

    .resizer {
      display: flex;
      align-items: stretch;
    }

    .story-backdrop {
      background: var(--nve-ref-color-neutral-200);
      min-height: 100%;
      flex: 1;
    }

    [internal-host] {
      border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
      border-radius: var(--nve-ref-border-radius-md);
    }

    .code {
      position: relative;
    }

    nve-copy-button {
      position: absolute;
      top: 4px;
      right: 4px;
    }
  `];

  render() {
    return html`
      <div internal-host>
        <div class="resizer">
          <slot name="story"></slot>
          <div class="story-backdrop"></div>
        </div>
        <div class="code" .hidden=${!this._showSource}>
          <nve-codeblock slot="codeblock" code=${this.source} language="html"></nve-codeblock>
          <nve-copy-button container="flat" behavior-copy .value=${this.source}></nve-copy-button>
        </div>
        <div style="width: 100%">
          <nve-toolbar container="flat">
            <nve-button container="flat" @click=${() => this._showSource = !this._showSource}>Source <nve-icon name="caret" size="sm" .direction=${this._showSource ? 'up' : 'down'}></nve-icon></nve-button>
            <nve-button .selected=${this._sourceType !== 'react'} container="flat" slot="suffix" @click=${() => this.#updateScope('html')}>HTML </nve-button>
            <nve-button .selected=${this._sourceType === 'react'} container="flat" slot="suffix" @click=${() => this.#updateScope('react')}>React</nve-button>
            <nve-button container="flat" slot="suffix">
              <a href=${this.playground} target="_blank">Playground</a>
            </nve-button>
          </nve-toolbar>
        </div>
      </div>
    `;
  }

  firstUpdated(props) {
    super.firstUpdated(props);
  }

  #updateScope(sourceType) {
    this._showSource = true;
    this._sourceType = sourceType;
    this.dispatchEvent(new CustomEvent('source-type-change', { detail: sourceType }));
  }
}

customElements.define('nve-docs-canvas', DocsCanvas);

const NveDocsCanvas = createComponent({
  tagName: 'nve-docs-canvas',
  elementClass: DocsCanvas,
  react: React,
  events: {
    onsourceTypeChange: 'source-type-change'
  }
});

export const Canvas = ({ of, story }) => {
  const resolvedOf = useOf(of || 'story', ['story', 'meta']);
  const globals = { ...addons.getChannel().data.setGlobals[0].globals, ...window.NVE_SB_GLOBALS };
  const sourceType = globals?.sourceType ?? '';
  const scope = globals?.scope ?? 'mlv';
  const source = getRenderString(resolvedOf.story.originalStoryFn());
  const playground = getPlaygroundURL(source, { globals, id: resolvedOf.story.id });

  const [updatedSource, setUpdatedSource] = useState(source, { scope, sourceType });
  const updateSource = (sourceType) => setUpdatedSource(updateScope(source, { scope, sourceType }));

  return (
    <NveDocsCanvas source={updatedSource} playground={playground} onsourceTypeChange={e => updateSource(e.detail)}>
      <div slot="story"><Story of={of} inline={story?.inline} width={story?.width} height={story?.height} /></div>
    </NveDocsCanvas>
  );
};
