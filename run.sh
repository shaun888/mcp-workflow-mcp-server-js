#!/usr/bin/env bash
set -e
echo "🚀 一键启动 FOP 智能工作流 MCP 服务器"
echo "1️⃣ 启动 Java 后端（Docker 方式，端口 8080）..."
docker run -d --rm --name fop-java-backend \
  -p 8080:8080 \
  -e JAVA_OPTS="-Xms256m -Xmx512m" \
  ghcr.io/jd-fop/fop-workflow-backend:latest

echo "⏳ 等待后端健康检查..."
until curl -s http://localhost:8080/api/health > /dev/null; do
  sleep 2
done
echo "✅ Java 后端已就绪"

echo "2️⃣ 启动 MCP 服务器（stdio 模式）..."
npx @jd/fop-workflow-mcp-server