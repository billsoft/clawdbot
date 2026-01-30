
import os
from openai import OpenAI

# 配置参数
# 使用用户提供的 API Key (注: 用户输入的是 Key ID，但根据 REST API 示例，实际 Key 应该是 0ab6c1d5-5d4f-4f58-81b7-626446b0b880，我们将尝试使用这个 UUID 格式的 key，如果失败再提示用户)
# 根据用户提供的 curl 命令，Authorization 后面跟的是 Bearer 0ab6c1d5-5d4f-4f58-81b7-626446b0b880
# 而 api-key-20260130115305 看起来像是一个 Key 的名称或 ID。
# 我们优先使用 curl 示例中暴露的 UUID Key。
API_KEY = "0ab6c1d5-5d4f-4f58-81b7-626446b0b880" 
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL_NAME = "doubao-seed-1-8-251228"

print(f"Testing Doubao API via OpenAI SDK...")
print(f"Base URL: {BASE_URL}")
print(f"Model: {MODEL_NAME}")

client = OpenAI(
    base_url=BASE_URL,
    api_key=API_KEY,
)

try:
    # 简单的文本测试，不涉及图片，以验证基础连通性
    # 注意：根据用户提供的文档，Doubao 使用的是 client.responses.create 而不是 chat.completions.create
    # 但 OpenAI SDK 标准是 chat.completions。如果 server 兼容 OpenAI，应该支持 chat.completions。
    # 用户提供的 Python 代码使用的是 client.responses.create，这表明它可能使用了自定义的扩展或者是 volcanengine 专用的路径。
    # 但同时代码里又 import 了 OpenAI。
    # 让我们先尝试标准的 chat.completions.create，因为这是 Moltbot 集成的基础。
    # 如果失败，我们再看是否需要特殊的 endpoint。
    # 修正：用户提供的代码 client.responses.create 是针对 Response API 的，Moltbot 需要的是 Chat Completion API。
    # 通常方舟平台也支持 /v3/chat/completions。我们先试标准的。
    
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "user", "content": "你好，请介绍一下你自己。"}
        ],
        max_tokens=100
    )

    print("\n✅ API Call Successful!")
    print("-" * 40)
    print(response.choices[0].message.content)
    print("-" * 40)

except Exception as e:
    print(f"\n❌ Standard Chat Completion Failed: {str(e)}")
    print("Trying alternative 'responses' endpoint style (if applicable)...")
    # 如果标准接口失败，可能需要使用 volcenginesdkarkruntime 或者特定的路径
