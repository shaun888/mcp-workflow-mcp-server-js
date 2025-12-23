#!/usr/bin/env node
/**
 * 端到端自测脚本
 * 1. 确保 Java 服务在 8080 存活
 * 2. 以 stdio 方式拉起 MCP 服务器
 * 3. 顺序发送三类任务，验证自动选工具
 * 4. 打印简要报告
 */
const { spawn } = require('child_process');
const axios = require('axios');

const JAVA_HEALTH = 'http://localhost:8080/api/health';
const TEST_CASES = [
  {
    type: 'prd',
    prompt: '请基于 https://joyspace.jd.com/s/xxxxx 生成 PRD 分析报告'
  },
  {
    type: 'code',
    prompt: '根据上面 PRD 生成符合 FOP 规范的 Java 代码'
  },
  {
    type: 'flowchart',
    prompt: '再为上述需求生成业务流程图'
  }
];

(async () => {
  console.log('[TEST] 等待 Java 服务就绪...');
  await waitForJava();
  console.log('[TEST] Java 服务已就绪，启动 MCP 服务器...');

  const mcp = spawn('node', ['server.js'], { stdio: ['pipe', 'pipe', 'inherit'] });
  mcp.stdout.setEncoding('utf8');
  let buffer = '';

  mcp.stdout.on('data', chunk => {
    buffer += chunk;
    // 收到一次提示符即可发下一条
    if (buffer.includes('>')) {
      mcp.stdin.write('\n');
    }
  });

  // 顺序喂 prompt
  for (const tc of TEST_CASES) {
    await sendPrompt(mcp, tc.prompt);
    await sleep(1500); // 等结果回传
    const ok = buffer.includes('"code":0') || buffer.includes('成功');
    console.log(`[TEST] ${tc.type} -> ${ok ? '✅' : '❌'}`);
  }

  console.log('[TEST] 全部完成，退出 MCP...');
  mcp.kill('SIGINT');
  process.exit(0);
})();

function waitForJava() {
  return new Promise((resolve, reject) => {
    const id = setInterval(async () => {
      try {
        await axios.get(JAVA_HEALTH, { timeout: 1000 });
        clearInterval(id);
        resolve();
      } catch {}
    }, 1000);
    setTimeout(() => { clearInterval(id); reject(new Error('Java 服务启动超时')); }, 30000);
  });
}

function sendPrompt(mcp, prompt) {
  return new Promise(res => {
    mcp.stdin.write(prompt + '\n');
    setTimeout(res, 500);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}