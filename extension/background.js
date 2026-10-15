importScripts('links.js');

const HOST = 'com.gchat.open_external';

async function openExternally(url) {
  try {
    const res = await chrome.runtime.sendNativeMessage(HOST, { url });
    if (!res?.ok) throw new Error(res?.error ?? 'resposta vazia do host');
    console.info('Aberto no navegador padrão:', url);
  } catch (err) {
    // Sem o host instalado o link não pode sumir: abre no próprio Chrome.
    console.error('Falha no host nativo, abrindo no Chrome:', err);
    chrome.tabs.create({ url });
  }
}

// Caminho principal: o content script interceptou o clique.
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== 'open' || !sender.tab) return;
  console.info('Clique interceptado:', msg.url);
  const url = externalUrl(msg.url);
  if (url) openExternally(url);
});

// Plano B: links abertos por JavaScript (window.open) escapam do clique. O
// Chrome cria uma aba nova; se ela veio do PWA, fechamos e mandamos a URL para
// o navegador padrão.

// tabId -> Promise<boolean> (a aba de origem é o Chat em modo PWA?)
const candidates = new Map();

async function fromStandaloneChat(sourceTabId) {
  try {
    return (await chrome.tabs.sendMessage(sourceTabId, { type: 'isStandalone' }, { frameId: 0 })) === true;
  } catch {
    return false; // aba de origem sem o content script, ou seja, não é o Chat
  }
}

async function isPopup(tabId) {
  const tab = await chrome.tabs.get(tabId);
  const win = await chrome.windows.get(tab.windowId);
  return win.type === 'popup';
}

async function maybeRedirect(tabId, rawUrl) {
  const url = externalUrl(rawUrl);
  const check = candidates.get(tabId);
  if (!url || !check) return;
  candidates.delete(tabId); // antes do await, para não abrir duas vezes

  if (!(await check)) return console.info('Aba', tabId, 'não veio do PWA do Chat');
  // Popups (ex.: OAuth com window.opener) precisam continuar no Chrome.
  if (await isPopup(tabId).catch(() => true)) return console.info('Aba', tabId, 'é popup, fica no Chrome');

  console.info('Redirecionando aba', tabId, url);
  chrome.tabs.remove(tabId).catch(() => {});
  openExternally(url);
}

chrome.webNavigation.onCreatedNavigationTarget.addListener((d) => {
  console.info('Aba nova', d.tabId, 'criada pela aba', d.sourceTabId, d.url);
  candidates.set(d.tabId, fromStandaloneChat(d.sourceTabId));
  maybeRedirect(d.tabId, d.url);
});

// window.open() costuma criar a aba em about:blank e só depois navegar.
chrome.webNavigation.onBeforeNavigate.addListener((d) => {
  if (d.frameId === 0) maybeRedirect(d.tabId, d.url);
});

chrome.tabs.onRemoved.addListener((tabId) => candidates.delete(tabId));
