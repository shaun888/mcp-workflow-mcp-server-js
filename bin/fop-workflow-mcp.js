#!/usr/bin/env node

const { spawn } = require('cross-spawn');
const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// 简化且精准的错误处理
function findJarFile(packageRoot) {
  const jarPath = path.join(packageRoot, 'target', 'mcp-api.jar');
  
  if (fs.existsSync(jarPath)) {
    return jarPath;
  }
  
  return null;
}

// 精准错误信息输出
function showErrorAndExit(message, details = '') {
  console.error(chalk.red(`❌ ${message}`));
  if (details) {
    console.error(chalk.yellow(`💡 ${details}`));
  }
  process.exit(1);
}

const program = new Command();

program
  .name('fop-workflow-mcp')
  .description('FOP工作流MCP服务器')
  .version('1.0.4');

program
  .option('-p, --port <port>', '服务器端口', '8080')
  .option('-h, --host <host>', '服务器主机', 'localhost')
  .option('--build', '构建项目后启动')
  .option('--dev', '开发模式启动')
  .action((options) => {
    console.log(chalk.blue('🚀 启动FOP工作流MCP服务器...'));
    
    const packageRoot = path.dirname(__dirname);
    const jarPath = findJarFile(packageRoot);
    
    // 设置环境变量
    process.env.SERVER_PORT = options.port;
    process.env.SERVER_HOST = options.host;
    
    if (options.build) {
      console.log(chalk.yellow('📦 构建项目...'));
      const buildProcess = spawn('mvn', ['clean', 'package', '-DskipTests'], {
        cwd: packageRoot,
        stdio: 'inherit'
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          const newJarPath = findJarFile(packageRoot);
          if (newJarPath) {
            startServer(newJarPath, options);
          } else {
            showErrorAndExit('构建成功但找不到JAR文件', '检查target/mcp-api.jar是否存在');
          }
        } else {
          showErrorAndExit('Maven构建失败', `退出码: ${code}`);
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
      if (!jarPath) {
        showErrorAndExit('找不到JAR文件', '运行: fop-workflow-mcp --build 或检查target/mcp-api.jar');
      }
      startServer(jarPath, options);
    }
  });

function startServer(jarPath, options) {
  console.log(chalk.green(`🌟 启动服务器: http://${options.host}:${options.port}`));
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
      showErrorAndExit(`Java进程异常退出`, `退出码: ${code}`);
    }
    process.exit(code);
  });
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 关闭服务器...'));
    javaProcess.kill('SIGTERM');
  });
  
  process.on('SIGTERM', () => {
    javaProcess.kill('SIGTERM');
  });
}

// 简化配置命令
program
  .command('config')
  .description('生成MCP配置')
  .option('-o, --output <file>', '输出文件', 'mcp-config.json')
  .option('-p, --port <port>', '端口', '8080')
  .option('-h, --host <host>', '主机', 'localhost')
  .action((options) => {
    const config = {
      "fop-workflow-mcp": {
        "url": `http://${options.host}:${options.port}/mcp/fop-workflow`,
        "autoApprove": ["getFopWorkflowGuide"]
      }
    };
    
    fs.writeFileSync(options.output, JSON.stringify(config, null, 2));
    console.log(chalk.green(`✅ 配置已生成: ${options.output}`));
  });

// 简化健康检查
program
  .command('health')
  .description('检查服务状态')
  .option('-p, --port <port>', '端口', '8080')
  .option('-h, --host <host>', '主机', 'localhost')
  .action(async (options) => {
    const http = require('http');
    const healthUrl = `http://${options.host}:${options.port}/actuator/health`;
    
    console.log(chalk.blue(`🔍 检查: ${healthUrl}`));
    
    const req = http.get(healthUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(chalk.green('✅ 服务正常'));
        } else {
          console.log(chalk.yellow(`⚠️ 状态码: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', err => {
      showErrorAndExit('连接失败', err.message);
    });
    
    req.setTimeout(5000, () => {
      showErrorAndExit('连接超时', '检查服务是否启动');
    });
  });

program.parse();