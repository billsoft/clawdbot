# Moltbot 中文使用指南

欢迎使用 Moltbot (原 Clawdbot)！这是一个强大的 AI 代理网关系统，支持多渠道 (WhatsApp, Telegram 等) 和多模型 (Ollama, OpenAI 等)。

## 1. 环境准备

在开始之前，请确保您的环境满足以下要求：

*   **Node.js**: v22+ (推荐 v22.12.0 或更高)
*   **包管理器**: pnpm (推荐 v10+)
*   **Python (可选)**: 如果需要运行 Python 编写的技能 (Skills)，建议使用 Conda 管理环境。

### 安装依赖

如果您尚未安装 `pnpm`，请先全局安装：
```bash
npm install -g pnpm
```

在项目根目录下安装项目依赖：
```bash
pnpm install
```

### 编译项目

Moltbot 是 TypeScript 项目，运行前需要编译：
```bash
pnpm build
```

---

## 2. 快速开始

### 初始化向导 (推荐)

首次使用，建议运行交互式向导来配置网关、工作区和认证信息：

```bash
pnpm moltbot onboard
```
*   **Flow**: 选择 `quickstart` 可以快速完成配置。
*   此过程会生成配置文件（通常在 `~/.clawdbot/` 下）。

### 启动网关

配置完成后，启动网关服务：

```bash
pnpm moltbot gateway
```
网关启动后，您可以通过 Web 界面或命令行与 AI 进行交互。

### 查看状态

检查网关和各渠道的连接状态：
```bash
pnpm moltbot status
```

---

## 3. 功能详解与配置

### 3.1 本地大模型 (Ollama) 配置

Moltbot 对 Ollama 有极佳的支持，可以自动发现本地模型。

1.  **安装并运行 Ollama**:
    确保 Ollama 已安装并在后台运行 (`ollama serve`)。
    ```bash
    # 拉取支持工具调用的模型 (推荐)
    ollama pull llama3.1
    # 或者
    ollama pull qwen2.5-coder:32b
    ```

2.  **启用 Ollama**:
    设置环境变量即可启用自动发现功能（无需复杂的配置文件）：
    ```bash
    export OLLAMA_API_KEY="ollama-local"
    ```
    或者使用 CLI 配置：
    ```bash
    pnpm moltbot config set models.providers.ollama.apiKey "ollama-local"
    ```

3.  **选择模型**:
    在配置文件中 (或通过 `config` 命令) 设置默认模型：
    ```bash
    pnpm moltbot config set agents.defaults.model.primary "ollama/llama3.1"
    ```

### 3.2 渠道配置 (Channels)

Moltbot 支持多种消息渠道。

*   **WhatsApp**:
    ```bash
    pnpm moltbot channels login --channel whatsapp
    ```
    这将显示二维码，请使用手机 WhatsApp 扫描登录。

*   **Telegram**:
    需提供 Bot Token。
    ```bash
    pnpm moltbot config set channels.telegram.token "YOUR_BOT_TOKEN"
    ```

更多渠道配置请参考 `docs/channels/` 目录下的文档。

### 3.3 技能 (Skills)

技能扩展了 AI 的能力。

*   **列出技能**:
    ```bash
    pnpm moltbot skills list
    ```

*   **Python 技能**:
    如果您启用了 Python 技能（如 `local-places`），请确保在运行网关前激活相应的 Conda 环境：
    ```bash
    conda activate moltbot-skills
    pnpm moltbot gateway
    ```

---

## 4. 常用命令速查

所有命令均通过 `pnpm moltbot` (或编译后的 `moltbot`) 执行。

| 命令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `gateway` | 启动网关服务 | `pnpm moltbot gateway` |
| `status` | 查看系统和渠道状态 | `pnpm moltbot status` |
| `agent` | 直接与代理对话 (CLI模式) | `pnpm moltbot agent --message "你好"` |
| `message` | 发送消息到指定渠道 | `pnpm moltbot message send --target +12345 --message "Hi"` |
| `config` | 查看或修改配置 | `pnpm moltbot config get` |
| `doctor` | 系统健康检查与修复 | `pnpm moltbot doctor` |
| `logs` | 查看网关日志 | `pnpm moltbot logs` |
| `update` | 更新 CLI | `pnpm moltbot update` |

---

## 5. 故障排查

如果您遇到问题，请首先运行医生程序：

```bash
pnpm moltbot doctor
```
它会自动检测常见问题（如端口冲突、配置错误、依赖缺失）并尝试修复。

---

## 6. 开发模式

如果您需要修改代码或调试：

```bash
pnpm dev
```
此命令会以开发模式启动，支持热重载和独立的开发配置环境 (`~/.clawdbot-dev`)。

---

*如有更多疑问，请查阅 `docs/` 目录下的详细文档。*
