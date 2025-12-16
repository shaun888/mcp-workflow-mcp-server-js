# MCP客户端配置示例

本文档提供了各种MCP客户端的配置示例，帮助你快速集成FOP工作流MCP服务器。

## 🎯 JoyCode配置

### 基础配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "autoApprove": [
      "getFopWorkflowGuide"
    ]
  }
}
```

### 完整配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "autoApprove": [
      "getFopWorkflowGuide",
      "getPrdAnalysisRules",
      "getCodeGenerationRules",
      "getFlowchartGenerationRules",
      "getIntelligentRetrievalStrategy"
    ],
    "timeout": 30000,
    "retries": 3,
    "description": "FOP工作流规范指导服务器"
  }
}
```

### 生产环境配置

```json
{
  "fop-workflow-mcp": {
    "url": "https://fop-mcp.your-domain.com/mcp/fop-workflow",
    "autoApprove": [
      "getFopWorkflowGuide"
    ],
    "timeout": 60000,
    "retries": 5,
    "headers": {
      "Authorization": "Bearer your-api-token",
      "X-Environment": "production"
    }
  }
}
```

## 🔧 Claude Desktop配置

### MCP设置文件位置

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### NPM包方式

```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "npx",
      "args": [
        "-y",
        "--registry=http://registry.m.jd.com",
        "@jd/fop-workflow-mcp-server"
      ],
      "env": {
        "SERVER_PORT": "8080"
      }
    }
  }
}
```

### 本地JAR方式

```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "java",
      "args": [
        "-jar",
        "/path/to/mcp-api-1.0.jar",
        "--server.port=8080"
      ],
      "env": {
        "JAVA_OPTS": "-Xms256m -Xmx512m"
      }
    }
  }
}
```

### Docker方式

```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-p", "8080:8080",
        "fop-workflow-mcp:latest"
      ]
    }
  }
}
```

## 🌐 其他MCP客户端

### Cline (VS Code插件)

```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "npx",
      "args": [
        "@jd/fop-workflow-mcp-server",
        "--registry=http://registry.m.jd.com"
      ]
    }
  }
}
```

### Continue (VS Code插件)

```json
{
  "models": [
    {
      "title": "Claude with FOP Workflow",
      "provider": "anthropic",
      "model": "claude-3-sonnet-20240229",
      "mcpServers": [
        {
          "name": "fop-workflow",
          "command": "npx",
          "args": ["@jd/fop-workflow-mcp-server"]
        }
      ]
    }
  ]
}
```

### Zed编辑器

```json
{
  "assistant": {
    "version": "2",
    "provider": {
      "name": "anthropic",
      "model": "claude-3-sonnet-20240229"
    },
    "mcp_servers": {
      "fop-workflow": {
        "command": "npx",
        "args": ["@jd/fop-workflow-mcp-server"]
      }
    }
  }
}
```

## 🐳 Docker Compose集成

### 基础集成

```yaml
version: '3.8'
services:
  fop-workflow-mcp:
    image: fop-workflow-mcp:latest
    ports:
      - "8080:8080"
    environment:
      - JAVA_OPTS=-Xms256m -Xmx512m
    
  your-mcp-client:
    image: your-client:latest
    depends_on:
      - fop-workflow-mcp
    environment:
      - MCP_SERVER_URL=http://fop-workflow-mcp:8080/mcp/fop-workflow
```

### 带监控的集成

```yaml
version: '3.8'
services:
  fop-workflow-mcp:
    image: fop-workflow-mcp:latest
    ports:
      - "8080:8080"
    networks:
      - mcp-network
    
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - mcp-network
      
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    networks:
      - mcp-network

networks:
  mcp-network:
    driver: bridge
```

## ⚙️ 环境配置

### 开发环境

```bash
# .env.development
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8080
MCP_SERVER_URL=http://localhost:8080/mcp/fop-workflow
MCP_TIMEOUT=30000
MCP_RETRIES=3
LOG_LEVEL=debug
```

### 测试环境

```bash
# .env.test
MCP_SERVER_HOST=test-fop-mcp.internal
MCP_SERVER_PORT=8080
MCP_SERVER_URL=http://test-fop-mcp.internal:8080/mcp/fop-workflow
MCP_TIMEOUT=45000
MCP_RETRIES=5
LOG_LEVEL=info
```

### 生产环境

```bash
# .env.production
MCP_SERVER_HOST=fop-mcp.your-domain.com
MCP_SERVER_PORT=443
MCP_SERVER_URL=https://fop-mcp.your-domain.com/mcp/fop-workflow
MCP_TIMEOUT=60000
MCP_RETRIES=5
LOG_LEVEL=warn
API_TOKEN=your-production-token
```

## 🔐 安全配置

### 带认证的配置

```json
{
  "fop-workflow-mcp": {
    "url": "https://fop-mcp.your-domain.com/mcp/fop-workflow",
    "headers": {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "X-API-Key": "your-api-key",
      "X-Client-ID": "your-client-id"
    },
    "autoApprove": ["getFopWorkflowGuide"],
    "timeout": 30000
  }
}
```

### SSL/TLS配置

```json
{
  "fop-workflow-mcp": {
    "url": "https://fop-mcp.your-domain.com/mcp/fop-workflow",
    "ssl": {
      "rejectUnauthorized": true,
      "ca": "/path/to/ca-certificate.pem",
      "cert": "/path/to/client-certificate.pem",
      "key": "/path/to/client-private-key.pem"
    }
  }
}
```

## 🚀 性能优化配置

### 连接池配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "pool": {
      "maxSockets": 10,
      "keepAlive": true,
      "keepAliveMsecs": 30000,
      "timeout": 60000
    },
    "autoApprove": ["getFopWorkflowGuide"]
  }
}
```

### 缓存配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "cache": {
      "enabled": true,
      "ttl": 300000,
      "maxSize": 100
    },
    "autoApprove": ["getFopWorkflowGuide"]
  }
}
```

## 📊 监控配置

### 健康检查配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "healthCheck": {
      "enabled": true,
      "interval": 30000,
      "timeout": 5000,
      "endpoint": "/actuator/health"
    },
    "autoApprove": ["getFopWorkflowGuide"]
  }
}
```

### 日志配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "logging": {
      "level": "info",
      "format": "json",
      "file": "/var/log/mcp-client.log",
      "maxSize": "10MB",
      "maxFiles": 5
    },
    "autoApprove": ["getFopWorkflowGuide"]
  }
}
```

## 🔧 故障排除

### 常见问题配置

#### 连接超时问题

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "timeout": 60000,
    "retries": 5,
    "retryDelay": 2000,
    "autoApprove": ["getFopWorkflowGuide"]
  }
}
```

#### 代理配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "proxy": {
      "host": "proxy.company.com",
      "port": 8080,
      "auth": {
        "username": "proxy-user",
        "password": "proxy-password"
      }
    },
    "autoApprove": ["getFopWorkflowGuide"]
  }
}
```

#### 网络问题诊断

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "debug": true,
    "keepAlive": true,
    "timeout": 30000,
    "headers": {
      "User-Agent": "MCP-Client/1.0.0",
      "X-Debug": "true"
    },
    "autoApprove": ["getFopWorkflowGuide"]
  }
}
```

## 📝 配置验证

### 配置文件验证脚本

```bash
#!/bin/bash
# validate-mcp-config.sh

CONFIG_FILE="$1"

if [ -z "$CONFIG_FILE" ]; then
    echo "用法: $0 <config-file>"
    exit 1
fi

# 检查JSON格式
if ! jq . "$CONFIG_FILE" > /dev/null 2>&1; then
    echo "❌ 配置文件JSON格式错误"
    exit 1
fi

# 检查必要字段
if ! jq -e '.["fop-workflow-mcp"].url' "$CONFIG_FILE" > /dev/null; then
    echo "❌ 缺少必要的URL配置"
    exit 1
fi

# 测试连接
URL=$(jq -r '.["fop-workflow-mcp"].url' "$CONFIG_FILE")
if curl -f -s "$URL" > /dev/null; then
    echo "✅ MCP服务器连接正常"
else
    echo "⚠️  无法连接到MCP服务器: $URL"
fi

echo "✅ 配置文件验证完成"
```

### 连接测试脚本

```javascript
// test-mcp-connection.js
const https = require('https');
const http = require('http');
const config = require('./mcp-config.json');

const serverConfig = config['fop-workflow-mcp'];
const url = new URL(serverConfig.url);

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'GET',
  timeout: serverConfig.timeout || 30000,
  headers: serverConfig.headers || {}
};

const client = url.protocol === 'https:' ? https : http;

console.log(`🔍 测试连接到: ${serverConfig.url}`);

const req = client.request(options, (res) => {
  console.log(`✅ 连接成功! 状态码: ${res.statusCode}`);
  console.log(`📊 响应头:`, res.headers);
});

req.on('error', (err) => {
  console.error(`❌ 连接失败:`, err.message);
});

req.on('timeout', () => {
  console.error(`⏰ 连接超时`);
  req.destroy();
});

req.end();
```

## 🎉 快速开始模板

### 最小配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow"
  }
}
```

### 推荐配置

```json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "autoApprove": ["getFopWorkflowGuide"],
    "timeout": 30000,
    "retries": 3,
    "description": "FOP工作流规范指导"
  }
}
```

---

**📚 更多信息**

- [完整文档](../README.md)
- [API参考](../docs/api.md)
- [故障排除指南](../docs/troubleshooting.md)
- [最佳实践](../docs/best-practices.md)