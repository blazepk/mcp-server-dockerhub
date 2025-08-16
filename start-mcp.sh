#!/bin/bash

# MCP Server Startup Script
# This script ensures the MCP server can start regardless of Node.js installation method

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try to find node in common locations
NODE_CMD=""

# Check if node is in PATH
if command -v node >/dev/null 2>&1; then
    NODE_CMD="node"
# Check nvm installation
elif [ -f "$HOME/.nvm/nvm.sh" ]; then
    # Source nvm and use the current version
    source "$HOME/.nvm/nvm.sh"
    NODE_CMD="node"
# Check for specific nvm version (fallback)
elif [ -f "$HOME/.nvm/versions/node/v22.5.1/bin/node" ]; then
    NODE_CMD="$HOME/.nvm/versions/node/v22.5.1/bin/node"
# Check system installations
elif [ -f "/usr/local/bin/node" ]; then
    NODE_CMD="/usr/local/bin/node"
elif [ -f "/usr/bin/node" ]; then
    NODE_CMD="/usr/bin/node"
else
    echo "Error: Node.js not found. Please install Node.js or update this script with the correct path."
    exit 1
fi

# Change to the script directory
cd "$SCRIPT_DIR"

# Start the MCP server
exec "$NODE_CMD" dist/index.js
