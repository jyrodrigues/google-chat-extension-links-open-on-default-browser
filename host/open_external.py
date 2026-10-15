#!/usr/bin/python3
"""Host de native messaging: abre URLs http(s) no navegador padrão do macOS.

Protocolo do Chrome: cada mensagem é um JSON precedido pelo tamanho em 4 bytes
(ordem nativa). Recebe {"url": "..."} e responde {"ok": true} ou
{"ok": false, "error": "..."}.
"""

import json
import os
import struct
import subprocess
import sys
import time
from urllib.parse import urlsplit

LOG_PATH = os.path.expanduser("~/Library/Logs/gchat-open-external.log")


def log(text):
    with open(LOG_PATH, "a") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} {text}\n")


def read_message():
    header = sys.stdin.buffer.read(4)
    if len(header) < 4:
        return None
    (length,) = struct.unpack("=I", header)
    return json.loads(sys.stdin.buffer.read(length))


def send_message(msg):
    data = json.dumps(msg).encode()
    sys.stdout.buffer.write(struct.pack("=I", len(data)) + data)
    sys.stdout.buffer.flush()


def main():
    msg = read_message() or {}
    url = msg.get("url", "")
    if urlsplit(url).scheme not in ("http", "https"):
        log(f"recusado: {url!r}")
        send_message({"ok": False, "error": "só aceito URLs http(s)"})
        return

    # Sem -a: o LaunchServices escolhe o navegador padrão (o Arc).
    result = subprocess.run(["/usr/bin/open", url], capture_output=True, text=True)
    if result.returncode != 0:
        log(f"falhou: {url} ({result.stderr.strip()})")
        send_message({"ok": False, "error": result.stderr.strip()})
    else:
        log(f"aberto: {url}")
        send_message({"ok": True})


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        log(f"erro: {err!r}")
        raise
