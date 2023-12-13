import React from 'react';
import '@elements/elements/icon/define.js';
import '@elements/elements/divider/define.js';

export const H1 = ({ children }) => (
  <h1 nve-text="display">{children}</h1>
)

export const H2 = (args) => {
  const id = new URLSearchParams(window.location.search).get('id');
  return (
  <div nve-layout="column gap:xs align:stretch pad-top:xl">
    <h2 nve-text="heading xl" id={args.id} className="dynamic-anchor">
      <a href={`./?path=/docs/${id}#${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
      {args.children}
    </h2>
    <nve-divider></nve-divider>
  </div>
  )
}

export const H3 = (args) => {
  const id = new URLSearchParams(window.location.search).get('id');
  return (
  <h3 id={args.id} nve-text="heading lg"  nve-layout="pad-top:lg" className="dynamic-anchor">
    <a href={`./?path=/docs/${id}#${args.id}`} target="_blank"><nve-icon name="link"></nve-icon></a>
    {args.children}
  </h3>
  )
}

export const P = (args) => {
  return (
    <p nve-text="body">{args.children}</p>
  )
}
