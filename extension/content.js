// Roda em chat.google.com. Só age quando a página está aberta como PWA
// (janela de app), então o Chat numa aba normal continua igual.

const isStandalone = () => !matchMedia('(display-mode: browser)').matches;

function onClick(event) {
  if (event.button > 1 || !isStandalone()) return;

  const anchor = event.composedPath().find((el) => el.localName === 'a' && el.href);
  if (!anchor) return;

  const url = externalUrl(anchor.href);
  if (!url) return;

  // Captura em window roda antes de qualquer handler do Chat.
  event.preventDefault();
  event.stopImmediatePropagation();
  chrome.runtime.sendMessage({ type: 'open', url });
}

window.addEventListener('click', onClick, true);
window.addEventListener('auxclick', onClick, true);

// O service worker pergunta isso para saber se uma aba nova veio do PWA.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'isStandalone') sendResponse(isStandalone());
});
