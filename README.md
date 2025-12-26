# JoyCode MCP服务器 - FOP工作流智能助手

基于标准MCP协议的专业工作流服务器，专注京东FOP平台需求分析、代码生成和流程图创建。

## 🚀 一键安装

```bash
# 通过京东内部npm仓库安装
npx -y --registry=http://registry.m.jd.com @jd/fop-workflow-mcp-server
```

## 📋 MCP配置

在MCP客户端配置中添加：
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

## 🎯 使用方式

安装后，直接对LLM说：
- **"fop-workflow-mcp-server帮我完成需求"**
- **"fop-workflow-mcp-server分析这个PRD"**
- **"fop-workflow-mcp-server生成代码"**
- **"fop-workflow-mcp-server创建流程图"**

## 🔧 核心功能

### 1. 智能工作流执行
- **stage1_prd_analysis**: PRD需求分析阶段
- **stage2_code_generation**: 代码生成阶段  
- **stage3_flowchart_generation**: 流程图生成阶段

### 2. 配置管理
- **load_config**: 加载FOP配置文件
- **get_workflow_config**: 获取工作流配置
- **show_config_summary**: 显示配置摘要

### 3. 智能优化
- **get_smart_retrieval_config**: 代码分析优化策略
- **get_file_naming_rules**: FOP规范文件命名
- **execute_workflow_stage**: 执行指定工作流阶段

## 📊 技术特性

- ✅ **标准MCP协议**: 基于@modelcontextprotocol/sdk实现
- ✅ **零配置安装**: 一键安装，无需额外设置
- ✅ **稳定连接**: 内置心跳机制，不会超时
- ✅ **完整工作流**: 保留原有FOP三阶段工作流
- ✅ **智能检索**: 减少70%无效代码检索，95%+准确率

## 📁 文件结构
```
├── index.js                    # MCP服务器主文件
├── package.json                # 发布配置
├── fop/
│   └── .joycode/
│       └── fop-agent-config.json  # 工作流配置
└── README.md                   # 使用说明
```

## 🛠️ 开发使用

```bash
# 本地测试
npm start

# 查看配置
npm run config

# 获取工作流配置
npm run stage -- --stage stage1_prd_analysis
```

## 📋 依赖要求

- Node.js >= 16.0.0
- @modelcontextprotocol/sdk ^1.25.0

## 📄 许可证

MIT License

## 👥 问题联系
✅wanghanxiong1@jd.com  
✅sa549236986@163.com
