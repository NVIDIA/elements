import React, { useState, useRef, useEffect } from 'react';
import { Unstyled, useOf } from '@storybook/blocks';
import { Story } from '@storybook/addon-docs';
import { addons } from '@storybook/preview-api';
import { setSourcePackageScope } from '@nve-internals/elements-api';
import { getRenderString, createPlaygroundURLFromStorySource } from '@nve-internals/elements-api';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nve-internals/elements-api/canvas/define.js';

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
        <a href={`./?path=/docs/${id}&anchor=${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
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
    <h3 id={args.id} nve-text="heading lg" nve-layout="pad-top:lg" className="dynamic-anchor">
      <a href={`./?path=/docs/${id}&anchor=${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
      {args.children}
    </h3>
  </Unstyled>
  )
}

export const H4 = (args) => {
  const id = new URLSearchParams(window.location.search).get('id');
  return (
  <Unstyled>
    <h4 id={args.id} nve-text="heading md" nve-layout="pad-top:lg" className="dynamic-anchor">
      <a href={`./?path=/docs/${id}&anchor=${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
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
  const code = setSourcePackageScope(args.children, {
    scope: globals?.scope ?? 'mlv',
    sourceType: globals?.sourceType ?? ''
  });

  return <code nve-text="code">{code}</code>
}

export const PRE = (args) => {
  // workaround https://github.com/storybookjs/storybook/issues/20634
  if (args.children?.props?.children) {
    const globals = { ...addons.getChannel().data.setGlobals[0].globals, ...window.NVE_SB_GLOBALS };
    const code = setSourcePackageScope(args.children.props.children, {
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

export const Canvas = ({ of, story }) => {
  const resolvedOf = useOf(of || 'story', ['story', 'meta']);
  const globals = { ...addons.getChannel().data.setGlobals[0].globals, ...window.NVE_SB_GLOBALS };
  const scope = globals?.scope ?? 'mlv';
  const source = getRenderString(resolvedOf.story.originalStoryFn());
  const playground = createPlaygroundURLFromStorySource(source, { globals, id: resolvedOf.story.id });
  const [sourceType, setSourceType] = useState(globals?.sourceType ?? '');
  const [updatedSource, setUpdatedSource] = useState(source, { scope, sourceType });
  const [updatedShowSource, setUpdatedShowSource] = useState(false);
  const canvasRef = useRef(null);
  const htmlBtnRef = useRef(null);
  const reactBtnRef = useRef(null);

  const updateSource = (sourceType) => {
    setUpdatedShowSource(true);
    setSourceType(sourceType);
    setUpdatedSource(setSourcePackageScope(source, { scope, sourceType }));
  };

  useEffect(() => {
    canvasRef.current.source = updatedSource;
    canvasRef.current.showSource = updatedShowSource;
    htmlBtnRef.current.selected = sourceType !== 'react';
    reactBtnRef.current.selected = sourceType === 'react';
  });

  return (
    <nve-api-canvas ref={canvasRef}>
      <div style={{ height: story?.height ?? '', width: story?.width, overflow: 'hidden' }}><Story of={of} inline={story?.inline} height={story?.height} /></div>
      <nve-button ref={htmlBtnRef} container="flat" slot="suffix" onClick={() => updateSource('html')}>HTML</nve-button>
      <nve-button ref={reactBtnRef} container="flat" slot="suffix" onClick={() => updateSource('react')}>React</nve-button>
      <nve-button container="flat" slot="suffix">
        <a href={playground} target="_blank">Playground</a>
      </nve-button>
    </nve-api-canvas>
  );
};


export const Redirect = ({ path }) => {
  useEffect(() => {
    globalThis.parent.location.replace(`${window.location.pathname.split( '/api/' )[0]}/${path}`);
  });
  return <p>You will be redirected.</p>
};
