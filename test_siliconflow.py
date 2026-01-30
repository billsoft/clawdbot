import os
import httpx
import asyncio

# 配置参数
API_KEY = "sk-yzkoxvntccgqjuedobkcjavgzrsrmdjhteawuozepedbswkg"
BASE_URL = "https://api.siliconflow.cn/v1"
MODEL_NAME = "Pro/MiniMaxAI/MiniMax-M2.1"

async def test_siliconflow():
    print(f"Testing SiliconFlow API with model: {MODEL_NAME}")
    print(f"Base URL: {BASE_URL}")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": "你好，请介绍一下你自己。"}
        ],
        "stream": False,
        "max_tokens": 512,
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                print("\n✅ API Call Successful!")
                print("-" * 40)
                print(f"Response:\n{content}")
                print("-" * 40)
            else:
                print(f"\n❌ API Call Failed with status code: {response.status_code}")
                print(f"Error details: {response.text}")
                
    except Exception as e:
        print(f"\n❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_siliconflow())
