# Google Chat como app, com links no navegador padrão

O app (PWA) do Google Chat no Chrome abre todo link no próprio Chrome. Esta
extensão manda os links para o navegador padrão do Mac (ex.: Arc).

## Instalar

1. Descompacte esta pasta num lugar fixo, ex.: `~/Applications/gchat-links`.
   O instalador grava o caminho dela; se mover a pasta, rode o passo 2 de novo.
2. No Terminal: `bash ~/Applications/gchat-links/install.sh`
3. No Chrome, abra `chrome://extensions`, ligue o **Modo do desenvolvedor**,
   clique em **Carregar sem compactação** e escolha a pasta `extension`.
4. Abra `https://chat.google.com` no Chrome e clique no ícone de instalar na
   barra de endereço (ou ⋮ → Transmitir, salvar e compartilhar → Instalar).
5. Abra o app **Google Chat** (pelo Spotlight) e clique num link: ele abre no
   navegador padrão.

## Dicas

- O app é uma janela do Chrome: feche as janelas do Chrome com Cmd+W, não com
  Cmd+Q, senão o Chat fecha junto.
- Só os links clicados no app são redirecionados; o Chat numa aba do Chrome
  continua igual.
- Link abrindo no Chrome? Em `chrome://extensions`, clique em "service worker"
  na extensão e veja o console. O script local registra cada link em
  `~/Library/Logs/gchat-open-external.log`.

## Desinstalar

`bash install.sh --uninstall` e remova a extensão em `chrome://extensions`.
