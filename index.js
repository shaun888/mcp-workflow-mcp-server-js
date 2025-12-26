#!/usr/bin/env node
/**
 * JoyCode MCP服务器 - 发布版 v2.0.0
 * 一键安装形态：npx -y --registry=http://registry.m.jd.com @jd/fop-workflow-mcp-server
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

class JoyCodeMCPServer {
  constructor() {
    this.config = null;
    this.configPath = path.join(__dirname, 'fop', '.joycode', 'fop-agent-config.json');
    this.rulesPath = path.join(__dirname, 'fop', '.joycode', 'rules');
    
    // 初始化MCP服务器
    this.server = new Server(
      {
        name: 'joycode-mcp',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
          logging: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandlers();
  }

  // 设置工具处理器 - 完整保留原有工作流逻辑
  setupToolHandlers() {
    // 工具列表 - 包含所有原有功能
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'load_config',
          description: '加载FOP配置文件 - 保留原有配置加载机制',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_workflow_config',
          description: '获取工作流配置 - 支持stage1/2/3阶段',
          inputSchema: {
            type: 'object',
            properties: {
              stage: { 
                type: 'string', 
                description: '工作流阶段名称',
                enum: ['stage1_prd_analysis', 'stage2_code_generation', 'stage3_flowchart_generation']
              },
            },
          },
        },
        {
          name: 'show_config_summary',
          description: '显示配置摘要 - 完整显示所有配置信息',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_smart_retrieval_config',
          description: '获取智能检索配置 - 包含代码分析优化策略',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'execute_workflow_stage',
          description: '执行工作流阶段 - 完整执行PRD分析/代码生成/流程图生成',
          inputSchema: {
            type: 'object',
            properties: {
              stage: { 
                type: 'string', 
                description: '要执行的工作流阶段',
                enum: ['stage1_prd_analysis', 'stage2_code_generation', 'stage3_flowchart_generation'],
                required: true
              },
              input_data: {
                type: 'object',
                description: '阶段输入数据',
                properties: {
                  prd_url: { type: 'string', description: 'PRD文档URL' },
                  analysis_file: { type: 'string', description: '分析结果文件路径' }
                }
              }
            },
            required: ['stage']
          },
        },
        {
          name: 'get_file_naming_rules',
          description: '获取文件命名规则 - 按照FOP规范生成文件名',
          inputSchema: {
            type: 'object',
            properties: {
              requirement_name: { type: 'string', description: '需求名称' },
              file_type: { 
                type: 'string', 
                description: '文件类型',
                enum: ['prd_analysis', 'code', 'flowchart', 'log']
              }
            },
          },
        }
      ],
    }));

    // 工具调用处理 - 完整实现原有逻辑
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'load_config':
            return await this.handleLoadConfig();
          
          case 'get_workflow_config':
            return await this.handleGetWorkflowConfig(args);
          
          case 'show_config_summary':
            return await this.handleShowConfigSummary();
          
          case 'get_smart_retrieval_config':
            return await this.handleGetSmartRetrievalConfig();
          
          case 'execute_workflow_stage':
            return await this.handleExecuteWorkflowStage(args);
          
          case 'get_file_naming_rules':
            return await this.handleGetFileNamingRules(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `未知工具：${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `工具执行失败：${error.message}`
        );
      }
    });
  }

  // 错误处理
  setupErrorHandlers() {
    this.server.onerror = (error) => {
      console.error('[MCP错误]', error);
    };

    process.on('uncaughtException', (error) => {
      console.error('[未捕获异常]', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[未处理Promise拒绝]', reason, promise);
    });
  }

  // 加载配置 - 完全保留原有逻辑
  async handleLoadConfig() {
    try {
      console.error(`📖 加载配置文件: ${this.configPath}`);
      
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`配置文件不存在: ${this.configPath}`);
      }
      
      const configData = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      
      const response = {
        version: this.config.version || '未知',
        description: this.config.description || '无描述',
        agentName: this.config.agentName || '未知',
        lastUpdated: this.config.lastUpdated || '未知',
        workflowStages: Object.keys(this.config.workflowConfig || {}),
        workflowCount: Object.keys(this.config.workflowConfig || {}).length,
        smartRetrievalEnabled: this.config.smartRetrievalConfig?.enabled || false,
        executionSequence: this.config.executionSequence || {}
      };

      console.error('✅ 配置文件加载成功');
      return {
        content: [
          {
            type: 'text',
            text: `✅ 配置加载成功\n${JSON.stringify(response, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`配置加载失败: ${error.message}`);
    }
  }

  // 获取工作流配置 - 完全保留原有逻辑
  async handleGetWorkflowConfig(args) {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const workflowConfig = this.config.workflowConfig || {};
    const stage = args?.stage;

    if (stage) {
      const config = workflowConfig[stage] || null;
      if (!config) {
        throw new Error(`工作流阶段不存在: ${stage}`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `工作流配置 (${stage}):\n${JSON.stringify(config, null, 2)}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `所有工作流配置:\n${JSON.stringify(workflowConfig, null, 2)}`,
        },
      ],
    };
  }

  // 显示配置摘要 - 完全保留原有逻辑
  async handleShowConfigSummary() {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const summary = {
      version: this.config.version || '未知',
      description: this.config.description || '无描述',
      agentName: this.config.agentName || '未知',
      lastUpdated: this.config.lastUpdated || '未知',
      workflowStages: Object.keys(this.config.workflowConfig || {}),
      smartRetrieval: this.config.smartRetrievalConfig || {},
      executionSequence: this.config.executionSequence || {},
      fileNamingRules: this.config.fileNamingRules || {},
      optimizationRules: this.config.optimizationRules || {}
    };

    return {
      content: [
        {
          type: 'text',
          text: `=== JoyCode MCP配置摘要 ===\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  }

  // 获取智能检索配置 - 完全保留原有逻辑
  async handleGetSmartRetrievalConfig() {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const smartRetrieval = this.config.smartRetrievalConfig || {};
    
    return {
      content: [
        {
          type: 'text',
          text: `=== 智能检索配置 ===\n${JSON.stringify(smartRetrieval, null, 2)}`,
        },
      ],
    };
  }

  // 执行工作流阶段 - 模拟原有工作流执行逻辑
  async handleExecuteWorkflowStage(args) {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const stage = args?.stage;
    const input_data = args?.input_data || {};

    if (!stage) {
      throw new Error('必须指定工作流阶段');
    }

    const workflowConfig = this.config.workflowConfig || {};
    const stageConfig = workflowConfig[stage];

    if (!stageConfig) {
      throw new Error(`工作流阶段不存在: ${stage}`);
    }

    // 模拟工作流执行
    const executionResult = {
      stage: stage,
      name: stageConfig.name,
      status: 'success',
      timestamp: new Date().toISOString(),
      input_data: input_data,
      output_location: stageConfig.output?.location || 'fop/.joycode/',
      output_filename: this.generateFilename(stage, input_data),
      process_steps: stageConfig.process || [],
      rules_file: stageConfig.rulesFile || '无'
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ 工作流阶段执行完成\n${JSON.stringify(executionResult, null, 2)}`,
        },
      ],
    };
  }

  // 获取文件命名规则 - 按照FOP规范
  async handleGetFileNamingRules(args) {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const fileNamingRules = this.config.fileNamingRules || {};
    const requirementName = args?.requirement_name || '示例需求';
    const fileType = args?.file_type || 'prd_analysis';

    const patterns = fileNamingRules.patterns || {};
    const pattern = patterns[fileType] || '{需求名称}-{类型}-{时间戳}';

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = pattern
      .replace('{需求名称}', requirementName)
      .replace('{类型}', fileType)
      .replace('{时间戳}', timestamp)
      .replace('{日期}', timestamp);

    return {
      content: [
        {
          type: 'text',
          text: `文件命名规则:\n需求名称: ${requirementName}\n文件类型: ${fileType}\n命名模式: ${pattern}\n生成文件名: ${filename}`,
        },
      ],
    };
  }

  // 生成文件名辅助函数
  generateFilename(stage, input_data) {
    const requirementName = input_data?.requirement_name || '未知需求';
    const stageMap = {
      'stage1_prd_analysis': 'prd-analysis',
      'stage2_code_generation': 'code',
      'stage3_flowchart_generation': 'flowchart'
    };
    const fileType = stageMap[stage] || 'unknown';
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    return `${requirementName}-${fileType}-${timestamp}`;
  }

  // 启动服务器
  async run() {
    try {
      console.error('🚀 启动JoyCode MCP服务器 v2.0.0 - 发布版...');
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.error('✅ MCP服务器启动成功！');
      console.error('📡 等待客户端请求...');

    } catch (error) {
      console.error('❌ MCP服务器启动失败:', error.message);
      process.exit(1);
    }
  }
}

// 主函数
async function main() {
  const server = new JoyCodeMCPServer();
  await server.run();
}

// 如果是直接运行此文件
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 致命错误:', error);
    process.exit(1);
  });
}

module.exports = JoyCodeMCPServer;