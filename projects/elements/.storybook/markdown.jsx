import React from 'react';
import { Unstyled } from '@storybook/blocks';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';

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
    <ul nve-text="list">{args.children}</ul>
  </Unstyled>
  )
}
