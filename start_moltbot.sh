#!/bin/bash
set -e

# ==========================================
# Moltbot (Clawdbot) 一键启动脚本
# ==========================================

# 1. 尝试激活 Python 环境 (优先 Conda, 其次 venv)
if command -v conda &> /dev/null; then
    # 尝试找到 conda 初始化脚本
    CONDA_BASE=$(conda info --base)
    source "$CONDA_BASE/etc/profile.d/conda.sh"
    
    if conda env list | grep -q "moltbot-skills"; then
        echo "✅ 激活 Conda 环境: moltbot-skills"
        conda activate moltbot-skills
    else
        echo "⚠️ Conda 环境 'moltbot-skills' 未找到，尝试使用本地 .venv"
    fi
elif [ -d ".venv" ]; then
    echo "✅ 激活本地虚拟环境: .venv"
    source .venv/bin/activate
else
    echo "ℹ️ 未检测到专用 Python 环境，将使用系统默认 Python (如需运行 Python 技能请检查环境)"
fi

# 2. 获取或设置 Gateway Token
TOKEN=$(pnpm moltbot config get gateway.auth.token 2>/dev/null || echo "")
if [ -z "$TOKEN" ]; then
    echo "⚠️ 未检测到 Gateway Token，正在为您生成..."
    TOKEN="clawdbot-secret-$(openssl rand -hex 4)"
    pnpm moltbot config set gateway.auth.token "$TOKEN"
    echo "✅ Token 已设置为: $TOKEN"
else
    # 清理输出中的多余字符 (如果 config get 返回 JSON 或其它格式)
    TOKEN=$(echo "$TOKEN" | tr -d '"' | tr -d '[:space:]')
fi

# 3. 打印访问地址
PORT=18789
URL="http://localhost:$PORT/?token=$TOKEN"

echo ""
echo "=================================================="
echo "🚀 Moltbot Gateway 正在启动..."
echo "👉 Web 管理界面 (已包含 Token):"
echo "   $URL"
echo "=================================================="
echo ""

# 4. 启动网关
# 使用 exec 替换当前 shell，确保信号传递
exec pnpm moltbot gateway --port $PORT
