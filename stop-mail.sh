#!/bin/bash
PID=$(pgrep -x mailpit 2>/dev/null)
if [ -n "$PID" ]; then
    kill "$PID" 2>/dev/null
    sleep 1
    if pgrep -x mailpit > /dev/null; then
        kill -9 "$PID" 2>/dev/null
    fi
    echo "Mailpit arrêté"
else
    echo "Mailpit n'est pas en cours d'exécution"
fi
