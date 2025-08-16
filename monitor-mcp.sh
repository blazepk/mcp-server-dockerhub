#!/bin/bash

echo "🔍 Monitoring DockerHub MCP Server Activity..."
echo "📍 Server logs will appear below when Claude uses the MCP server"
echo "🚀 Start asking Claude Docker-related questions to see activity"
echo "---"

# Run the MCP server and monitor its logs
/Users/pkhandelwal/.nvm/versions/node/v22.5.1/bin/node /Users/pkhandelwal/Desktop/Self-folder/mcp-server/dist/index.js 2>&1 | while read line; do
    echo "[$(date '+%H:%M:%S')] $line"
done
