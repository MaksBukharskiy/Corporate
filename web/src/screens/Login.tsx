import { useEffect, useMemo, useState } from 'react';
import { categoryLabel } from '../data';
import { useStore } from '../store';
import type { Category, User } from '../types';

type Picker = 'hr' | 'merchant' | null;

export function LoginScreen() {
  const { login, loginAs, register, users, companies, merchants } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [role, setRole] = useState<'hr' | 'merchant'>('hr');
  const [error, setError] = useState('');
  const [picker, setPicker] = useState<Picker>(null);
  const [query, setQuery] = useState('');

  function submit() {
    const err =
      mode === 'login'
        ? login(email, password)
        : register({
            name,
            email,
            password,
            role,
            companyName,
            merchantName,
            city,
            category: category || undefined,
          });
    setError(err ?? '');
  }

  function pickUser(user: User) {
    setError('');
    const err = loginAs(user.id);
    setError(err ?? '');
    if (!err) setPicker(null);
  }

  function openPicker(next: Picker) {
    setMode('login');
    setError('');
    setQuery('');
    setPicker(next);
  }

  const q = query.trim().toLowerCase();
  const hrs = useMemo(
    () =>
      users.filter(
        (u) => u.role === 'hr' && u.active !== false && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)),
      ),
    [users, q],
  );
  const merchantAccounts = useMemo(
    () =>
      users.filter(
        (u) => u.role === 'merchant' && u.active !== false && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)),
      ),
    [users, q],
  );

  return (
    <div className="login login-in">
      <aside className="login-brand">
        <LoginScene />
        <div className="login-brand-foot">
          <p className="login-kicker">HR · мерчант · админ</p>
          <div className="login-brand-title">
            <span className="login-brand-mark">
              <img src="/logomark.png" alt="" />
            </span>
            <h1>Corporate</h1>
          </div>
          <p className="sub">Сотрудники входят в мобильном приложении.</p>
        </div>
      </aside>

      <section className="login-pane">
        <div className="login-form">
          <div className="demo-bar">
            <button className="demo-btn" type="button" onClick={() => openPicker('hr')}>
              HR
            </button>
            <button className="demo-btn" type="button" onClick={() => openPicker('merchant')}>
              Мерчант
            </button>
            <button
              className="demo-btn"
              type="button"
              onClick={() => {
                setMode('login');
                setEmail('admin@click.uz');
                setPassword('1234');
                setError('');
                const err = login('admin@click.uz', '1234');
                setError(err ?? '');
              }}
            >
              Админ
            </button>
          </div>

          <div className="mode-row">
            <button
              className={`mode-tab${mode === 'login' ? ' on' : ''}`}
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Вход
            </button>
            <button
              className={`mode-tab${mode === 'register' ? ' on' : ''}`}
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              Регистрация
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            {mode === 'register' ? (
              <>
                <div className="role-pick">
                  <button type="button" className={role === 'hr' ? 'on' : ''} onClick={() => setRole('hr')}>
                    Создать компанию
                  </button>
                  <button type="button" className={role === 'merchant' ? 'on' : ''} onClick={() => setRole('merchant')}>
                    Мерчант
                  </button>
                </div>
                <label>
                  Имя
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Малика" autoComplete="name" />
                </label>
              </>
            ) : null}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@click.uz"
                autoComplete="username"
              />
            </label>
            <label>
              Пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>
            {mode === 'register' && role === 'hr' ? (
              <>
                <label>
                  Название компании
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme"
                    autoComplete="organization"
                  />
                </label>
                <label>
                  Город
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ташкент" />
                </label>
              </>
            ) : null}
            {mode === 'register' && role === 'merchant' ? (
              <>
                <label>
                  Название мерчанта
                  <input
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="FitZone Premium"
                    autoComplete="organization"
                  />
                </label>
                <label>
                  Город
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ташкент" />
                </label>
                <label>
                  Категория
                  <select value={category} onChange={(e) => setCategory((e.target.value || '') as Category | '')}>
                    <option value="">Не выбрана</option>
                    {(Object.keys(categoryLabel) as Category[]).map((key) => (
                      <option key={key} value={key}>
                        {categoryLabel[key]}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}
            {error ? <div className="err">{error}</div> : null}
            <button className="primary auth-submit" type="submit">
              {mode === 'login' ? 'Войти' : role === 'hr' ? 'Создать компанию' : 'Зарегистрировать мерчанта'}
            </button>
          </form>
        </div>
      </section>

      {picker ? (
        <DemoPicker
          kind={picker}
          query={query}
          onQuery={setQuery}
          onClose={() => setPicker(null)}
          hrs={hrs}
          merchantAccounts={merchantAccounts}
          companies={companies}
          merchants={merchants}
          onPick={pickUser}
        />
      ) : null}
    </div>
  );
}

function LoginScene() {
  return (
    <div className="login-scene" aria-hidden="true">
      <div className="login-stage">
        <span className="login-ring r1" />
        <span className="login-ring r2" />
        <span className="login-ring r3" />
        <span className="login-spark s1" />
        <span className="login-spark s2" />
        <span className="login-spark s3" />
        <span className="login-spark s4" />
        <span className="login-spark s5" />
        <div className="login-halo" />
        <div className="login-mark-glow">
          <img src="/logomark.png" alt="" />
        </div>
        <p className="login-swap">
          <span>Спорт</span>
          <span>Еда</span>
          <span>Обучение</span>
          <span>Клиника</span>
        </p>
        <article className="login-perk p1">
          <em>зал</em>
          <b>FitZone</b>
          <span>безлимит</span>
        </article>
        <article className="login-perk p2">
          <em>обед</em>
          <b>12 000</b>
          <span>баллов / мес</span>
        </article>
        <article className="login-perk p3">
          <em>обучение</em>
          <b>SkillHub</b>
          <span>курсы</span>
        </article>
        <article className="login-perk p4">
          <em>клиника</em>
          <b>Check-up</b>
          <span>раз в год</span>
        </article>
      </div>
    </div>
  );
}

function DemoPicker({
  kind,
  query,
  onQuery,
  onClose,
  hrs,
  merchantAccounts,
  companies,
  merchants,
  onPick,
}: {
  kind: Exclude<Picker, null>;
  query: string;
  onQuery: (v: string) => void;
  onClose: () => void;
  hrs: User[];
  merchantAccounts: User[];
  companies: { id: string; name: string }[];
  merchants: { id: string; name: string }[];
  onPick: (user: User) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const title = kind === 'hr' ? 'Войти как HR' : 'Войти как мерчант';

  return (
    <div className="demo-overlay" onClick={onClose} role="presentation">
      <div className="demo-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="demo-modal-head">
          <div>
            <h2>{title}</h2>
          </div>
          <button className="demo-close" type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <input
          className="demo-search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Поиск по имени или email"
        />
        {kind === 'hr' ? (
          <div className="demo-list">
            {hrs.map((u) => {
              const company = companies.find((c) => c.id === u.companyId);
              return (
                <button key={u.id} className="demo-pick" type="button" onClick={() => onPick(u)}>
                  <b>{u.name}</b>
                  <span className="meta">
                    {company?.name ?? u.companyId} · {u.email}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="demo-list">
            {merchantAccounts.map((u) => {
              const merchant = merchants.find((m) => m.id === u.merchantId);
              return (
                <button key={u.id} className="demo-pick" type="button" onClick={() => onPick(u)}>
                  <b>{u.name}</b>
                  <span className="meta">
                    {merchant?.name ?? u.merchantId} · {u.email}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
