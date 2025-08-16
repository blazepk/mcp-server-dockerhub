# DockerHub MCP Server

A comprehensive Model Context Protocol (MCP) server for Docker Hub integration, providing AI assistants with powerful Docker image search, analysis, and management capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker Hub account (optional, for authentication)

### Installation & Setup

1. **Clone and install:**
```bash
git clone <repository-url>
cd dockerhub-mcp-server
npm install
npm run build
```

2. **Configure environment (optional):**
```bash
cp .env.example .env
# Edit .env with your Docker Hub credentials
```

3. **Start the server:**
```bash
npm start
```

## 🛠️ Development

```bash
npm run build               # Build project
npm test                    # Run tests
npm run lint               # Run linting
npm start                  # Start server
```

### MCP Inspector (Web Interface)
```bash
npm run inspect
# Opens at: http://localhost:6274
```

## 🔧 Features

### 11 Powerful Tools
- **8 Core Tools**: Search, details, tags, manifest, layers, compare, dockerfile, stats
- **3 Bonus Tools**: Pull size estimation, image history, security assessment

### Key Capabilities
- ✅ Intelligent caching with TTL
- ✅ Rate limiting and authentication
- ✅ Comprehensive error handling
- ✅ TypeScript with full type safety
- ✅ Docker containerization support
- ✅ MCP protocol compliant
- ✅ Extensive testing suite

## 📚 Claude Desktop Setup

To integrate with Claude Desktop:

1. **Build the project:**
```bash
npm run build
```

2. **Add to Claude Desktop config** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "dockerhub": {
      "command": "node",
      "args": ["/path/to/your/project/dist/index.js"],
      "env": {
        "CACHE_TTL_SECONDS": "300",
        "CACHE_MAX_SIZE": "1000",
        "RATE_LIMIT_REQUESTS_PER_MINUTE": "100",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

3. **Restart Claude Desktop** and test with: *"Can you search for nginx images on Docker Hub?"*

## 🐳 Docker Deployment

```bash
docker build -t dockerhub-mcp-server .
docker run -d --name dockerhub-mcp dockerhub-mcp-server
```

## ⚙️ Configuration

### Environment Variables
```bash
DOCKERHUB_USERNAME=your_username     # Optional
DOCKERHUB_PASSWORD=your_token        # Optional
CACHE_TTL_SECONDS=300               # Cache TTL
RATE_LIMIT_REQUESTS_PER_MINUTE=100  # Rate limit
LOG_LEVEL=info                      # Logging level
```

## 🧪 Testing

```bash
npm test                    # Run all tests
npm run inspect            # Interactive web testing
./dev-tools.sh test        # Development testing
```

## 📖 API Examples

### Search Images
```json
{
  "tool": "docker_search_images",
  "arguments": {
    "query": "nginx",
    "limit": 10,
    "filters": { "is_official": true }
  }
}
```

### Compare Images
```json
{
  "tool": "docker_compare_images", 
  "arguments": {
    "image1": "nginx:alpine",
    "image2": "nginx:latest"
  }
}
```

## 🏗️ Architecture

- **DockerHubClient** - API client with auth & rate limiting
- **CacheManager** - Intelligent caching with TTL & LRU
- **RateLimiter** - Request throttling & monitoring
- **ConfigManager** - Environment-based configuration
- **Logger** - Structured logging with levels

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- 🐛 Create an issue for bugs or questions
- 📧 Check the repository for updates
- 🔧 Use MCP Inspector for debugging
