# 版本管理策略 - 解决版本变更烦恼

## 🎯 问题
每次发布新版本，用户都需要手动更新他们的MCP配置，这确实很麻烦！

## ✅ 解决方案

### 方案1：使用 `latest` 标签（推荐）
用户可以在他们的MCP配置中使用：
```json
{
  "name": "fop-workflow-mcp",
  "version": "latest",
  "description": "FOP工作流MCP服务器"
}
```

### 方案2：固定版本（稳定版）
如果用户需要稳定性，可以固定使用特定版本：
```json
{
  "name": "fop-workflow-mcp", 
  "version": "1.0.1",
  "description": "FOP工作流MCP服务器"
}
```

### 方案3：自动更新脚本
提供自动更新脚本，用户运行即可更新到最新版本。

## 🚀 发布策略建议

### 1. 语义化版本控制
- `1.0.x` - 仅修复bug，保持兼容性
- `1.x.x` - 新功能，保持向后兼容
- `2.x.x` - 重大变更，可能不兼容

### 2. 发布频率
- 紧急修复：立即发布
- 功能更新：每周/每月发布
- 重大更新：谨慎发布，提前通知

### 3. 向后兼容性
- 保持配置文件格式兼容
- 提供迁移指南
- 废弃功能时给出警告

## 📋 用户配置建议

### 开发环境（使用最新版）
```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "npx",
      "args": ["@jd/fop-workflow-mcp-server@latest"],
      "env": {}
    }
  }
}
```

### 生产环境（固定版本）
```json
{
  "mcpServers": {
    "fop-workflow": {
      "command": "npx", 
      "args": ["@jd/fop-workflow-mcp-server@1.0.1"],
      "env": {}
    }
  }
}
```

## 🔧 自动化工具

### 版本检查脚本
```bash
# 检查最新版本
npm view @jd/fop-workflow-mcp-server version --registry http://registry.m.jd.com

# 更新到最新版本
npm update @jd/fop-workflow-mcp-server --registry http://registry.m.jd.com
```

## 📞 用户支持
- 提供详细的更新日志
- 建立用户通知机制
- 提供技术支持渠道

## 🎯 总结
通过使用 `latest` 标签，用户无需手动更新版本号，系统会自动获取最新版本。对于需要稳定性的用户，可以选择固定版本但接受手动更新。