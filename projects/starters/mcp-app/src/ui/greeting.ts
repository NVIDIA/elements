import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import { App, applyDocumentTheme, type McpUiHostContext } from '@modelcontextprotocol/ext-apps';

interface HelloToolResult {
  content?: {
    text?: unknown;
    type?: string;
  }[];
  isError?: boolean;
  structuredContent?: {
    greeting?: unknown;
  };
}

const FALLBACK_GREETING = 'Hello from an Elements MCP App.';
const ERROR_GREETING = 'The MCP tool returned an error.';

const app = new App(
  {
    name: 'elements-demo-mcp-app',
    version: '0.0.0'
  },
  {}
);

const greetingElement = document.querySelector<HTMLElement>('#greeting');
const refreshButton = document.querySelector<HTMLElement>('#refresh-greeting');

app.ontoolresult = result => setGreeting(getGreeting(result));
app.onhostcontextchanged = context => applyHostContext(context);

refreshButton?.addEventListener('click', () => {
  void refreshGreeting();
});

void connectApp();

async function connectApp() {
  try {
    await app.connect();
    applyHostContext(app.getHostContext());
  } catch {
    setGreeting('Unable to connect to the MCP host.');
  }
}

async function refreshGreeting() {
  refreshButton?.setAttribute('disabled', '');

  try {
    const result = await app.callServerTool({ name: 'hello', arguments: {} });
    setGreeting(getGreeting(result));
  } catch {
    setGreeting('Unable to refresh the greeting.');
  } finally {
    refreshButton?.removeAttribute('disabled');
  }
}

function getGreeting(result: HelloToolResult) {
  if (result.isError) return ERROR_GREETING;

  const structuredGreeting = result.structuredContent?.greeting;
  if (typeof structuredGreeting === 'string') return structuredGreeting;

  const textContent = result.content?.find(item => item.type === 'text' && typeof item.text === 'string')?.text;
  return typeof textContent === 'string' ? textContent : FALLBACK_GREETING;
}

function setGreeting(greeting: string) {
  if (!greetingElement) return;
  greetingElement.textContent = greeting;
}

function applyHostContext(context: McpUiHostContext | null | undefined) {
  if (context?.theme) {
    applyDocumentTheme(context.theme);
    document.documentElement.setAttribute('nve-theme', context.theme);
  }
}
