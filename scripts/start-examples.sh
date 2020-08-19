#!/bin/bash

if [[ $OSTYPE == "darwin"* ]]; then
  (sleep 1 && open https://localhost:8080/examples/ &>/dev/null) &
elif command -v xdg-open &> /dev/null; then
  (sleep 1 && xdg-open https://localhost:8080/examples/ &>/dev/null) &
fi

echo 'Serving examples at https://localhost:8080/examples/'
caddy run

