import { useEffect, useRef, useState } from 'react';
import { toRequestMessages, floraErrorReply } from '../chat-history.js';
import { getTurnstileToken } from './turnstile.ts';

export type ChatMessage = { from: 'flora' | 'guest'; text: string };

export const EXPRESSIONS = ['warm', 'explain', 'happy', 'thinking', 'shock', 'kind', 'return', 'aval_work'] as const;
const REST = 'warm';

const GREETING = "Hi, I'm Flora — Jean's partner on these cases. Ask me about any of them, how he works, or how to reach him.";

export function useFloraChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: 'flora', text: GREETING }]);
  const [expression, setExpression] = useState<string>(REST);
  const [pending, setPending] = useState(false);
  // Refs: cliques seguidos chegam antes de o estado re-renderizar.
  const inFlight = useRef(false);
  const history = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const restTimer = useRef(0);

  useEffect(() => () => clearTimeout(restTimer.current), []);

  // A Flora segura a expressão por um tempo e volta ao estado parado.
  const hold = (expr: string, ms: number) => {
    clearTimeout(restTimer.current);
    setExpression((EXPRESSIONS as readonly string[]).includes(expr) ? expr : REST);
    restTimer.current = window.setTimeout(() => setExpression(REST), ms);
  };
  const say = (text: string) => setMessages((m) => [...m, { from: 'flora', text }]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || inFlight.current) return;
    if (text.length > 1200) {
      say('Please keep your message under 1,200 characters.');
      return;
    }
    inFlight.current = true;
    setPending(true);
    setMessages((m) => [...m, { from: 'guest', text }]);
    clearTimeout(restTimer.current);
    setExpression('thinking');

    const sayError = (status: number) => { say(floraErrorReply(status)); hold('shock', 2500); };

    try {
      let turnstileToken: string;
      try {
        turnstileToken = await getTurnstileToken('#flora-turnstile');
      } catch {
        sayError(403);
        return;
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toRequestMessages(history.current, text), turnstileToken }),
        signal: AbortSignal.timeout(30_000), // o Worker desiste do Claude em ~25 s; aqui um pouco depois
      });
      if (!res.ok) {
        sayError(res.status);
        return;
      }
      const data: { reply: string; expression?: string } = await res.json();
      say(data.reply);
      history.current.push({ role: 'user', content: text }, { role: 'assistant', content: data.reply });
      hold(data.expression || REST, Math.max(2500, Math.min(data.reply.length * 50, 7000)));
    } catch {
      sayError(0);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return { messages, expression, pending, send };
}
