import { useCallback, useEffect, useMemo, useState } from 'react';

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [page = '', id = ''] = raw.split('/').filter(Boolean);
  return { page, id: id || null };
}

function writeHash(page: string, id?: string | null) {
  const next = `#/${page}${id ? `/${id}` : ''}`;
  if (window.location.hash !== next) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
  }
}

export function useHashRoute(pages: string, fallback: string) {
  const allowed = useMemo(() => pages.split(','), [pages]);

  const read = useCallback(() => {
    const parsed = parseHash();
    return {
      page: allowed.includes(parsed.page) ? parsed.page : fallback,
      id: parsed.id,
    };
  }, [allowed, fallback]);

  const [route, setRoute] = useState(read);

  useEffect(() => {
    if (!parseHash().page) writeHash(fallback);
    const onHash = () => setRoute(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [fallback, read]);

  const go = useCallback(
    (page: string, id?: string | null) => {
      const nextPage = allowed.includes(page) ? page : fallback;
      writeHash(nextPage, id);
      setRoute({ page: nextPage, id: id ?? null });
    },
    [allowed, fallback],
  );

  return { page: route.page, id: route.id, go };
}
