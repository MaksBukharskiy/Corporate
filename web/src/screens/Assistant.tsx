import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import {
  LIN_NAME,
  answer,
  buildFacts,
  greeting,
  linRoleLine,
  linStats,
  suggestedQuestions,
  type AiRole,
} from '../ai';
import { useStore } from '../store';

type Msg = { id: number; from: 'user' | 'bot' | 'note'; text: string };

let seq = 1;

export function Assistant({ role }: { role: AiRole }) {
  const store = useStore();
  const facts = useMemo(
    () =>
      buildFacts({
        role,
        companyId: store.session?.companyId,
        merchantId: store.session?.merchantId,
        companies: store.companies,
        users: store.users,
        merchants: store.merchants,
        offers: store.offers,
        requests: store.requests,
        partnerships: store.partnerships,
        prices: store.prices,
      }),
    [
      role,
      store.session?.companyId,
      store.session?.merchantId,
      store.companies,
      store.users,
      store.merchants,
      store.offers,
      store.requests,
      store.partnerships,
      store.prices,
    ],
  );

  const chips = suggestedQuestions(role).slice(0, 5);
  const canDo = chips.slice(0, 4);
  const stats = useMemo(() => linStats(facts), [facts]);
  const roleLine = linRoleLine(facts);
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: seq++, from: 'bot', text: greeting(facts) }]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  function scrollSoon() {
    window.requestAnimationFrame(() => bottom.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }));
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setDraft('');
    setBusy(true);
    setMsgs((prev) => [...prev, { id: seq++, from: 'user', text: q }]);
    scrollSoon();
    const res = await answer(role, q, facts);
    setMsgs((prev) => [
      ...prev,
      ...(res.notice ? [{ id: seq++, from: 'note' as const, text: res.notice }] : []),
      { id: seq++, from: 'bot', text: res.text },
    ]);
    setBusy(false);
    scrollSoon();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  }

  return (
    <div className="ai-page">
      <div className="ai-head">
        <h1>{LIN_NAME}</h1>
        <p className="lead">{roleLine}. Вопросы по данным кабинета.</p>
      </div>
      <div className="ai-stage">
        <div className="ai-col">
          <div className="ai-thread">
            {msgs.map((m) => (
              <div key={m.id} className={`ai-bubble ${m.from}`}>
                {m.from === 'bot' ? <span className="ai-who">{LIN_NAME}</span> : null}
                {m.text}
              </div>
            ))}
            {busy ? (
              <div className="ai-bubble bot typing" aria-hidden>
                <i />
                <i />
                <i />
              </div>
            ) : null}
            <div ref={bottom} />
          </div>
          <div className="ai-chips">
            {chips.map((c) => (
              <button key={c} className="ai-chip" type="button" disabled={busy} onClick={() => void send(c)}>
                {c}
              </button>
            ))}
          </div>
          <form className="ai-form" onSubmit={onSubmit}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder="Напишите вопрос"
              rows={2}
              disabled={busy}
            />
            <button className="ai-send" type="submit" disabled={busy || !draft.trim()} aria-label="Отправить">
              <Send size={18} />
            </button>
          </form>
        </div>
        <aside className="ai-lin">
          <div className="ai-lin-head">
            <span className="ai-lin-mark" aria-hidden>
              L
            </span>
            <div>
              <strong>{LIN_NAME}</strong>
              <p>{roleLine}</p>
            </div>
          </div>
          <p className="ai-lin-lead">Могу ответить</p>
          <ul className="ai-lin-can">
            {canDo.map((c) => (
              <li key={c}>
                <button type="button" disabled={busy} onClick={() => void send(c)}>
                  {c}
                </button>
              </li>
            ))}
          </ul>
          <p className="ai-lin-lead">Сейчас</p>
          <dl className="ai-lin-stats">
            {stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}
