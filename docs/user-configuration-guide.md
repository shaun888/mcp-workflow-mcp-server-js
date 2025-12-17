# FOP工作流MCP服务器 - 用户配置指南

## 🚀 快速开始

### 方式1：完整配置（推荐）
```json
{
  "mcpServers": {
    "workflow-master": {
      "autoApprove": [
        "getFopWorkflowGuide"
      ],
      "timeout": 180,
      "command": "npx",
      "args": [
        "-y",
        "--registry",
        "http://registry.m.jd.com",
        "@jd/fop-workflow-mcp-server"
      ]
    }
  }
}
```

**配置说明：**
- `autoApprove`: 自动批准某些工具调用，无需用户确认
- `timeout`: 设置超时时间为180秒
- `-y`: 自动确认所有提示
- `--registry`: 指定京东私服地址
- `@jd/fop-workflow-mcp-server`: 包名（不带版本号表示使用latest）
- `type` & `transportType`: 使用标准输入输出通信

### 方式2：固定版本（稳定版）
```json
{
  "mcpServers": {
    "workflow-master": {
      "autoApprove": [
        "getFopWorkflowGuide"
      ],
      "timeout": 180,
      "command": "npx",
      "args": [
        "-y",
        "--registry",
        "http://registry.m.jd.com",
        "@jd/fop-workflow-mcp-server@1.0.2"
      ],
      "type": "stdio",
      "transportType": "stdio"
    }
  }
}
```

### 方式3：本地开发模式
```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "node",
      "args": ["/path/to/your/fop-workflow-mcp-server/index.js"],
      "env": {}
    }
  }
}
```

## 📊 配置对比说明

### 您提供的配置（推荐）
```json
{
  "mcpServers": {
    "workflow-master": {
      "autoApprove": ["getFopWorkflowGuide"],
      "timeout": 180,
      "command": "npx",
      "args": ["-y", "--registry", "http://registry.m.jd.com", "@jd/fop-workflow-mcp-server"],
      "type": "stdio",
      "transportType": "stdio"
    }
  }
}
```

### 简化配置
```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "npx",
      "args": ["@jd/fop-workflow-mcp-server@latest"]
    }
  }
}
```

## 🔍 配置差异说明

| 配置项 | 推荐配置 | 简化配置 | 说明 |
|--------|----------|----------|------|
| `autoApprove` | ✅ 有 | ❌ 无 | 自动批准指定工具调用，提升效率 |
| `timeout` | ✅ 180秒 | ❌ 默认 | 设置超时时间，防止长时间等待 |
| `-y` 参数 | ✅ 有 | ❌ 无 | 自动确认所有交互提示 |
| `--registry` | ✅ 指定私服 | ❌ 使用默认 | 明确指定京东私服地址 |
| `type` | ✅ stdio | ❌ 默认 | 使用标准输入输出通信 |
| `transportType` | ✅ stdio | ❌ 默认 | 传输层类型 |

## ⚙️ 环境变量配置

### 可选环境变量
```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "npx",
      "args": ["@jd/fop-workflow-mcp-server@latest"],
      "env": {
        "SERVER_PORT": "8080",
        "MCP_ENDPOINT": "/mcp/fop-workflow",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## 🔧 配置验证

### 检查服务器状态
```bash
# 检查包是否存在
npm view @jd/fop-workflow-mcp-server --registry http://registry.m.jd.com

# 检查最新版本
npm view @jd/fop-workflow-mcp-server version --registry http://registry.m.jd.com
```

### 测试连接
```bash
# 使用 npx 测试
npx @jd/fop-workflow-mcp-server@latest
```

## 📋 常见问题

### Q1: 版本更新问题
**问题**：每次更新都要改配置？
**解决**：使用 `@latest` 标签，自动获取最新版本

### Q2: 网络问题
**问题**：下载慢或失败
**解决**：检查网络连接，或使用固定版本

### Q3: 权限问题
**问题**：没有执行权限
**解决**：确保 npm 全局安装路径有执行权限

## 🎯 最佳实践

### 开发环境
- 使用 `@latest` 获取最新功能
- 开启详细日志便于调试

### 生产环境
- 使用固定版本保证稳定性
- 配置适当的日志级别

### 团队协作
- 统一版本管理策略
- 建立更新通知机制