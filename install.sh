#!/bin/bash
# Registra o host nativo no Chrome e no Chrome Canary (os que existirem).
# Uso: ./install.sh            instala
#      ./install.sh --uninstall remove
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HOST_NAME="com.gchat.open_external"
HOST_PATH="$ROOT/host/open_external.py"
UNINSTALL=0
[ "${1:-}" = "--uninstall" ] && UNINSTALL=1

if [ "$UNINSTALL" = 0 ]; then
  # O host usa o /usr/bin/python3, que vem com as Command Line Tools.
  if ! xcode-select -p >/dev/null 2>&1; then
    echo "Falta o Python do macOS. Instale as Command Line Tools com: xcode-select --install" >&2
    exit 1
  fi
  # Arquivos baixados (ex.: este zip) vêm em quarentena, o que pode impedir o
  # Chrome de executar o host.
  xattr -dr com.apple.quarantine "$ROOT" 2>/dev/null || true
  chmod +x "$HOST_PATH"
fi

# O ID de uma extensão descompactada com "key" no manifest é o sha256 da
# chave pública: os 32 primeiros dígitos hex, mapeados de 0-f para a-p.
key="$(plutil -extract key raw -o - "$ROOT/extension/manifest.json")"
EXT_ID="$(printf '%s' "$key" | base64 -D | shasum -a 256 | head -c 32 | tr '0-9a-f' 'a-p')"

installed=0
for browser in "Chrome" "Chrome Canary"; do
  profile="$HOME/Library/Application Support/Google/$browser"
  [ -d "$profile" ] || continue
  manifest="$profile/NativeMessagingHosts/$HOST_NAME.json"

  if [ "$UNINSTALL" = 1 ]; then
    rm -f "$manifest"
    echo "Removido: $manifest"
    continue
  fi

  mkdir -p "$(dirname "$manifest")"
  cat > "$manifest" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Abre links do Google Chat no navegador padrão",
  "path": "$HOST_PATH",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$EXT_ID/"]
}
EOF
  echo "Instalado: $manifest"
  installed=1
done

[ "$UNINSTALL" = 1 ] && exit 0

if [ "$installed" = 0 ]; then
  echo "Não achei o Chrome nem o Chrome Canary. Abra o Chrome uma vez e rode de novo." >&2
  exit 1
fi

echo
echo "ID da extensão: $EXT_ID"
echo "Agora carregue a pasta $ROOT/extension em chrome://extensions (modo desenvolvedor > Carregar sem compactação)."
