#!/bin/bash

APP_NAME="xiaobai-site"
APP_DIR="/var/www/xiaobai-site"
GIT_REPO="https://github.com/your-username/xiaobai-site.git"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}     小白网站 - 部署脚本${NC}"
echo -e "${YELLOW}===========================================${NC}"

install_dependencies() {
    echo -e "${YELLOW}[1/6] 安装系统依赖...${NC}"
    
    sudo apt-get update -y
    sudo apt-get install -y nginx mysql-server git curl

    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}安装 Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}安装 PM2...${NC}"
        sudo npm install -g pm2
    fi

    echo -e "${GREEN}[1/6] 依赖安装完成${NC}"
}

setup_database() {
    echo -e "${YELLOW}[2/6] 配置数据库...${NC}"
    
    read -p "请输入数据库密码: " DB_PASSWORD
    
    mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS xiaobai_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'xiaobai_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON xiaobai_site.* TO 'xiaobai_user'@'localhost';
FLUSH PRIVILEGES;
EOF

    echo -e "${GREEN}[2/6] 数据库配置完成${NC}"
}

clone_repo() {
    echo -e "${YELLOW}[3/6] 克隆代码仓库...${NC}"
    
    if [ -d "$APP_DIR" ]; then
        echo -e "${YELLOW}目录已存在，更新代码...${NC}"
        cd "$APP_DIR"
        git pull origin main
    else
        sudo mkdir -p "$APP_DIR"
        sudo chown $USER:$USER "$APP_DIR"
        git clone "$GIT_REPO" "$APP_DIR"
        cd "$APP_DIR"
    fi

    echo -e "${GREEN}[3/6] 代码克隆完成${NC}"
}

install_node_deps() {
    echo -e "${YELLOW}[4/6] 安装 Node.js 依赖...${NC}"
    
    cd "$APP_DIR/server"
    npm install --production

    cd "$APP_DIR/client"
    npm install
    npm run build

    echo -e "${GREEN}[4/6] 依赖安装完成${NC}"
}

setup_env() {
    echo -e "${YELLOW}[5/6] 配置环境变量...${NC}"
    
    cd "$APP_DIR/server"
    
    read -p "请输入数据库密码: " DB_PASSWORD
    read -p "请输入 JWT 密钥: " JWT_SECRET
    read -p "请输入域名 (如: your-domain.com): " DOMAIN

    cat > .env <<EOF
PORT=3000
DB_HOST=localhost
DB_USER=xiaobai_user
DB_PASSWORD=$DB_PASSWORD
DB_NAME=xiaobai_site
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
USE_LLM=false
LLM_API_KEY=
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-3.5-turbo
EOF

    echo -e "${GREEN}[5/6] 环境变量配置完成${NC}"
}

setup_nginx() {
    echo -e "${YELLOW}[6/6] 配置 Nginx...${NC}"
    
    read -p "请输入域名 (如: your-domain.com): " DOMAIN

    sudo mkdir -p /var/log/nginx

    sudo cat > /etc/nginx/sites-available/xiaobai-site <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/client/dist;
    index index.html;

    client_max_body_size 50M;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 86400s;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    error_log /var/log/nginx/xiaobai-site.error.log;
    access_log /var/log/nginx/xiaobai-site.access.log;
}
EOF

    sudo ln -sf /etc/nginx/sites-available/xiaobai-site /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx

    echo -e "${GREEN}[6/6] Nginx 配置完成${NC}"
}

start_app() {
    echo -e "${YELLOW}[7/7] 启动应用...${NC}"
    
    cd "$APP_DIR"
    mkdir -p logs
    
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup

    echo -e "${GREEN}[7/7] 应用启动完成${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${GREEN}部署成功！${NC}"
    echo -e "${YELLOW}网站地址: http://your-domain.com${NC}"
    echo -e "${YELLOW}PM2 管理命令:${NC}"
    echo -e "  pm2 list          - 查看进程状态"
    echo -e "  pm2 logs          - 查看日志"
    echo -e "  pm2 restart all   - 重启应用"
    echo -e "  pm2 stop all      - 停止应用"
    echo -e "${YELLOW}===========================================${NC}"
}

case "$1" in
    all)
        install_dependencies
        setup_database
        clone_repo
        install_node_deps
        setup_env
        setup_nginx
        start_app
        ;;
    dependencies)
        install_dependencies
        ;;
    database)
        setup_database
        ;;
    code)
        clone_repo
        ;;
    build)
        install_node_deps
        ;;
    env)
        setup_env
        ;;
    nginx)
        setup_nginx
        ;;
    start)
        start_app
        ;;
    *)
        echo -e "${RED}用法: $0 {all|dependencies|database|code|build|env|nginx|start}${NC}"
        echo -e "${YELLOW}示例:${NC}"
        echo -e "  $0 all          - 执行完整部署"
        echo -e "  $0 dependencies - 仅安装依赖"
        echo -e "  $0 database     - 仅配置数据库"
        echo -e "  $0 code         - 仅更新代码"
        echo -e "  $0 build        - 仅构建项目"
        echo -e "  $0 env          - 仅配置环境变量"
        echo -e "  $0 nginx        - 仅配置 Nginx"
        echo -e "  $0 start        - 仅启动应用"
        ;;
esac