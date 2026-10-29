// Append streamed text so Scroll Box observes real content growth.
const stream = document.querySelector('#chat-stream');
const output = document.querySelector('#chat-response');
const text = document.createTextNode('');
output.append(text);
function update() {
  const next = stream.dataset.output ?? '';
  if (next.startsWith(text.data)) text.appendData(next.slice(text.length));
  else text.data = next; // Restore the earlier response when scrubbing backward.
}
new MutationObserver(update).observe(stream, { attributes: true, attributeFilter: ['data-output'] });
update();
