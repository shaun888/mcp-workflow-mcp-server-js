#!/bin/bash

# JoyCode MCP服务器发布脚本

echo "🚀 开始发布JoyCode MCP服务器 v4.0.0..."

# 1. 检查npm登录状态
echo "📋 检查npm登录状态..."
npm whoami --registry=http://registry.m.jd.com
if [ $? -ne 0 ]; then
    echo "❌ 请先登录京东内部NPM仓库："
    echo "   npm login --registry=http://registry.m.jd.com"
    exit 1
fi

# 2. 更新版本号（已更新为4.0.0）
echo "📦 当前版本: v4.0.0"

# 3. 运行测试
echo "🧪 运行测试..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ 测试失败，请修复问题后再发布"
    exit 1
fi

# 4. 发布到NPM
echo "📤 发布到京东内部NPM仓库..."
npm publish --registry=http://registry.m.jd.com
if [ $? -ne 0 ]; then
    echo "❌ 发布失败"
    exit 1
fi

# 5. 验证发布
echo "✅ 发布成功！正在验证..."
echo "📊 查看包信息..."
npm view @jd/fop-workflow-mcp-server --registry=http://registry.m.jd.com

echo ""
echo "🎉 发布完成！"
echo "💡 现在可以测试一键安装："
echo "   npx -y --registry=http://registry.m.jd.com @jd/fop-workflow-mcp-server"
echo ""
echo "📚 查看DEPLOYMENT.md获取更多部署信息"