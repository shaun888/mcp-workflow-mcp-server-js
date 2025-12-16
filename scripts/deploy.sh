#!/bin/bash

# FOP MCP服务器一键部署脚本
# 用于将localhost服务部署到云服务器

set -e

echo "🚀 FOP MCP服务器一键部署脚本"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
SERVER_IP=""
SERVER_USER="root"
SERVER_PORT="22"
DEPLOY_PATH="/opt/fop-mcp"
JAR_NAME="mcp-api-1.0.jar"

# 函数：打印彩色消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 函数：检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 函数：获取用户输入
get_server_info() {
    echo ""
    print_info "请输入云服务器信息："
    
    while [[ -z "$SERVER_IP" ]]; do
        read -p "服务器IP地址: " SERVER_IP
        if [[ -z "$SERVER_IP" ]]; then
            print_warning "IP地址不能为空"
        fi
    done
    
    read -p "SSH用户名 (默认: root): " input_user
    if [[ -n "$input_user" ]]; then
        SERVER_USER="$input_user"
    fi
    
    read -p "SSH端口 (默认: 22): " input_port
    if [[ -n "$input_port" ]]; then
        SERVER_PORT="$input_port"
    fi
    
    print_success "服务器信息: $SERVER_USER@$SERVER_IP:$SERVER_PORT"
}

# 函数：检查服务器连接
check_server_connection() {
    print_info "检查服务器连接..."
    
    if ssh -o ConnectTimeout=10 -p $SERVER_PORT $SERVER_USER@$SERVER_IP "echo 'Connection test'" &> /dev/null; then
        print_success "服务器连接正常"
    else
        print_error "无法连接到服务器，请检查IP、用户名、密码或SSH密钥"
        exit 1
    fi
}

# 函数：本地构建
local_build() {
    print_info "开始本地构建..."
    
    # 检查Maven
    check_command "mvn"
    
    # 清理并构建
    print_info "执行 Maven 构建..."
    mvn clean package -DskipTests
    
    if [[ -f "target/$JAR_NAME" ]]; then
        print_success "本地构建完成"
    else
        print_error "构建失败，未找到 target/$JAR_NAME"
        exit 1
    fi
}

# 函数：服务器环境准备
prepare_server_environment() {
    print_info "准备服务器环境..."
    
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOF'
        # 更新系统
        echo "更新系统包..."
        sudo apt update -y
        
        # 安装Java 8
        if ! command -v java &> /dev/null; then
            echo "安装 Java 8..."
            sudo apt install -y openjdk-8-jdk
        else
            echo "Java 已安装"
        fi
        
        # 创建部署目录
        sudo mkdir -p /opt/fop-mcp
        sudo chown $USER:$USER /opt/fop-mcp
        
        # 安装进程管理工具
        if ! command -v supervisord &> /dev/null; then
            echo "安装 Supervisor..."
            sudo apt install -y supervisor
        fi
        
        echo "服务器环境准备完成"
EOF
    
    print_success "服务器环境准备完成"
}

# 函数：上传文件
upload_files() {
    print_info "上传应用文件..."
    
    # 上传JAR文件
    scp -P $SERVER_PORT target/$JAR_NAME $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/
    
    # 上传配置文件
    if [[ -f "src/main/resources/application.properties" ]]; then
        scp -P $SERVER_PORT src/main/resources/application.properties $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/
    fi
    
    print_success "文件上传完成"
}

# 函数：配置系统服务
configure_service() {
    print_info "配置系统服务..."
    
    # 创建Supervisor配置
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << EOF
        # 创建Supervisor配置文件
        sudo tee /etc/supervisor/conf.d/fop-mcp.conf > /dev/null << 'SUPERVISOR_EOF'
[program:fop-mcp]
command=java -Xmx512m -jar $DEPLOY_PATH/$JAR_NAME
directory=$DEPLOY_PATH
autostart=true
autorestart=true
stderr_logfile=/var/log/fop-mcp.err.log
stdout_logfile=/var/log/fop-mcp.out.log
user=$SERVER_USER
environment=SERVER_PORT="8080"
SUPERVISOR_EOF

        # 重新加载Supervisor配置
        sudo supervisorctl reread
        sudo supervisorctl update
        
        echo "系统服务配置完成"
EOF
    
    print_success "系统服务配置完成"
}

# 函数：启动服务
start_service() {
    print_info "启动FOP MCP服务..."
    
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOF'
        # 启动服务
        sudo supervisorctl start fop-mcp
        
        # 等待服务启动
        sleep 10
        
        # 检查服务状态
        if curl -f http://localhost:8080/health &> /dev/null; then
            echo "✅ 服务启动成功"
        else
            echo "❌ 服务启动失败，检查日志："
            sudo supervisorctl status fop-mcp
            tail -20 /var/log/fop-mcp.err.log
            exit 1
        fi
EOF
    
    print_success "FOP MCP服务启动成功"
}

# 函数：配置防火墙
configure_firewall() {
    print_info "配置防火墙..."
    
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOF'
        # 检查并配置UFW防火墙
        if command -v ufw &> /dev/null; then
            sudo ufw allow 8080/tcp
            echo "UFW防火墙已配置"
        fi
        
        # 检查并配置iptables
        if command -v iptables &> /dev/null; then
            sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
            # 保存iptables规则（Ubuntu/Debian）
            if command -v iptables-save &> /dev/null; then
                sudo iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
            fi
            echo "iptables防火墙已配置"
        fi
EOF
    
    print_success "防火墙配置完成"
}

# 函数：更新NPM包配置
update_npm_config() {
    print_info "更新NPM包配置..."
    
    # 备份原配置
    cp package.json package.json.backup
    
    # 更新package.json中的服务器地址
    if command -v jq &> /dev/null; then
        # 使用jq更新JSON
        jq --arg url "http://$SERVER_IP:8080" '.config.serverUrl = $url' package.json > package.json.tmp
        mv package.json.tmp package.json
    else
        # 使用sed更新（简单替换）
        sed -i.bak "s|\"serverUrl\": \".*\"|\"serverUrl\": \"http://$SERVER_IP:8080\"|g" package.json
    fi
    
    # 更新版本号
    npm version patch --no-git-tag-version
    
    print_success "NPM包配置已更新"
    print_info "新的服务器地址: http://$SERVER_IP:8080"
}

# 函数：测试部署
test_deployment() {
    print_info "测试部署结果..."
    
    # 测试HTTP接口
    if curl -f -m 10 "http://$SERVER_IP:8080/health" &> /dev/null; then
        print_success "HTTP接口测试通过"
    else
        print_warning "HTTP接口测试失败，可能是防火墙或安全组配置问题"
        print_info "请检查云服务器安全组是否开放8080端口"
    fi
    
    # 测试MCP接口
    if curl -f -m 10 "http://$SERVER_IP:8080/mcp/fop-workflow" &> /dev/null; then
        print_success "MCP接口测试通过"
    else
        print_warning "MCP接口测试失败"
    fi
    
    echo ""
    print_success "🎉 部署完成！"
    echo ""
    echo "📋 部署信息："
    echo "   服务器地址: http://$SERVER_IP:8080"
    echo "   MCP接口: http://$SERVER_IP:8080/mcp/fop-workflow"
    echo "   健康检查: http://$SERVER_IP:8080/health"
    echo ""
    echo "📝 后续步骤："
    echo "   1. 发布NPM包: npm publish --registry=http://registry.m.jd.com"
    echo "   2. 用户配置JoyCode:"
    echo '   {
     "fop-workflow-mcp": {
       "url": "http://'$SERVER_IP':8080/mcp/fop-workflow",
       "autoApprove": ["getFopWorkflowGuide"],
       "timeout": 30000
     }
   }'
}

# 函数：显示帮助
show_help() {
    echo "FOP MCP服务器一键部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -i IP          指定服务器IP地址"
    echo "  -u USER        指定SSH用户名 (默认: root)"
    echo "  -p PORT        指定SSH端口 (默认: 22)"
    echo ""
    echo "示例:"
    echo "  $0                           # 交互式部署"
    echo "  $0 -i 123.45.67.89          # 指定IP部署"
    echo "  $0 -i 123.45.67.89 -u ubuntu -p 2222  # 完整参数部署"
}

# 主函数
main() {
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -i)
                SERVER_IP="$2"
                shift 2
                ;;
            -u)
                SERVER_USER="$2"
                shift 2
                ;;
            -p)
                SERVER_PORT="$2"
                shift 2
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查必要工具
    check_command "ssh"
    check_command "scp"
    check_command "curl"
    
    # 如果没有指定IP，则交互式获取
    if [[ -z "$SERVER_IP" ]]; then
        get_server_info
    fi
    
    # 确认部署
    echo ""
    print_warning "即将部署到服务器: $SERVER_USER@$SERVER_IP:$SERVER_PORT"
    read -p "确认继续? (y/N): " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        print_info "部署已取消"
        exit 0
    fi
    
    # 执行部署流程
    echo ""
    print_info "开始部署流程..."
    
    check_server_connection
    local_build
    prepare_server_environment
    upload_files
    configure_service
    start_service
    configure_firewall
    update_npm_config
    test_deployment
    
    print_success "🚀 部署完成！您的MCP服务器现在可以通过公网访问了！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi