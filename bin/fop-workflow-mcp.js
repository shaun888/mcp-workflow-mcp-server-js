#!/usr/bin/env node

const { spawn } = require('cross-spawn');
const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const program = new Command();

program
  .name('fop-workflow-mcp')
  .description('FOP工作流MCP服务器 - 提供完整的FOP开发规范和指导')
  .version('1.0.0');

program
  .option('-p, --port <port>', '服务器端口', '8080')
  .option('-h, --host <host>', '服务器主机', 'localhost')
  .option('--build', '构建项目后启动')
  .option('--dev', '开发模式启动')
  .option('--verbose', '详细输出')
  .action((options) => {
    console.log(chalk.blue.bold('🚀 启动 FOP工作流MCP服务器...'));
    
    const packageRoot = path.dirname(__dirname);
    const jarPath = path.join(packageRoot, 'target', 'mcp-api-1.0.jar');
    
    // 设置环境变量
    process.env.SERVER_PORT = options.port;
    process.env.SERVER_HOST = options.host;
    
    if (options.build) {
      console.log(chalk.yellow('📦 构建项目...'));
      const buildProcess = spawn('mvn', ['clean', 'package', '-DskipTests'], {
        cwd: packageRoot,
        stdio: options.verbose ? 'inherit' : 'pipe'
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ 构建成功'));
          startServer(jarPath, options);
        } else {
          console.error(chalk.red('❌ 构建失败'));
          process.exit(1);
        }
      });
    } else if (options.dev) {
      console.log(chalk.yellow('🔧 开发模式启动...'));
      const devProcess = spawn('mvn', ['solon:run'], {
        cwd: packageRoot,
        stdio: 'inherit'
      });
      
      devProcess.on('close', (code) => {
        process.exit(code);
      });
    } else {
      // 检查JAR文件是否存在
      if (!fs.existsSync(jarPath)) {
        console.error(chalk.red('❌ JAR文件不存在，请先运行构建: fop-workflow-mcp --build'));
        process.exit(1);
      }
      
      startServer(jarPath, options);
    }
  });

function startServer(jarPath, options) {
  console.log(chalk.green(`🌟 启动服务器在 http://${options.host}:${options.port}`));
  console.log(chalk.cyan(`📡 MCP端点: http://${options.host}:${options.port}/mcp/fop-workflow`));
  
  const javaProcess = spawn('java', [
    '-jar', jarPath,
    `--server.port=${options.port}`,
    `--server.host=${options.host}`
  ], {
    stdio: 'inherit'
  });
  
  javaProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(chalk.red(`❌ 服务器退出，代码: ${code}`));
    }
    process.exit(code);
  });
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 正在关闭服务器...'));
    javaProcess.kill('SIGTERM');
  });
  
  process.on('SIGTERM', () => {
    javaProcess.kill('SIGTERM');
  });
}

// 添加配置命令
program
  .command('config')
  .description('生成MCP客户端配置')
  .option('-o, --output <file>', '输出文件路径', 'mcp-config.json')
  .option('-p, --port <port>', '服务器端口', '8080')
  .option('-h, --host <host>', '服务器主机', 'localhost')
  .action((options) => {
    const config = {
      "fop-workflow-mcp": {
        "url": `http://${options.host}:${options.port}/mcp/fop-workflow`,
        "autoApprove": [
          "getFopWorkflowGuide"
        ]
      }
    };
    
    fs.writeFileSync(options.output, JSON.stringify(config, null, 2));
    console.log(chalk.green(`✅ 配置文件已生成: ${options.output}`));
    console.log(chalk.cyan('📋 请将此配置添加到你的MCP客户端配置中'));
  });

// 添加健康检查命令
program
  .command('health')
  .description('检查服务器健康状态')
  .option('-p, --port <port>', '服务器端口', '8080')
  .option('-h, --host <host>', '服务器主机', 'localhost')
  .action(async (options) => {
    const http = require('http');
    
    const healthUrl = `http://${options.host}:${options.port}/actuator/health`;
    
    console.log(chalk.blue(`🔍 检查服务器健康状态: ${healthUrl}`));
    
    const req = http.get(healthUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(chalk.green('✅ 服务器健康状态良好'));
          try {
            const health = JSON.parse(data);
            console.log(chalk.cyan('📊 健康信息:'), health);
          } catch (e) {
            console.log(chalk.cyan('📊 响应:'), data);
          }
        } else {
          console.log(chalk.yellow(`⚠️  服务器响应状态码: ${res.statusCode}`));
          console.log(chalk.cyan('📊 响应:'), data);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error(chalk.red('❌ 无法连接到服务器:'), err.message);
      console.log(chalk.yellow('💡 提示: 确保服务器正在运行'));
    });
    
    req.setTimeout(5000, () => {
      console.error(chalk.red('❌ 连接超时'));
      req.destroy();
    });
  });

program.parse();