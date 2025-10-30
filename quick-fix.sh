#!/bin/bash

echo "🔧 静心空间快速修复"
echo "=================="

# 进入项目目录
cd "$(dirname "$0")"

# 创建开发环境配置文件
if [ ! -f ".env" ]; then
    echo "📝 创建开发环境配置文件..."
    cp .env.development .env
    echo "✅ 已创建 .env 文件"
else
    echo "ℹ️  .env 文件已存在，跳过创建"
fi

# 检查是否有必要的依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        echo "🔄 先安装 pnpm..."
        npm install -g pnpm
        pnpm install
    fi
else
    echo "✅ 依赖已安装"
fi

echo ""
echo "🚀 现在可以启动项目了："
echo "   pnpm dev"
echo ""
echo "📝 或者使用启动脚本："
echo "   ./start.sh"
echo ""
echo "🌐 应用将在 http://localhost:3000 启动"
echo ""
echo "💡 提示：如果仍有 OAuth 相关错误，这是正常的，"
echo "    应用会以游客模式运行，核心冥想功能仍然可用。"