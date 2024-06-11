import React from 'react';
import { Unstyled, Source } from '@storybook/blocks';
import { addons } from '@storybook/preview-api';
import { updateScope } from './utils.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';

export const H1 = ({ children }) => (
  <Unstyled>
    <h1 mlv-text="display">{children}</h1>
  </Unstyled>
)

export const H2 = (args) => {
  const id = new URLSearchParams(window.location.search).get('id');
  return (
  <Unstyled>
    <div mlv-layout="column gap:xs align:stretch pad-top:xl">
      <h2 mlv-text="heading xl" id={args.id} className="dynamic-anchor">
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
    <h3 id={args.id} mlv-text="heading lg"  mlv-layout="pad-top:lg" className="dynamic-anchor">
      <a href={`./?path=/docs/${id}#${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
      {args.children}
    </h3>
  </Unstyled>
  )
}

export const P = (args) => {
  return (
  <Unstyled>  
    <p mlv-text="body">{args.children}</p>
  </Unstyled>
  )
}

export const UL = (args) => {
  return (
  <Unstyled>
    <ul mlv-text="list" mlv-layout="column gap:xs">{args.children}</ul>
  </Unstyled>
  )
}

export const OL = (args) => {
  return (
  <Unstyled>
    <ol mlv-text="list" mlv-layout="column gap:xs">{args.children}</ol>
  </Unstyled>
  )
}

export const PRE = (args) => {
  // workaround https://github.com/storybookjs/storybook/issues/20634
  const globals = { ...addons.getChannel().data.setGlobals[0].globals, ...window.NVE_SB_GLOBALS };

  if (args.children?.props?.children) {
    const code = updateScope(args.children.props.children, {
      scope: globals?.scope ?? 'mlv',
      sourceType: globals?.sourceType ?? ''
    });

    return (<Source dark code={code} language={args.children.props.className.replace('language-', '')} />)
  } else {
    return (args.children)
  }
}
