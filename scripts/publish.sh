#!/bin/bash

# FOP工作流MCP服务器发布脚本
# 支持NPM和Docker两种发布方式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_dependencies() {
    log_info "检查必要工具..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "NPM 未安装"
        exit 1
    fi
    
    if ! command -v mvn &> /dev/null; then
        log_error "Maven 未安装"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_warning "Docker 未安装，将跳过Docker发布"
        SKIP_DOCKER=true
    fi
    
    log_success "依赖检查完成"
}

# 版本管理
update_version() {
    local version_type=$1
    
    log_info "更新版本号..."
    
    # 更新package.json版本
    npm version $version_type --no-git-tag-version
    
    # 获取新版本号
    NEW_VERSION=$(node -p "require('./package.json').version")
    log_success "版本已更新至: $NEW_VERSION"
    
    # 更新pom.xml版本
    mvn versions:set -DnewVersion=$NEW_VERSION -DgenerateBackupPoms=false
    log_success "Maven版本已更新"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # Maven构建
    mvn clean package -DskipTests
    
    if [ $? -eq 0 ]; then
        log_success "Maven构建完成"
    else
        log_error "Maven构建失败"
        exit 1
    fi
    
    # NPM构建
    npm run build 2>/dev/null || true
    
    log_success "项目构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    
    # Maven测试
    mvn test
    
    if [ $? -eq 0 ]; then
        log_success "所有测试通过"
    else
        log_error "测试失败"
        exit 1
    fi
}

# 发布到NPM
publish_npm() {
    log_info "发布到NPM..."
    
    # 检查NPM登录状态
    if ! npm whoami --registry=http://registry.m.jd.com &> /dev/null; then
        log_error "请先登录NPM: npm login --registry=http://registry.m.jd.com"
        exit 1
    fi
    
    # 发布
    npm publish --registry=http://registry.m.jd.com
    
    if [ $? -eq 0 ]; then
        log_success "NPM发布成功"
    else
        log_error "NPM发布失败"
        exit 1
    fi
}

# 构建Docker镜像
build_docker() {
    if [ "$SKIP_DOCKER" = true ]; then
        log_warning "跳过Docker构建"
        return
    fi
    
    log_info "构建Docker镜像..."
    
    local image_name="fop-workflow-mcp:$NEW_VERSION"
    local latest_name="fop-workflow-mcp:latest"
    
    # 构建镜像
    docker build -t $image_name -t $latest_name .
    
    if [ $? -eq 0 ]; then
        log_success "Docker镜像构建完成: $image_name"
    else
        log_error "Docker镜像构建失败"
        exit 1
    fi
}

# 推送Docker镜像
push_docker() {
    if [ "$SKIP_DOCKER" = true ]; then
        log_warning "跳过Docker推送"
        return
    fi
    
    log_info "推送Docker镜像..."
    
    local registry=${DOCKER_REGISTRY:-"registry.m.jd.com"}
    local image_name="$registry/fop-workflow-mcp:$NEW_VERSION"
    local latest_name="$registry/fop-workflow-mcp:latest"
    
    # 标记镜像
    docker tag fop-workflow-mcp:$NEW_VERSION $image_name
    docker tag fop-workflow-mcp:latest $latest_name
    
    # 推送镜像
    docker push $image_name
    docker push $latest_name
    
    if [ $? -eq 0 ]; then
        log_success "Docker镜像推送完成"
    else
        log_error "Docker镜像推送失败"
        exit 1
    fi
}

# 生成发布说明
generate_release_notes() {
    log_info "生成发布说明..."
    
    local release_file="RELEASE_NOTES_$NEW_VERSION.md"
    
    cat > $release_file << EOF
# FOP工作流MCP服务器 v$NEW_VERSION 发布说明

## 📦 发布信息
- **版本号**: $NEW_VERSION
- **发布时间**: $(date '+%Y-%m-%d %H:%M:%S')
- **发布类型**: $(echo $1 | tr '[:lower:]' '[:upper:]')

## 🚀 安装方式

### NPM包安装
\`\`\`bash
npm install -g @jd/fop-workflow-mcp-server@$NEW_VERSION --registry=http://registry.m.jd.com
\`\`\`

### Docker镜像
\`\`\`bash
docker pull registry.m.jd.com/fop-workflow-mcp:$NEW_VERSION
\`\`\`

## 📋 更新内容
- 请在此处添加具体的更新内容

## 🔧 配置示例
\`\`\`json
{
  "fop-workflow-mcp": {
    "url": "http://localhost:8080/mcp/fop-workflow",
    "autoApprove": ["getFopWorkflowGuide"]
  }
}
\`\`\`

## 📖 文档链接
- [使用指南](README.md)
- [API文档](docs/api.md)
- [部署指南](docs/deployment.md)

---
*由 FOP团队 发布*
EOF

    log_success "发布说明已生成: $release_file"
}

# 清理临时文件
cleanup() {
    log_info "清理临时文件..."
    
    # 清理Maven临时文件
    mvn clean &> /dev/null || true
    
    # 清理Docker临时镜像
    if [ "$SKIP_DOCKER" != true ]; then
        docker image prune -f &> /dev/null || true
    fi
    
    log_success "清理完成"
}

# 主函数
main() {
    local version_type=${1:-patch}
    local skip_tests=${2:-false}
    
    echo "========================================"
    echo "  FOP工作流MCP服务器发布脚本"
    echo "========================================"
    
    # 检查参数
    if [[ ! "$version_type" =~ ^(major|minor|patch)$ ]]; then
        log_error "版本类型必须是: major, minor, patch"
        echo "使用方法: $0 [major|minor|patch] [skip-tests]"
        exit 1
    fi
    
    log_info "开始发布流程..."
    log_info "版本类型: $version_type"
    
    # 执行发布步骤
    check_dependencies
    update_version $version_type
    build_project
    
    if [ "$skip_tests" != "true" ]; then
        run_tests
    else
        log_warning "跳过测试"
    fi
    
    publish_npm
    build_docker
    
    # 询问是否推送Docker镜像
    if [ "$SKIP_DOCKER" != true ]; then
        echo -n "是否推送Docker镜像到远程仓库? [y/N]: "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            push_docker
        else
            log_info "跳过Docker镜像推送"
        fi
    fi
    
    generate_release_notes $version_type
    cleanup
    
    echo "========================================"
    log_success "发布完成! 版本: $NEW_VERSION"
    echo "========================================"
    
    # 显示后续步骤
    echo ""
    echo "📋 后续步骤:"
    echo "1. 检查NPM包: https://www.npmjs.com/package/@jd/fop-workflow-mcp-server"
    echo "2. 更新文档和示例"
    echo "3. 通知团队成员"
    echo "4. 创建Git标签: git tag v$NEW_VERSION && git push origin v$NEW_VERSION"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi