# 生产环境部署配置指南

## 🎯 解决localhost问题

您提到的localhost问题是正确的！localhost只能在本地访问，要让别人使用您的MCP服务器，需要部署到公网可访问的地址。

## 📋 三种部署方案对比

### 方案一：云服务器部署（推荐）

#### 成本：约50-100元/月
- **阿里云ECS**：1核2G，1M带宽，约60元/月
- **腾讯云CVM**：新用户首年优惠，约40元/月
- **华为云ECS**：类似配置，约55元/月

#### 部署步骤：
1. **购买云服务器**
   ```bash
   # 推荐配置
   CPU: 1核
   内存: 2GB
   带宽: 1-3M
   系统: Ubuntu 20.04
   ```

2. **部署您的应用**
   ```bash
   # 上传代码到服务器
   scp -r ./mcp-api root@您的服务器IP:/opt/
   
   # 安装Java环境
   sudo apt update
   sudo apt install openjdk-8-jdk
   
   # 构建并启动
   cd /opt/mcp-api
   mvn clean package
   nohup java -jar target/mcp-api-1.0.jar &
   ```

3. **配置安全组**
   - 开放8080端口
   - 允许HTTP访问

4. **更新NPM包配置**
   ```json
   {
     "config": {
       "serverUrl": "http://您的服务器IP:8080"
     }
   }
   ```

#### 最终用户配置：
```json
{
  "fop-workflow-mcp": {
    "url": "http://123.45.67.89:8080/mcp/fop-workflow",
    "autoApprove": ["getFopWorkflowGuide"],
    "timeout": 30000
  }
}
```

### 方案二：内网穿透（适合测试）

#### 成本：免费或20-50元/月
使用ngrok、frp或花生壳等工具：

```bash
# 使用ngrok示例
ngrok http 8080

# 会得到一个公网地址如：
# https://abc123.ngrok.io -> http://localhost:8080
```

#### 优点：
- 快速测试
- 无需购买服务器
- 适合开发阶段

#### 缺点：
- 地址会变化
- 免费版有限制
- 不适合生产环境

### 方案三：Docker Hub + 用户自部署

#### 成本：免费（用户自己部署）

1. **您发布Docker镜像**
   ```bash
   docker build -t your-username/fop-workflow-mcp .
   docker push your-username/fop-workflow-mcp
   ```

2. **用户自己部署**
   ```bash
   docker run -d -p 8080:8080 your-username/fop-workflow-mcp
   ```

3. **用户配置**
   ```json
   {
     "fop-workflow-mcp": {
       "url": "http://localhost:8080/mcp/fop-workflow"
     }
   }
   ```

## 🚀 推荐的完整发布流程

### 第一步：准备云服务器
```bash
# 1. 购买阿里云ECS（推荐）
# 2. 配置安全组开放8080端口
# 3. 连接服务器并安装环境

ssh root@您的服务器IP
sudo apt update
sudo apt install -y openjdk-8-jdk maven git nginx
```

### 第二步：部署应用
```bash
# 克隆代码
git clone <您的仓库地址>
cd mcp-api

# 构建应用
mvn clean package -DskipTests

# 后台启动
nohup java -jar target/mcp-api-1.0.jar > app.log 2>&1 &

# 检查状态
curl http://localhost:8080/health
```

### 第三步：配置域名（可选）
```bash
# 编辑Nginx配置
sudo nano /etc/nginx/sites-available/fop-mcp

# 配置内容：
server {
    listen 80;
    server_name fop-mcp.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/fop-mcp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 第四步：更新NPM包
```javascript
// 更新 bin/fop-workflow-mcp.js
const DEFAULT_SERVER_URL = process.env.FOP_MCP_SERVER_URL || 'http://您的服务器IP:8080';

// 或者支持环境变量配置
const DEFAULT_SERVER_URL = process.env.FOP_MCP_SERVER_URL || 
                          process.env.npm_package_config_serverUrl || 
                          'http://您的服务器IP:8080';
```

### 第五步：发布NPM包
```bash
# 更新版本
npm version patch

# 发布到京东内部NPM
npm publish --registry=http://registry.m.jd.com
```

## 📝 实际配置示例

假设您的服务器IP是 `123.45.67.89`：

### package.json
```json
{
  "name": "@jd/fop-workflow-mcp",
  "version": "1.0.1",
  "config": {
    "serverUrl": "http://123.45.67.89:8080"
  }
}
```

### 用户安装使用
```bash
# 安装
npm install --registry=http://registry.m.jd.com @jd/fop-workflow-mcp

# 使用（会自动连接到您的云服务器）
npx fop-workflow-mcp start
```

### JoyCode配置
```json
{
  "fop-workflow-mcp": {
    "url": "http://123.45.67.89:8080/mcp/fop-workflow",
    "autoApprove": [
      "getFopWorkflowGuide",
      "getPrdAnalysisRules",
      "getCodeGenerationRules"
    ],
    "timeout": 30000,
    "description": "FOP工作流规范指导服务器 - 云端版"
  }
}
```

## ⚡ 快速启动脚本

创建一键部署脚本 `deploy.sh`：

```bash
#!/bin/bash
echo "🚀 开始部署FOP MCP服务器..."

# 检查Java环境
if ! command -v java &> /dev/null; then
    echo "安装Java..."
    sudo apt update
    sudo apt install -y openjdk-8-jdk
fi

# 构建项目
echo "📦 构建项目..."
mvn clean package -DskipTests

# 停止旧进程
echo "🛑 停止旧服务..."
pkill -f "mcp-api-1.0.jar" || true

# 启动新服务
echo "▶️ 启动新服务..."
nohup java -jar target/mcp-api-1.0.jar > app.log 2>&1 &

# 等待启动
sleep 5

# 检查状态
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ 服务启动成功！"
    echo "🌐 访问地址: http://$(curl -s ifconfig.me):8080"
else
    echo "❌ 服务启动失败，请检查日志: tail -f app.log"
fi
```

## 🔧 故障排除

### 常见问题：

1. **端口被占用**
   ```bash
   sudo lsof -i :8080
   sudo kill -9 <PID>
   ```

2. **防火墙阻止**
   ```bash
   sudo ufw allow 8080
   sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
   ```

3. **内存不足**
   ```bash
   # 启动时限制内存使用
   java -Xmx512m -jar target/mcp-api-1.0.jar
   ```

4. **域名解析问题**
   ```bash
   # 检查DNS
   nslookup yourdomain.com
   
   # 检查Nginx配置
   sudo nginx -t
   ```

## 💡 成本优化建议

1. **选择合适的云服务商**
   - 新用户优惠：腾讯云、阿里云首年折扣
   - 按量付费：华为云、UCloud适合低流量

2. **资源配置优化**
   - 1核1G足够小规模使用
   - 按需升级带宽
   - 使用CDN加速（如需要）

3. **多用户共享成本**
   - 一个服务器可支持多个团队使用
   - 按使用量分摊费用

通过以上方案，您就可以将MCP服务器从localhost部署到公网，让同事们通过NPM包轻松使用了！