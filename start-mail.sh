#!/bin/bash
# Start Mailpit email testing server
# SMTP: :1025 | Web UI: http://localhost:8025

MAILPIT_BIN=$(command -v mailpit 2>/dev/null)
if [ -z "$MAILPIT_BIN" ]; then
    echo "Mailpit n'est pas installé."
    echo "Installez-le avec:  go install github.com/axllent/mailpit@latest"
    echo "Ou:  curl -sL https://raw.githubusercontent.com/axllent/mailpit/develop/install.sh | bash"
    exit 1
fi

PID=$(pgrep -x mailpit 2>/dev/null)
if [ -n "$PID" ]; then
    echo "Mailpit déjà en cours d'exécution (PID $PID)"
    echo "Web UI : http://localhost:8025"
    exit 0
fi

setsid "$MAILPIT_BIN" -s :1025 -l :8025 > /tmp/mailpit.log 2>&1 < /dev/null &
sleep 1
if pgrep -x mailpit > /dev/null; then
    echo "Mailpit démarré ✓"
    echo "  SMTP  → :1025"
    echo "  Web   → http://localhost:8025"
else
    echo "Erreur : Mailpit n'a pas démarré"
    cat /tmp/mailpit.log
    exit 1
fi
