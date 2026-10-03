// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const pythonProfileCases = [
  {
    name: 'raw prefixes preserve literal backslashes and escaped quotes',
    text: String.raw`lower = r"\n\t\u1234\"tail"; upper = R'\n\t\'tail'; count = 42`,
    checks: [
      ['r"', 'string'],
      ['\\n\\t\\u1234\\"tail', 'string'],
      ["R'", 'string'],
      ["\\n\\t\\'tail", 'string'],
      ['count = 42', 'number', 8]
    ]
  },
  {
    name: 'raw byte prefix order and case preserve literal backslashes',
    text: String.raw`a = rb'\n'; b = br"\t"; c = rB'\u1234'; d = Br"\x42"; e = RB'\r'; tail = 9`,
    checks: [
      ["rb'", 'string'],
      ['br"', 'string'],
      ["rB'", 'string'],
      ['Br"', 'string'],
      ["RB'", 'string'],
      ['\\n', 'string'],
      ['\\t', 'string'],
      ['\\u1234', 'string'],
      ['\\x42', 'string'],
      ['9', 'number']
    ]
  },
  {
    name: 'raw multiline literals retain quotes and line checkpoints',
    text: 'a = r"""first \\n\n"second" \\"tail\n"""\nb = br\'\'\'bytes \\x42\nsecond\'\'\'\ncount = 42',
    checks: [
      ['r"""', 'string'],
      ['first \\n', 'string'],
      ['"second"', 'string'],
      ['\\"tail', 'string'],
      ["br'''", 'string'],
      ['\\x42', 'string'],
      ['count = 42', 'number', 8]
    ]
  },
  {
    name: 'ordinary literals still classify decoded escapes',
    text: String.raw`a = "\n\u1234"; b = b'\x42'; count = 42`,
    checks: [
      ['\\n\\u1234', 'escape'],
      ['\\x42', 'escape'],
      ['count = 42', 'number', 8]
    ]
  },
  {
    name: 'raw formatted literals keep ordinary expression strings',
    text: String.raw`a = rf"\n {len('\t')} \u1234 {42}"; b = Fr'\x42 {True}'`,
    checks: [
      ['rf"', 'string'],
      ['\\n ', 'string'],
      ['len', 'builtin'],
      ['\\t', 'escape'],
      ['\\u1234 ', 'string'],
      ['42', 'number'],
      ["Fr'", 'string'],
      ['\\x42 ', 'string'],
      ['True', 'literal']
    ]
  },
  {
    name: 'replacement fields allow reused quotes and multiline comments',
    text: 'value = f"before {\n    {"key": 42}["key"] # ignore } and "\n} after"\ntail = 9',
    checks: [
      ['before ', 'string'],
      ['"key"', 'string'],
      ['42', 'number'],
      ['# ignore } and "', 'comment'],
      [' after', 'string'],
      ['9', 'number']
    ]
  },
  {
    name: 'nested formatted literals keep separate quote and expression state',
    text: 'value = f"outer {f"inner { {\'key\': 42} }"} tail"\nnext = True',
    checks: [
      ['outer ', 'string'],
      ['inner ', 'string'],
      ["'key'", 'string'],
      ['42', 'number'],
      [' tail', 'string'],
      ['True', 'literal']
    ]
  },
  {
    name: 'format specifications keep nested replacement fields',
    text: 'value = f"{42!r:>{2}.{3}f} {{literal}}"\ntail = False',
    checks: [
      ['42', 'number'],
      ['!r:>', 'meta'],
      ['2', 'number'],
      ['3', 'number'],
      ['{{', 'escape'],
      ['literal', 'string'],
      ['False', 'literal']
    ]
  },
  {
    name: 'declarations defaults annotations and decorators keep semantic categories',
    text: '@cache(limit=42)\nasync def read(name: str = "guest", /, *, enabled: bool = True) -> str:\n    """read docs"""\n    return await fetch(name)\nclass Reader(Base):\n    pass',
    checks: [
      ['cache', 'function'],
      ['42', 'number'],
      ['async', 'keyword'],
      ['def', 'keyword'],
      ['read', 'function'],
      ['str', 'type'],
      ['"guest"', 'string'],
      ['bool', 'type'],
      ['True', 'literal'],
      ['read docs', 'string'],
      ['return', 'keyword'],
      ['await', 'keyword'],
      ['class', 'keyword'],
      ['Reader', 'class'],
      ['pass', 'keyword']
    ]
  },
  {
    name: 'imports lambdas comprehensions and exceptions keep executable syntax',
    text: 'from pathlib import Path as File\nitems = [len(value) for value in data if value is not None]\ntry:\n    result = (lambda x=42: x + 1)(9)\nexcept ValueError:\n    raise RuntimeError("bad") from None',
    checks: [
      ['from', 'keyword'],
      ['import', 'keyword'],
      ['as', 'keyword'],
      ['len', 'builtin'],
      ['for', 'keyword'],
      ['in', 'keyword'],
      ['if', 'keyword'],
      ['None', 'literal'],
      ['try', 'keyword'],
      ['lambda', 'keyword'],
      ['42', 'number'],
      ['except', 'keyword'],
      ['ValueError', 'type'],
      ['raise', 'keyword'],
      ['"bad"', 'string']
    ]
  },
  {
    name: 'Unicode declarations and numeric forms preserve UTF-16 offsets',
    text: 'def χρόνος(π: float):\n    return "😀" + str(0x2A + 1_000 + 1.5e-2 + 3j)\nclass Κατηγορία:\n    pass',
    checks: [
      ['χρόνος', 'function'],
      ['float', 'type'],
      ['"😀"', 'string'],
      ['0x2A', 'number'],
      ['1_000', 'number'],
      ['1.5e-2', 'number'],
      ['3j', 'number'],
      ['Κατηγορία', 'class']
    ]
  },
  {
    name: 'unfinished ordinary literals recover at the next line',
    text: 'value = "unfinished\ncount = 42\nraw = r"unfinished\nnext = True',
    checks: [
      ['unfinished', 'string'],
      ['42', 'number'],
      ['True', 'literal']
    ]
  },
  {
    name: 'triple quoted formatted literals persist across embedded expressions',
    text: 'value = f"""first {\n {"x": 42}\n}\nsecond {False}\n"""\ntail = 9',
    checks: [
      ['first ', 'string'],
      ['"x"', 'string'],
      ['42', 'number'],
      ['second ', 'string'],
      ['False', 'literal'],
      ['9', 'number']
    ]
  }
];

// Complete units keep repeated benchmark copies from sharing unfinished state.
export const pythonWorkload = count =>
  pythonProfileCases
    .filter(sample => !sample.name.startsWith('unfinished'))
    .map(sample => sample.text)
    .join('\n')
    .concat('\n')
    .repeat(count);
