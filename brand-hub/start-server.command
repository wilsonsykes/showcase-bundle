#!/bin/bash
# ==============================================================
#   Brand Hub - Local Preview Server (Mac)
#   Double-click this file to start the local server.
#   The page will open in your default browser.
# ==============================================================

cd "$(dirname "$0")"

echo ""
echo "  Quadro Decor - Brand Hub"
echo "  Starting local server at http://localhost:8001"
echo ""
echo "  Press Ctrl+C to stop the server."
echo ""

# Open the page in the default browser after a short delay
(sleep 1 && open http://localhost:8001) &

# Start the server (try python3, then python)
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 8001
elif command -v python >/dev/null 2>&1; then
  python -m http.server 8001
else
  echo ""
  echo "  Python not found. Please install Python from python.org"
  echo "  Or simply double-click index.html to open without a server."
  read -n 1 -s -r -p "Press any key to exit..."
fi
