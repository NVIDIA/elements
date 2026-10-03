// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const bashCases = [
  {
    name: 'Bash declarations and nested expansions',
    language: 'bash',
    text: String.raw`#!/usr/bin/env bash
NAME=world
function greet() {
  local value="${'${'}NAME:-$(printf '%s' "$1")}" 
  echo "$value $((16#ff + 2 * (3 + 4)))"
}
if [[ $NAME =~ ^[A-Z]+$ ]]; then greet; fi
cat <(printf '%s' "$USER") > /tmp/then
echo after`
  },
  {
    name: 'Bash heredoc header and expansions',
    language: 'bash',
    text: String.raw`cat <<END.* | grep value # header comment
Hello $USER $(echo world) $((2 + (3)))
"literal quote" \" stays literal
END.* trailing text
END.*
echo after`
  },
  {
    name: 'Bash quoted and indented heredocs',
    language: 'bash',
    text: 'cat <<-\'EOF\' >out\n\t$USER $(echo literal)\n EOF\n\tEOF\necho after\ncat <<"END"\n$USER `literal`\nEND\necho final'
  },
  {
    name: 'Bash quoting and unfinished regions',
    language: 'bash',
    text: String.raw`echo '$USER $(literal)'
printf '%s' $'line\nhex\x41unicode\u03c0quote\''
echo "escaped \$USER \" actual $USER ${'${'}items[2]:-fallback}"
echo \#literal value#suffix # comment
echo "unfinished
if false; then echo still_string`
  }
];

export const shellCases = [
  {
    name: 'Shell prompts and uncolored output',
    language: 'shell',
    text: '$ echo "$USER"\noutput $literal\n(venv) user@host:/work$ cat "file"\nfile contents\n➜ echo true\nplain output'
  },
  {
    name: 'Shell continuation and escaped backslashes',
    language: 'shell',
    text: '$ printf "%s" \\\n  "$USER"\noutput\n$ echo escaped \\\\\nplain output\n$ echo "unfinished\nafter output'
  },
  {
    name: 'Shell nested substitution and Unicode prompts',
    language: 'shell',
    text: '❯ echo "$(printf \'%s\' "$USER")"\noutput π\nλ echo 42\noutput 42\nuser@host:/tmp$ echo "open $(echo 1\nafter'
  }
];
