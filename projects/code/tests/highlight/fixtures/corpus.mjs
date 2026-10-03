// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { jsxCases, genericCases } from './jsx-corpus.mjs';

export const scriptCases = [
  ...['javascript', 'tsx'].flatMap(language =>
    jsxCases
      .filter(sample => !sample.languages || sample.languages.includes(language))
      .map(({ name, text }) => ({ name, text, language }))
  ),
  ...genericCases.map((text, index) => ({ language: 'typescript', name: `Generic context ${index}`, text })),
  {
    language: 'typescript',
    name: 'Type assertions and multiline generic arrows',
    text: 'const value = <Type>input;\nconst f = <T>\n(value: T) => value;\nconst tail = 42;'
  },
  {
    language: 'tsx',
    name: 'Multiline JSX child text and generic arrows',
    text: 'const view = <Widget>\n(label)\n</Widget>;\nconst f = <T,>(value: T) => value;\nconst tail = 42;'
  },
  {
    name: 'Documentation parameters and multiline types',
    language: 'javascript',
    text: '/** @param {Array<\n * string>} name - description\n * @param value - input\n * @returns {number} total */\nfunction read(name, value) { return 42; }'
  },
  {
    name: 'Substitution vocabulary and inherited colors',
    language: 'typescript',
    text: 'const x = `${console.log(value)} ${Date()} ${obj.class} ${ {x: 1, true: 2} }`;'
  },
  {
    name: 'Declarations and builtins',
    language: 'typescript',
    text: 'export interface Person { name: string; age?: number; }\ntype Pair<T> = [T, T];\nconst enabled: boolean = true;\nclass PersonImpl extends Map { readonly size = 42; }'
  },
  {
    name: 'Methods and property keywords',
    language: 'javascript',
    text: 'const obj = { return: 42, class: "name", get value() { return this.value; } };\nobj.return; obj.class; obj.Date; console.log(obj);'
  },
  {
    name: 'Arrow and async functions',
    language: 'typescript',
    text: 'const greet = (name: string): string => `Hello ${name}`;\nasync function read<T>(value: T): Promise<T> { return value; }\nconst load = async () => await read(42);'
  },
  {
    name: 'Decorators and types',
    language: 'typescript',
    text: '@sealed\nexport class Service {\n  @property({ type: String }) name?: string;\n  private count = 0;\n  constructor() { this.count++; }\n}'
  },
  {
    name: 'Documentation comments',
    language: 'javascript',
    text: '/** @param {string} [name="world"] A greeting.\n * @returns {string} The result. */\nfunction greet(name) { return "hello"; }\n// TODO: improve this'
  },
  {
    name: 'Regex division and properties',
    language: 'javascript',
    text: 'const re = /a[\\/]b+/gi;\nlet ratio = left / right / 2;\nif (re.test("a/b")) return /x/.exec(value);\nobj.const; obj.setTimeout(); const x = { true: 1 };'
  },
  {
    name: 'Template nesting',
    language: 'javascript',
    text: 'const value = `outer ${ {x: `inner ${42}`} } tail`;\nconst escaped = `\\` \\${plain}`;'
  },
  {
    name: 'Unfinished regions',
    language: 'typescript',
    text: 'const text = `open ${ {name: "partial"}\n// still in substitution\n42'
  },
  {
    name: 'Tagged templates',
    language: 'javascript',
    text: 'const markup = html`<div class="name">${value}</div>`;\nconst style = css`div { color: red; }`;'
  }
];

export const yamlCases = [
  {
    name: 'YAML scalar headers',
    language: 'yaml',
    text: 'notes: |2- # comment\n  first\nnext: true\nfolded: >+\n  some\n  words'
  },
  {
    name: 'YAML values and Unicode comments',
    language: 'yaml',
    text: 'name: H100\nenabled: true\ncount: 42 # π\nlist: [null, "one", 2]\nanchor: &base {value: 1}\nalias: *base'
  }
];

export const tomlCases = [
  {
    name: 'TOML sections and inline values',
    language: 'toml',
    text: '[test.group]\n"na\\u006de".part = {x = 42, enabled = true}\nlist = [1, "two", 3]\n[[products]]\nname = "H100" # note'
  },
  {
    name: 'TOML multiline strings and arrays',
    language: 'toml',
    text: 'title = """first\nsecond\\nthird"""\nraw = \'\'\'keep \\raw\ntext\'\'\'\nlist = [\n  1, # item\n  {count = 2},\n]\nbad = "oops\\q"\nnext = false'
  },
  {
    name: 'TOML quoted keys and dates',
    language: 'toml',
    text: '\'literal.key\' = 1979-05-27T07:32:00Z\n"with=equals".part = 0xFF\n"escape\\q" = "unterminated\nnext = 42'
  }
];

export const pythonCases = [
  {
    name: 'Python declarations and interpolated strings',
    language: 'python',
    text: '@cache\ndef read(name: str) -> str:\n    text = f"hello {name.upper()} {42}"\n    return text # comment\nclass Reader(object):\n    pass'
  },
  {
    name: 'Python raw and multiline strings',
    language: 'python',
    text: 'pattern = r"[a-z]+\\d*"\ntext = """first\nsecond"""\nraw = r\'keep \\raw\'\nvalue = f"{ {\'x\': 42} }"\n# type: str'
  },
  {
    name: 'Python line continuation and unfinished strings',
    language: 'python',
    text: 'value = \\\n  "first" \\\n  "second"\nnext = True\ntext = f"{value!r:>{42}}"\nopen = """unfinished\n# still a string'
  }
];

export const cssCases = [
  {
    name: 'CSS selectors and nested values',
    language: 'css',
    text: '/* theme */\nnve-card#main.item[href^="https"]:hover { --size: 2rem; color: RED; width: calc(100% - var(--size)); background: url(icons/a\\)b.svg); }'
  },
  {
    name: 'CSS at rules and nesting',
    language: 'css',
    text: '@media screen and (min-width: 42px) {\n  article:has(.title) { content: "{"; & .name { padding: 2em; } }\n}\n@keyframes spin { from { opacity: 0; } 50% { opacity: .5; } }\n@supports (display: grid) { div { display: grid; } }'
  },
  {
    name: 'CSS continuation and Unicode selectors',
    language: 'css',
    text: '.π, .emoji😀, .a\\:b[data-kind=fast i] {\n  content: "first\\\nsecond"; --config: {size: 42}; color: #ff00ff;\n}\n.next { content: "unfinished\n color: blue; }'
  }
];

export const markupCases = [
  {
    name: 'HTML attributes and entities',
    language: 'html',
    text: '<!DOCTYPE html>\n<nve-card disabled data-name="H100 &amp; A100" title=hello&amp;world>\n  <!-- comment --> &lt; &#x1F600; <svg:path ns:attr="value"/>\n</nve-card>'
  },
  {
    name: 'XML declarations and CDATA',
    language: 'xml',
    text: '<?xml version="1.0"?>\n<!DOCTYPE root [<!ENTITY name "value"><!-- note -->]>\n<ns:root ns:value="&name;"><π><![CDATA[<raw> & untouched]]></π></ns:root>'
  },
  {
    name: 'HTML inline embedded recovery',
    language: 'html',
    text: '<SCRIPT src="</script>">const x="open </SCRIPT><p>after</p>\n<style>p { color: red; content: "open </style><i>done</i>\n<script/>plain <style/>after'
  },
  {
    name: 'Markup embedded nesting and end names',
    language: 'xml',
    text: '<script>const value = `outer ${ {x: `inner ${42}`} }`;\nconst text = "</scriptx>"; /* open </script><p>tail</p>\n<style>div { width: calc(100% - (2px)); color: blue; }</style>'
  }
];

export const goCases = [
  {
    name: 'Go generic declarations and methods',
    language: 'go',
    text: `package main
import "fmt"
type Pair[T any] struct { value T; label string \`json:"label"\` }
type (
  Number interface { ~int | ~float64 }
  Callback func(x Pair[int]) error
)
func (p *Pair[T]) Read(x, y T) (T, error) { return p.value, nil }
func Minimum[T Number](x, y T) T { if x < y { return x }; return y }
var pointer *Pair[int] = new(Pair[int])
var cache = make(map[string]*Pair[int], count)
fmt.Println(pointer.Read(42, 7)); clear(cache); println(min(1, 2))`
  },
  {
    name: 'Go numeric forms and literal escapes',
    language: 'go',
    text:
      String.raw`const nums = []complex128{42, 1_000, 0b_1010, 0o755, 0755, 0x_FF, .5, 1., 1e-3, 0x1.fp+2, 0x.8p-1, 2i, 0b11i}
var malformed = []any{0b102, 0xZ, 1__2, 42abc}
var π = 'π'; var emoji = '😀'; var escaped = '\u03c0'; var bad = 'ab'
var text = "quote\" slash\\ hex\x41 unicode\U0001F600 invalid\q broken\xZZ %02d"
var raw = ` +
      '`first\\n\nsecond %s`' +
      '\n// TODO: Unicode name β42 is one variable\nβ42 := true'
  },
  {
    name: 'Go multiline signatures and unfinished regions',
    language: 'go',
    text: `func Transform[T any](
  values []T,
  visit func(item T) T,
) []T { return append(values, visit(values[0])) }
var transform = func (item Custom) Custom { return item }
func Receiver(
  value map[string][]*Custom,
) {
  println("unfinished
  var next = 42
  /* unfinished comment
  return value
}`
  }
];
