// Compartilhado entre o content script e o service worker.

// Hosts que continuam dentro do PWA (o próprio Chat e o login do Google).
const INTERNAL_HOSTS = new Set(['chat.google.com', 'accounts.google.com']);

// Retorna a URL que deve ir para o navegador padrão, ou null se o link deve
// ficar no PWA.
function externalUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  // O Chat às vezes embrulha links no redirecionador do Google.
  if ((url.hostname === 'www.google.com' || url.hostname === 'google.com') && url.pathname === '/url') {
    const target = url.searchParams.get('q') || url.searchParams.get('url');
    if (target) return externalUrl(target);
  }

  if (INTERNAL_HOSTS.has(url.hostname)) return null;
  return url.href;
}
