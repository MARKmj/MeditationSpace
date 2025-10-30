#!/bin/bash

echo "🧘‍♀️ 静心空间启动脚本"
echo "===================="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请确保在项目根目录运行此脚本"
    exit 1
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "📦 安装 pnpm..."
    npm install -g pnpm
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    pnpm install
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告：未找到 .env 文件"
    echo "📝 请复制 .env.example 为 .env 并配置环境变量"
    echo ""
    echo "必需配置："
    echo "- DATABASE_URL: MySQL数据库连接"
    echo "- JWT_SECRET: JWT密钥"
    echo "- VITE_APP_ID: Manus应用ID"
    echo ""
    echo "示例："
    echo "cp .env.example .env"
    echo "然后编辑 .env 文件"
    echo ""
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo "访问地址：http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo ""

# 检查是否需要初始化数据库
if [ -f ".env" ]; then
    echo "🗄️  初始化数据库..."
    pnpm db:push
fi

# 启动服务
pnpm dev