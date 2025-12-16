# MCP服务器部署完整指南

## 🎯 部署目标

将您的FOP工作流MCP服务器发布到公网，让其他人可以通过NPM包或Docker的方式使用。

## 📋 部署方案概览

### 方案一：云服务器 + NPM包（推荐）
```
您的代码 → 云服务器部署 → 公网IP访问 → NPM包封装 → 用户安装使用
```

### 方案二：Docker Hub + 云服务器
```
您的代码 → Docker镜像 → Docker Hub → 用户拉取部署
```

## 🚀 方案一：云服务器部署（详细步骤）

### 第一步：准备云服务器

#### 1.1 购买云服务器
- **阿里云ECS**、**腾讯云CVM** 或 **华为云ECS**
- 配置：1核2G内存，1M带宽即可
- 操作系统：Ubuntu 20.04 LTS
- 开放端口：8080（在安全组中配置）

#### 1.2 服务器基础配置
```bash
# 连接服务器后执行
sudo apt update
sudo apt install -y openjdk-8-jdk maven git

# 验证Java环境
java -version
mvn -version
```

### 第二步：部署您的应用

#### 2.1 上传代码到服务器
```bash
# 方式1：Git克隆（推荐）
git clone <您的代码仓库地址>
cd <项目目录>

# 方式2：直接上传
# 使用scp或FileZilla上传项目文件
```

#### 2.2 构建和启动应用
```bash
# 构建项目
mvn clean package -DskipTests

# 启动应用（后台运行）
nohup java -jar target/fop-workflow-mcp-1.0.0.jar > app.log 2>&1 &

# 检查应用状态
curl http://localhost:8080/health
```

#### 2.3 配置域名（可选但推荐）
```bash
# 如果有域名，配置Nginx反向代理
sudo apt install nginx

# 编辑Nginx配置
sudo nano /etc/nginx/sites-available/fop-mcp
```

Nginx配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 第三步：发布NPM包

#### 3.1 修改NPM包配置
更新 `package.json` 中的服务器地址：

```json
{
  "name": "@jd/fop-workflow-mcp",
  "version": "1.0.0",
  "bin": {
    "fop-workflow-mcp": "./bin/fop-workflow-mcp.js"
  },
  "config": {
    "serverUrl": "http://您的服务器IP:8080"  // 或域名
  }
}
```

#### 3.2 更新启动脚本
修改 `bin/fop-workflow-mcp.js`：

```javascript
const DEFAULT_SERVER_URL = process.env.FOP_MCP_SERVER_URL || 'http://您的服务器IP:8080';
```

#### 3.3 发布到NPM仓库
```bash
# 执行发布脚本
./scripts/publish.sh

# 或手动发布
npm publish --registry=http://registry.m.jd.com
```

### 第四步：用户使用方式

#### 4.1 NPM包安装使用
```bash
# 用户安装
npm install --registry=http://registry.m.jd.com @jd/fop-workflow-mcp

# 启动MCP服务器代理
npx fop-workflow-mcp start

# 生成配置文件
npx fop-workflow-mcp config
```

#### 4.2 JoyCode配置
用户在JoyCode中添加配置：
```json
{
  "fop-workflow-mcp": {
    "url": "http://您的服务器IP:8080/mcp/fop-workflow",
    "autoApprove": ["getFopWorkflowGuide", "getPrdAnalysisRules"],
    "timeout": 30000,
    "description": "FOP工作流规范指导服务器"
  }
}
```

## 🐳 方案二：Docker部署

### 第一步：构建并推送Docker镜像

#### 1.1 构建镜像
```bash
# 构建镜像
docker build -t fop-workflow-mcp:latest .

# 标记镜像（推送到Docker Hub）
docker tag fop-workflow-mcp:latest your-username/fop-workflow-mcp:latest
```

#### 1.2 推送到Docker Hub
```bash
# 登录Docker Hub
docker login

# 推送镜像
docker push your-username/fop-workflow-mcp:latest
```

### 第二步：用户使用Docker方式

#### 2.1 用户拉取并运行
```bash
# 拉取镜像
docker pull your-username/fop-workflow-mcp:latest

# 运行容器
docker run -d -p 8080:8080 --name fop-mcp your-username/fop-workflow-mcp:latest
```

#### 2.2 使用Docker Compose
用户创建 `docker-compose.yml`：
```yaml
version: '3.8'
services:
  fop-mcp:
    image: your-username/fop-workflow-mcp:latest
    ports:
      - "8080:8080"
    restart: unless-stopped
    environment:
      - JAVA_OPTS=-Xmx512m
```

## 🔧 实际部署示例

### 假设您的服务器IP是 `123.45.67.89`

#### 1. 服务器部署完成后，MCP服务运行在：
```
http://123.45.67.89:8080/mcp/fop-workflow
```

#### 2. 更新配置文件示例：

**examples/joycode-mcp-config.json**：
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
    "description": "FOP工作流规范指导服务器 - 云端部署版本"
  }
}
```

#### 3. NPM包发布后，用户使用：
```bash
# 安装
npm install --registry=http://registry.m.jd.com @jd/fop-workflow-mcp

# 使用（NPM包会自动连接到您的云服务器）
npx fop-workflow-mcp start
```

## 📝 部署检查清单

### 服务器端检查
- [ ] 云服务器已购买并配置
- [ ] 安全组开放8080端口
- [ ] Java 8+ 环境已安装
- [ ] 应用成功启动并监听8080端口
- [ ] 健康检查接口可访问：`curl http://服务器IP:8080/health`
- [ ] MCP接口可访问：`curl http://服务器IP:8080/mcp/fop-workflow`

### NPM包发布检查
- [ ] package.json中服务器地址已更新
- [ ] 启动脚本中默认URL已修改
- [ ] NPM包成功发布到京东内部仓库
- [ ] 配置示例文件已更新实际服务器地址

### 用户使用检查
- [ ] 用户可以通过NPM安装包
- [ ] 用户可以生成正确的配置文件
- [ ] JoyCode可以成功连接到MCP服务器
- [ ] MCP工具调用正常工作

## 🚨 常见问题解决

### Q1: 用户无法连接到MCP服务器
**解决方案**：
- 检查服务器防火墙和安全组配置
- 确认应用正在运行：`ps aux | grep java`
- 检查端口监听：`netstat -tlnp | grep 8080`

### Q2: NPM包安装失败
**解决方案**：
- 确认发布到正确的NPM仓库
- 检查包名和版本号
- 验证用户的NPM配置

### Q3: MCP工具调用超时
**解决方案**：
- 增加超时时间配置
- 检查服务器网络延迟
- 优化MCP服务器响应速度

## 💡 最佳实践建议

1. **使用HTTPS**：配置SSL证书，提供安全的HTTPS访问
2. **监控告警**：配置服务器监控，及时发现问题
3. **备份策略**：定期备份应用数据和配置
4. **版本管理**：使用Git管理代码，NPM管理版本发布
5. **文档维护**：保持部署文档和用户指南的更新

## 📞 技术支持

如果在部署过程中遇到问题，可以：
1. 检查应用日志：`tail -f app.log`
2. 查看系统资源：`htop` 或 `free -h`
3. 测试网络连通性：`telnet 服务器IP 8080`

---

通过以上步骤，您的MCP服务器就可以成功发布到公网，供其他人使用了！