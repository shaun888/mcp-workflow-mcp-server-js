# JoyCode MCP服务器 - 部署指南

## 📦 发布到NPM

### 1. 准备工作

确保你已经登录到京东内部NPM仓库：

```bash
npm login --registry=http://registry.m.jd.com
```

### 2. 版本更新

当前版本已更新为 v4.0.0，包含以下重大更新：
- 代码生成增强流程（5步工作流）
- 时序图输出功能
- 代码评审功能
- 用户可选规则配置
- 文件输出验证机制

### 3. 发布命令

```bash
# 发布到京东内部NPM仓库
npm publish --registry=http://registry.m.jd.com

# 或者使用简写
npm publish
```

### 4. 验证发布

发布后，可以通过以下方式验证：

```bash
# 查看已发布的包
npm view @jd/fop-workflow-mcp-server

# 测试安装
npm install -g @jd/fop-workflow-mcp-server --registry=http://registry.m.jd.com

# 测试一键安装
npx -y --registry=http://registry.m.jd.com @jd/fop-workflow-mcp-server
```

## 🔧 部署后验证

### 1. 一键安装测试

```bash
# 测试一键安装
npx -y --registry=http://registry.m.jd.com @jd/fop-workflow-mcp-server

# 应该看到启动信息：
# 🚀 启动JoyCode MCP服务器 v4.0.0 - 增强版...
# 📋 支持的工作流阶段: PRD分析 → 代码生成 → 流程图生成 → 代码评审 → 最终验证
# ✅ MCP服务器启动成功！
# 📡 等待客户端请求...
```

### 2. MCP客户端配置

在MCP客户端中添加配置：

```json
{
  "mcpServers": {
    "fop-workflow-mcp-server": {
      "command": "npx",
      "args": ["-y", "--registry=http://registry.m.jd.com", "@jd/fop-workflow-mcp-server"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 3. 功能测试

启动后，可以测试以下功能：

```bash
# 测试工具列表
curl -X POST http://localhost:3000/tools

# 或者通过MCP客户端测试：
# fop-workflow-mcp-server帮我完成需求
```

## 📋 发布清单

- [x] 更新版本号到 v4.0.0
- [x] 更新package.json描述
- [x] 确保所有必需文件包含在发布中
- [x] 测试本地构建
- [x] 发布到NPM仓库
- [x] 验证一键安装
- [x] 更新文档

## 🔄 回滚策略

如果发布出现问题，可以：

```bash
# 取消发布
npm unpublish @jd/fop-workflow-mcp-server@4.0.0 --registry=http://registry.m.jd.com

# 或者发布修复版本
npm version patch
npm publish --registry=http://registry.m.jd.com
```

## 📞 问题联系

如有发布问题，请联系：
- ✅ wanghanxiong1@jd.com
- ✅ sa549236986@163.com