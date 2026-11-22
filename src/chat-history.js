// Monta o que o site manda para /api/chat e as falas da Flora quando algo dá errado.

// O Worker aceita até 12 mensagens começando e terminando em `user`; 11 cabe com folga.
export function toRequestMessages(history, text, max = 11) {
  // resposta da Flora longa demais seria recusada pelo Worker e travaria a conversa
  const all = [...history, { role: 'user', content: text }].slice(-max)
    .map((m) => (m.role === 'assistant' ? { ...m, content: m.content.slice(0, 4000) } : m));
  while (all.length && all[0].role !== 'user') all.shift();
  return all;
}

export function floraErrorReply(status) {
  if (status === 429) return 'Too many messages in a row — give me a minute and try again.';
  if (status === 503) return "I'm taking a short break. Please use the contact section below.";
  if (status === 403) return "I couldn't verify your browser. Reload the page and try again.";
  return "I'm having trouble connecting right now. Try again in a moment.";
}
