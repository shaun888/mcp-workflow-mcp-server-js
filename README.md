# JoyCode MCP服务器 - FOP工作流智能助手

基于标准MCP协议的专业工作流服务器，专注京东FOP平台需求分析、代码生成、流程图创建和代码评审。

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
- **"fop-workflow-mcp-server评审代码"**

## 🔧 核心功能

### 1. 智能工作流执行（5个阶段）
- **stage1_prd_analysis**: PRD需求分析阶段 - 深度分析需求文档
- **stage2_code_generation**: 代码生成阶段 - 增强流程：代码分析→识别修改点→生成方案→实施修改
- **stage3_flowchart_generation**: 流程图生成阶段 - 业务流程图、技术架构图、时序图
- **stage4_code_review**: 代码评审阶段 - AI代码评审，检查质量、安全、性能
- **stage5_final_verification**: 最终验证阶段 - 验证所有输出文件

### 2. 配置管理
- **load_config**: 加载FOP配置文件
- **get_workflow_config**: 获取工作流配置（支持stage1-5）
- **show_config_summary**: 显示配置摘要

### 3. 智能优化
- **get_smart_retrieval_config**: 代码分析优化策略
- **get_file_naming_rules**: FOP规范文件命名
- **execute_workflow_stage**: 执行指定工作流阶段

### 4. 代码生成增强流程 🆕
- **get_enhanced_code_workflow**: 获取增强的代码生成工作流
  - Step 1: 现有代码结构分析
  - Step 2: 梳理业务相关代码
  - Step 3: 识别需要修改的代码位置
  - Step 4: 生成代码修改方案
  - Step 5: 实施代码修改

### 5. 流程图/时序图输出 🆕
- **get_flowchart_types**: 获取流程图类型配置
  - 业务流程图（businessFlow）
  - 技术架构图（technicalArchitecture）
  - 时序图（sequenceDiagram）
  - API调用链路图（apiCallChain）
  - 数据流向图（dataFlow）

### 6. 代码评审 🆕
- **get_code_review_categories**: 获取代码评审类别
  - 代码质量检查
  - 安全检查
  - 性能检查
  - 异常处理检查
  - 业务逻辑检查
  - 架构规范检查

### 7. 用户可选规则 🆕
- **get_user_selectable_rules**: 获取用户可选规则
- **set_user_rules**: 设置用户自定义规则
  - minimal: 最小配置 - 只启用核心功能
  - standard: 标准配置 - 启用常用功能（推荐）
  - complete: 完整配置 - 启用所有功能
  - development: 开发调试配置

### 8. 文件输出验证 🆕
- **verify_output_files**: 验证输出文件 - 检查所有必需文件是否正确生成
- **get_output_directories**: 获取输出目录配置
- **ensure_output_directories**: 确保输出目录存在

## 📊 技术特性

- ✅ **标准MCP协议**: 基于@modelcontextprotocol/sdk实现
- ✅ **零配置安装**: 一键安装，无需额外设置
- ✅ **稳定连接**: 内置心跳机制，不会超时
- ✅ **完整工作流**: 5阶段工作流（PRD分析→代码生成→流程图生成→代码评审→最终验证）
- ✅ **智能检索**: 减少70%无效代码检索，95%+准确率
- ✅ **时序图输出**: 支持Mermaid时序图生成
- ✅ **代码评审**: AI代码评审，检查质量、安全、性能
- ✅ **用户可选规则**: 支持用户自定义规则配置
- ✅ **文件验证**: 自动验证所有输出文件是否正确生成

## 📁 文件结构
```
├── index.js                    # MCP服务器主文件
├── package.json                # 发布配置
├── fop/
│   └── .joycode/
│       ├── fop-agent-config.json    # 主配置文件
│       ├── config/
│       │   └── user-rules-config.json  # 用户规则配置
│       ├── rules/
│       │   ├── prd-analysis-rules.json      # PRD分析规则
│       │   ├── code-generation-rules.json   # 代码生成规则
│       │   ├── flowchart-generation-rules.json # 流程图生成规则
│       │   ├── code-review-rules.json       # 代码评审规则
│       │   └── user-selectable-rules.json   # 用户可选规则
│       ├── generated-code/          # 生成的代码文件
│       ├── flowcharts/              # 流程图文件
│       ├── reports/                 # 报告文件
│       ├── plans/                   # 方案文件
│       ├── logs/                    # 日志文件
│       ├── implementation-summary/  # 实现总结
│       └── analysis/                # 分析文档
└── README.md                   # 使用说明
```

## 📋 输出文件说明

### 必需输出文件
| 阶段 | 文件类型 | 命名规则 | 说明 |
|------|----------|----------|------|
| Stage 1 | PRD分析 | {需求名称}-prd-analysis-summary.md | PRD分析文档 |
| Stage 2 | 代码文件 | {需求名称}-{模块}-{时间戳}.java | 生成的代码 |
| Stage 2 | 修改方案 | {需求名称}-code-modification-plan-{时间戳}.md | 代码修改方案 |
| Stage 3 | 业务流程图 | {需求名称}-business-flow-{时间戳}.md | 业务流程图 |
| Stage 3 | 技术架构图 | {需求名称}-technical-architecture-{时间戳}.md | 技术架构图 |
| Stage 3 | 时序图 | {需求名称}-sequence-diagram-{时间戳}.md | 系统调用时序图 |
| Stage 4 | 评审报告 | {需求名称}-code-review-report-{时间戳}.md | 代码评审报告 |
| Stage 5 | 验证报告 | {需求名称}-output-verification-report-{时间戳}.md | 输出验证报告 |

## 🛠️ 开发使用

```bash
# 本地测试
npm start

# 查看配置
npm run config

# 获取工作流配置
npm run stage -- --stage stage1_prd_analysis

# 获取增强代码工作流
npm run workflow -- --step step1_existingCodeAnalysis

# 验证输出文件
npm run verify -- --requirement_name "库存管理优化"
```

## 📋 依赖要求

- Node.js >= 16.0.0
- @modelcontextprotocol/sdk ^1.25.0

## 🔄 版本更新

### v4.0.0 (2025-09-10)
- 🆕 新增代码生成增强流程（5步工作流）
- 🆕 新增时序图输出功能
- 🆕 新增代码评审功能
- 🆕 新增用户可选规则配置
- 🆕 新增文件输出验证机制
- 🔧 优化工作流阶段（5个阶段）
- 🔧 增强配置文件结构

### v3.0.0
- 初始版本
- 支持3阶段工作流
- 基础PRD分析、代码生成、流程图功能

## 📄 许可证

MIT License

## 👥 问题联系
✅wanghanxiong1@jd.com  
✅sa549236986@163.com
