import React from 'react';
import { Unstyled } from '@storybook/blocks';
// import '@nvidia-elements/core/icon/define.js';
// import '@nvidia-elements/core/divider/define.js';

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
        <a href={`./?path=/docs/${id}#${args.id}`} target="_blank"><mlv-icon name="link"></mlv-icon></a>
        {args.children}
      </h2>
      <mlv-divider></mlv-divider>
    </div>
  </Unstyled>
  )
}

export const H3 = (args) => {
  const id = new URLSearchParams(window.location.search).get('id');
  return (
  <Unstyled>
    <h3 id={args.id} mlv-text="heading lg"  mlv-layout="pad-top:lg" className="dynamic-anchor">
      <a href={`./?path=/docs/${id}#${args.id}`} target="_blank"><mlv-icon name="link"></mlv-icon></a>
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
    <ul mlv-text="list">{args.children}</ul>
  </Unstyled>
  )
}
