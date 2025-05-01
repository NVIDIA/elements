import tokens from '@nvidia-elements/themes/index.json' with { type: 'json' };

export async function tokensShortcode(token) {
  return Object.entries(tokens)
    .filter(([name]) => name.includes(token))
    .map(([name, value]) => {
      return /* html */ `- ${name}: ${value}`;
    })
    .join('\n');
}
