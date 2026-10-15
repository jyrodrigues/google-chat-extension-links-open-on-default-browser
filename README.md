# Google Chat como app, com links no navegador padrão

O app (PWA) do Google Chat no Chrome abre todo link no próprio Chrome. Esta
extensão manda os links para o navegador padrão do Mac (ex.: Arc).

São duas peças:

- `extension/`: a extensão. Intercepta os links clicados no app do Chat.
- `host/open_external.py`: um script que recebe a URL da extensão e roda
  `open <url>`, que abre no navegador padrão. Extensões não podem executar
  programas; o Chrome só deixa a extensão falar com programas registrados num
  arquivo JSON (`host/com.gchat.open_external.json`), que você copia no passo 3.

## Instalar

1. Descompacte esta pasta em `~/Applications/gchat-links`. Se usar outro
   lugar, ajuste os caminhos abaixo e o campo `path` do JSON.

2. Tire a quarentena que o macOS põe em arquivos baixados (ela pode impedir o
   Chrome de executar o script) e garanta que o script é executável:

   ```bash
   xattr -dr com.apple.quarantine ~/Applications/gchat-links
   chmod +x ~/Applications/gchat-links/host/open_external.py
   ```

3. Registre o script no Chrome. O JSON diz qual programa rodar (`path`) e qual
   extensão pode chamá-lo (`allowed_origins`). O `path` precisa ser absoluto,
   então o `sed` troca `SEU_USUARIO` pelo seu usuário do Mac:

   ```bash
   mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts
   sed "s/SEU_USUARIO/$(whoami)/" ~/Applications/gchat-links/host/com.gchat.open_external.json \
     > ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.gchat.open_external.json
   ```

   No Chrome Canary, troque `Google/Chrome` por `Google/Chrome Canary`.

4. No Chrome, abra `chrome://extensions`, ligue o **Modo do desenvolvedor**,
   clique em **Carregar sem compactação** e escolha a pasta `extension`.
   O ID mostrado deve ser `aikepfbcgincmiaclilhggpphijmgkom` (é fixo por causa
   da `key` no `manifest.json`, e é o mesmo do `allowed_origins`).

5. Abra `https://chat.google.com` no Chrome e clique no ícone de instalar na
   barra de endereço (ou ⋮ → Transmitir, salvar e compartilhar → Instalar).

6. Abra o app **Google Chat** (pelo Spotlight) e clique num link: ele abre no
   navegador padrão.

## Dicas

- O app é uma janela do Chrome: feche as janelas do Chrome com Cmd+W, não com
  Cmd+Q, senão o Chat fecha junto.
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
