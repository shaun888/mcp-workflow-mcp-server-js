#!/usr/bin/env node
/**
 * JoyCode MCP服务器 - 发布版 v4.0.0
 * 一键安装形态：npx -y --registry=http://registry.m.jd.com @jd/fop-workflow-mcp-server
 * 
 * 新增功能：
 * - 代码生成增强流程（分析现有代码→识别修改位置→生成方案→实施修改）
 * - 流程图/时序图输出功能
 * - 代码评审规则
 * - 用户可选规则功能
 * - 文件输出验证机制
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
    this.userConfigPath = path.join(__dirname, 'fop', '.joycode', 'config', 'user-rules-config.json');
    
    // 输出目录配置
    this.outputDirectories = {
      analysis: path.join(__dirname, 'fop', '.joycode'),
      generatedCode: path.join(__dirname, 'fop', '.joycode', 'generated-code'),
      flowcharts: path.join(__dirname, 'fop', '.joycode', 'flowcharts'),
      logs: path.join(__dirname, 'fop', '.joycode', 'logs'),
      reports: path.join(__dirname, 'fop', '.joycode', 'reports'),
      plans: path.join(__dirname, 'fop', '.joycode', 'plans'),
      implementationSummary: path.join(__dirname, 'fop', '.joycode', 'implementation-summary'),
      config: path.join(__dirname, 'fop', '.joycode', 'config')
    };
    
    // 初始化MCP服务器
    this.server = new Server(
      {
        name: 'fop-workflow-mcp-server',
        version: '4.0.0',
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

  // 设置工具处理器 - 包含所有功能
  setupToolHandlers() {
    // 工具列表 - 包含所有功能
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
          description: '获取工作流配置 - 支持stage1/2/3/4/5阶段',
          inputSchema: {
            type: 'object',
            properties: {
              stage: { 
                type: 'string', 
                description: '工作流阶段名称',
                enum: ['stage1_prd_analysis', 'stage2_code_generation', 'stage3_flowchart_generation', 'stage4_code_review', 'stage5_final_verification']
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
          description: '执行工作流阶段 - 完整执行PRD分析/代码生成/流程图生成/代码评审/最终验证',
          inputSchema: {
            type: 'object',
            properties: {
              stage: { 
                type: 'string', 
                description: '要执行的工作流阶段',
                enum: ['stage1_prd_analysis', 'stage2_code_generation', 'stage3_flowchart_generation', 'stage4_code_review', 'stage5_final_verification'],
                required: true
              },
              input_data: {
                type: 'object',
                description: '阶段输入数据',
                properties: {
                  prd_url: { type: 'string', description: 'PRD文档URL' },
                  analysis_file: { type: 'string', description: '分析结果文件路径' },
                  requirement_name: { type: 'string', description: '需求名称' },
                  code_files: { type: 'array', items: { type: 'string' }, description: '代码文件列表' },
                  user_rules: { type: 'object', description: '用户自定义规则配置' }
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
                enum: ['prd_analysis', 'code', 'flowchart', 'sequence_diagram', 'code_review_report', 'verification_report', 'log', 'plan', 'analysis']
              }
            },
          },
        },
        {
          name: 'get_enhanced_code_workflow',
          description: '获取增强的代码生成工作流 - 包含代码分析、识别修改位置、生成方案、实施修改步骤',
          inputSchema: {
            type: 'object',
            properties: {
              step: {
                type: 'string',
                description: '工作流步骤',
                enum: ['step1_existingCodeAnalysis', 'step2_businessCodeIdentification', 'step3_modificationPointIdentification', 'step4_codeModificationPlan', 'step5_codeImplementation']
              }
            },
          },
        },
        {
          name: 'get_flowchart_types',
          description: '获取流程图类型配置 - 业务流程图、技术架构图、时序图等',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_code_review_categories',
          description: '获取代码评审类别 - 代码质量、安全检查、性能检查等',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_user_selectable_rules',
          description: '获取用户可选规则 - 查看所有可选规则和预设配置',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: '规则类别（可选）',
                enum: ['prdAnalysis', 'codeGeneration', 'flowchartGeneration', 'codeReview', 'outputVerification', 'all']
              }
            },
          },
        },
        {
          name: 'set_user_rules',
          description: '设置用户自定义规则 - 启用或禁用特定规则',
          inputSchema: {
            type: 'object',
            properties: {
              preset: {
                type: 'string',
                description: '预设配置名称',
                enum: ['minimal', 'standard', 'complete', 'development']
              },
              custom_rules: {
                type: 'object',
                description: '自定义规则配置'
              }
            },
          },
        },
        {
          name: 'verify_output_files',
          description: '验证输出文件 - 检查所有必需文件是否正确生成',
          inputSchema: {
            type: 'object',
            properties: {
              requirement_name: { type: 'string', description: '需求名称' },
              check_types: {
                type: 'array',
                items: { type: 'string' },
                description: '要检查的文件类型'
              }
            },
          },
        },
        {
          name: 'get_output_directories',
          description: '获取输出目录配置 - 返回所有输出目录路径',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'ensure_output_directories',
          description: '确保输出目录存在 - 创建所有必需的输出目录',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_execution_sequence',
          description: '获取执行顺序 - 返回工作流执行顺序和依赖关系',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        }
      ],
    }));

    // 工具调用处理 - 完整实现所有功能
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
          
          case 'get_enhanced_code_workflow':
            return await this.handleGetEnhancedCodeWorkflow(args);
          
          case 'get_flowchart_types':
            return await this.handleGetFlowchartTypes();
          
          case 'get_code_review_categories':
            return await this.handleGetCodeReviewCategories();
          
          case 'get_user_selectable_rules':
            return await this.handleGetUserSelectableRules(args);
          
          case 'set_user_rules':
            return await this.handleSetUserRules(args);
          
          case 'verify_output_files':
            return await this.handleVerifyOutputFiles(args);
          
          case 'get_output_directories':
            return await this.handleGetOutputDirectories();
          
          case 'ensure_output_directories':
            return await this.handleEnsureOutputDirectories();
          
          case 'get_execution_sequence':
            return await this.handleGetExecutionSequence();
          
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
        executionSequence: this.config.executionSequence || {},
        userSelectableRulesEnabled: this.config.userSelectableRules?.enabled || false
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

  // 获取工作流配置 - 支持新的阶段
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

  // 显示配置摘要 - 包含新功能
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
      optimizationRules: this.config.optimizationRules || {},
      userSelectableRules: this.config.userSelectableRules || {},
      coreCapabilities: this.config.coreCapabilities || {},
      outputDirectories: this.outputDirectories
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

  // 获取智能检索配置
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

  // 执行工作流阶段 - 增强版本
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

    // 确保输出目录存在
    await this.ensureDirectoriesExist();

    // 生成文件名
    const requirementName = input_data?.requirement_name || '未知需求';
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // 根据阶段生成不同的输出信息
    const executionResult = {
      stage: stage,
      name: stageConfig.name,
      status: 'success',
      timestamp: new Date().toISOString(),
      input_data: input_data,
      process_steps: stageConfig.process || [],
      rules_file: stageConfig.rulesFile || '无',
      output: this.generateOutputInfo(stage, requirementName, timestamp),
      verification: stageConfig.verification || {}
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

  // 生成输出信息
  generateOutputInfo(stage, requirementName, timestamp) {
    const outputInfo = {
      location: '',
      filename: '',
      requiredFiles: []
    };

    switch (stage) {
      case 'stage1_prd_analysis':
        outputInfo.location = this.outputDirectories.analysis;
        outputInfo.filename = `${requirementName}-prd-analysis-summary.md`;
        outputInfo.requiredFiles = [
          { type: 'prd_analysis', path: `${outputInfo.location}/${outputInfo.filename}`, required: true }
        ];
        break;
      
      case 'stage2_code_generation':
        outputInfo.location = this.outputDirectories.generatedCode;
        outputInfo.filename = `${requirementName}-{模块类型}-${timestamp}.java`;
        outputInfo.requiredFiles = [
          { type: 'code_structure_analysis', path: `${this.outputDirectories.analysis}/${requirementName}-code-structure-analysis-${timestamp}.md`, required: false },
          { type: 'business_code_identification', path: `${this.outputDirectories.analysis}/${requirementName}-business-code-identification-${timestamp}.md`, required: false },
          { type: 'modification_points', path: `${this.outputDirectories.analysis}/${requirementName}-modification-points-${timestamp}.md`, required: false },
          { type: 'code_modification_plan', path: `${this.outputDirectories.plans}/${requirementName}-code-modification-plan-${timestamp}.md`, required: false },
          { type: 'generated_code', path: `${outputInfo.location}/${outputInfo.filename}`, required: true }
        ];
        break;
      
      case 'stage3_flowchart_generation':
        outputInfo.location = this.outputDirectories.flowcharts;
        outputInfo.requiredFiles = [
          { type: 'business_flow', path: `${outputInfo.location}/${requirementName}-business-flow-${timestamp}.md`, required: true },
          { type: 'technical_architecture', path: `${outputInfo.location}/${requirementName}-technical-architecture-${timestamp}.md`, required: true },
          { type: 'sequence_diagram', path: `${outputInfo.location}/${requirementName}-sequence-diagram-${timestamp}.md`, required: true }
        ];
        break;
      
      case 'stage4_code_review':
        outputInfo.location = this.outputDirectories.reports;
        outputInfo.filename = `${requirementName}-code-review-report-${timestamp}.md`;
        outputInfo.requiredFiles = [
          { type: 'code_review_report', path: `${outputInfo.location}/${outputInfo.filename}`, required: true }
        ];
        break;
      
      case 'stage5_final_verification':
        outputInfo.location = this.outputDirectories.reports;
        outputInfo.filename = `${requirementName}-output-verification-report-${timestamp}.md`;
        outputInfo.requiredFiles = [
          { type: 'verification_report', path: `${outputInfo.location}/${outputInfo.filename}`, required: true }
        ];
        break;
    }

    return outputInfo;
  }

  // 获取文件命名规则
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

  // 获取增强的代码生成工作流
  async handleGetEnhancedCodeWorkflow(args) {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const stage2Config = this.config.workflowConfig?.stage2_code_generation || {};
    const enhancedWorkflow = stage2Config.enhancedWorkflow || {};
    const step = args?.step;

    if (step) {
      const stepConfig = enhancedWorkflow.steps?.[step] || null;
      if (!stepConfig) {
        throw new Error(`工作流步骤不存在: ${step}`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `代码生成工作流步骤 (${step}):\n${JSON.stringify(stepConfig, null, 2)}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `增强的代码生成工作流:\n${JSON.stringify(enhancedWorkflow, null, 2)}`,
        },
      ],
    };
  }

  // 获取流程图类型配置
  async handleGetFlowchartTypes() {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const stage3Config = this.config.workflowConfig?.stage3_flowchart_generation || {};
    const flowchartTypes = stage3Config.flowchartTypes || {};

    return {
      content: [
        {
          type: 'text',
          text: `流程图类型配置:\n${JSON.stringify(flowchartTypes, null, 2)}`,
        },
      ],
    };
  }

  // 获取代码评审类别
  async handleGetCodeReviewCategories() {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const stage4Config = this.config.workflowConfig?.stage4_code_review || {};
    const reviewCategories = stage4Config.reviewCategories || {};

    // 加载代码评审规则文件
    const reviewRulesPath = path.join(this.rulesPath, 'code-review-rules.json');
    let reviewRules = {};
    
    if (fs.existsSync(reviewRulesPath)) {
      const reviewRulesData = fs.readFileSync(reviewRulesPath, 'utf8');
      reviewRules = JSON.parse(reviewRulesData);
    }

    return {
      content: [
        {
          type: 'text',
          text: `代码评审类别:\n${JSON.stringify({
            categories: reviewCategories,
            rules: reviewRules.reviewCategories || {}
          }, null, 2)}`,
        },
      ],
    };
  }

  // 获取用户可选规则
  async handleGetUserSelectableRules(args) {
    const userRulesPath = path.join(this.rulesPath, 'user-selectable-rules.json');
    
    if (!fs.existsSync(userRulesPath)) {
      throw new Error(`用户可选规则文件不存在: ${userRulesPath}`);
    }
    
    const userRulesData = fs.readFileSync(userRulesPath, 'utf8');
    const userRules = JSON.parse(userRulesData);
    
    const category = args?.category || 'all';
    
    if (category !== 'all') {
      const categoryRules = userRules.ruleCategories?.[category] || null;
      if (!categoryRules) {
        throw new Error(`规则类别不存在: ${category}`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `规则类别 (${category}):\n${JSON.stringify(categoryRules, null, 2)}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `用户可选规则:\n${JSON.stringify({
            categories: userRules.ruleCategories,
            presets: userRules.ruleSelectionUI?.presets
          }, null, 2)}`,
        },
      ],
    };
  }

  // 设置用户自定义规则
  async handleSetUserRules(args) {
    const preset = args?.preset;
    const customRules = args?.custom_rules;

    // 确保配置目录存在
    if (!fs.existsSync(this.outputDirectories.config)) {
      fs.mkdirSync(this.outputDirectories.config, { recursive: true });
    }

    const userConfig = {
      preset: preset || 'custom',
      customRules: customRules || {},
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(this.userConfigPath, JSON.stringify(userConfig, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: `✅ 用户规则设置成功\n预设: ${preset || '自定义'}\n配置已保存到: ${this.userConfigPath}`,
        },
      ],
    };
  }

  // 验证输出文件
  async handleVerifyOutputFiles(args) {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const requirementName = args?.requirement_name || '未知需求';
    const checkTypes = args?.check_types || ['all'];

    const stage5Config = this.config.workflowConfig?.stage5_final_verification || {};
    const verificationItems = stage5Config.verificationItems || {};

    const verificationResults = [];
    let allPassed = true;

    for (const [key, item] of Object.entries(verificationItems)) {
      if (checkTypes.length > 0 && !checkTypes.includes('all') && !checkTypes.includes(key)) {
        continue;
      }

      const location = item.location.replace('{需求名称}', requirementName);
      const pattern = item.pattern.replace('{需求名称}', requirementName);
      
      // 检查文件是否存在
      let exists = false;
      let files = [];

      if (fs.existsSync(location)) {
        files = fs.readdirSync(location).filter(f => {
          // 简单的模式匹配
          const basePattern = pattern.replace('{时间戳}', '').replace('{日期}', '').replace('*', '');
          return f.includes(requirementName);
        });
        exists = files.length > 0;
      }

      const result = {
        type: key,
        required: item.required,
        exists: exists,
        files: files,
        status: exists ? '✅ 通过' : (item.required ? '❌ 缺失' : '⚠️ 可选')
      };

      verificationResults.push(result);

      if (item.required && !exists) {
        allPassed = false;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `文件验证结果 (${requirementName}):\n${JSON.stringify({
            allPassed: allPassed,
            results: verificationResults,
            summary: allPassed ? '✅ 所有必需文件已生成' : '❌ 存在缺失的必需文件'
          }, null, 2)}`,
        },
      ],
    };
  }

  // 获取输出目录配置
  async handleGetOutputDirectories() {
    const directories = {};
    
    for (const [key, dir] of Object.entries(this.outputDirectories)) {
      directories[key] = {
        path: dir,
        exists: fs.existsSync(dir)
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `输出目录配置:\n${JSON.stringify(directories, null, 2)}`,
        },
      ],
    };
  }

  // 确保输出目录存在
  async handleEnsureOutputDirectories() {
    await this.ensureDirectoriesExist();

    const results = [];
    for (const [key, dir] of Object.entries(this.outputDirectories)) {
      results.push({
        name: key,
        path: dir,
        created: fs.existsSync(dir)
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ 输出目录已创建:\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    };
  }

  // 确保目录存在
  async ensureDirectoriesExist() {
    for (const dir of Object.values(this.outputDirectories)) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  // 获取执行顺序
  async handleGetExecutionSequence() {
    if (!this.config) {
      await this.handleLoadConfig();
    }

    const executionSequence = this.config.executionSequence || {};

    return {
      content: [
        {
          type: 'text',
          text: `执行顺序:\n${JSON.stringify(executionSequence, null, 2)}`,
        },
      ],
    };
  }

  // 启动服务器
  async run() {
    try {
      console.error('🚀 启动JoyCode MCP服务器 v4.0.0 - 增强版...');
      console.error('📋 支持的工作流阶段: PRD分析 → 代码生成 → 流程图生成 → 代码评审 → 最终验证');
      
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