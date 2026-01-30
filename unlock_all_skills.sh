#!/bin/bash
set -e

echo "🚀 开始解锁 Moltbot 所有技能..."

# 1. 检查并安装 Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew 已安装"
fi

# 2. 安装常用技能依赖
echo "📦 安装技能依赖..."
brew install ffmpeg imagemagick jq gh yt-dlp poppler sevenzip

# 3. 检查 Chrome 扩展
echo "🌐 检查浏览器扩展..."
if [ -d "$HOME/.moltbot/browser-extension" ]; then
    echo "✅ 浏览器扩展目录存在: $HOME/.moltbot/browser-extension"
    echo "👉 请确保在 Chrome 中加载此已解压的扩展程序。"
else
    echo "❌ 未找到浏览器扩展，正在安装..."
    pnpm moltbot browser extension install
    echo "👉 扩展已安装到 $HOME/.moltbot/browser-extension，请在 Chrome 中加载。"
fi

# 4. 提醒 API Keys
echo ""
echo "🎉 基础依赖已安装！为了完全解锁所有能力，请配置以下 API Key："
echo ""
echo "1. Brave Search (搜索能力):"
echo "   pnpm moltbot config set tools.web.search.apiKey \"YOUR_KEY\""
echo ""
echo "2. Perplexity (增强问答):"
echo "   pnpm moltbot config set tools.web.search.perplexity.apiKey \"YOUR_KEY\""
echo ""
echo "3. Firecrawl (网页抓取):"
echo "   pnpm moltbot config set tools.web.fetch.firecrawl.apiKey \"YOUR_KEY\""
echo ""
echo "👉 配置完成后，请重启网关以生效。"
