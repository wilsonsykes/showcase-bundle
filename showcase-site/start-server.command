#!/bin/bash
# Showcase Local Server (Mac/Linux)
# Double-click this file to start the local server.
# If double-clicking doesn't work the first time, right-click → Open With → Terminal,
# OR run "chmod +x start-server.command" in Terminal once.

cd "$(dirname "$0")"

echo "================================================"
echo "  Showcase Local Server"
echo "================================================"
echo ""
echo "Starting server at http://localhost:8000"
echo ""
echo "Open this URL in your browser to view the showcase."
echo "Keep this window open while you work."
echo ""
echo "To stop the server: close this window or press Ctrl+C"
echo "================================================"
echo ""

if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "ERROR: Python is not installed."
    echo ""
    echo "Mac: open Terminal and run 'python3 --version' to check."
    echo "If missing, install from https://www.python.org/downloads/"
    echo ""
    echo "Press any key to close this window."
    read -n 1
fi
