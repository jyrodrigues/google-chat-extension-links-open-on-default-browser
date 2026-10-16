# Google Chat como app, com links no navegador padrão

O app (PWA) do Google Chat no Chrome abre todo link no próprio Chrome. Esta
extensão manda os links para o navegador padrão do Mac (ex.: Arc).

São duas peças:

- `extension/`: a extensão. Intercepta os links clicados no app do Chat.
- `host/open_external.py`: um script que recebe a URL da extensão e roda
  `open <url>`, que abre no navegador padrão. Extensões não podem executar
  programas; o Chrome só deixa a extensão falar com programas registrados num
  arquivo JSON (`host/com.gchat.open_external.json`), que você copia no passo 2.

## Instalar

1. Clone o repositório num lugar fixo (o passo 2 grava o caminho dele; se mover
   a pasta, refaça o passo 2):

   ```bash
   git clone https://github.com/jyrodrigues/google-chat-extension-links-open-on-default-browser.git
   cd google-chat-extension-links-open-on-default-browser
   ```

2. Registre o script no Chrome. O JSON diz qual programa rodar (`path`) e qual
   extensão pode chamá-lo (`allowed_origins`). O `path` precisa ser absoluto,
   então o `sed` troca `CAMINHO_DO_REPO` pela pasta atual. Rode de dentro do
   repositório:

   ```bash
   mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts
   sed "s|CAMINHO_DO_REPO|$PWD|" host/com.gchat.open_external.json \
     > ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.gchat.open_external.json
   ```

   No Chrome Canary, troque `Google/Chrome` por `Google/Chrome Canary`.

3. No Chrome, abra `chrome://extensions`, ligue o **Modo do desenvolvedor**,
   clique em **Carregar sem compactação** e escolha a pasta `extension`.
   O ID mostrado deve ser `aikepfbcgincmiaclilhggpphijmgkom` (é fixo por causa
   da `key` no `manifest.json`, e é o mesmo do `allowed_origins`).

4. Abra `https://chat.google.com` no Chrome e clique no ícone de instalar na
   barra de endereço (ou ⋮ → Transmitir, salvar e compartilhar → Instalar).

5. Abra o app **Google Chat** (pelo Spotlight) e clique num link: ele abre no
   navegador padrão.

O script usa o `/usr/bin/python3` do macOS, que vem com as Command Line Tools
(`xcode-select --install`). Se você tem `git`, já tem as duas coisas.

## Dicas

- Feche o Chrome com Cmd+Q e depois abra direto o app do Chat: o Chrome sobe
  por trás, sem nenhuma janela dele aberta e sem aparecer no Dock.
- O app roda dentro do Chrome: se em algum momento você abrir o Chrome e
  fechá-lo com Cmd+Q, o Chat fecha junto.
- Só os links clicados no app são redirecionados; o Chat numa aba do Chrome
  continua igual.
- Link abrindo no Chrome? Em `chrome://extensions`, clique em "service worker"
  na extensão e veja o console. O script registra cada link em
  `~/Library/Logs/gchat-open-external.log`.

## Desinstalar

Remova a extensão em `chrome://extensions` e apague o registro:

```bash
rm ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.gchat.open_external.json
```
