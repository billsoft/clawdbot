
import { OpenAI } from "openai";

async function testMiniMax() {
  const baseURL = "https://api.siliconflow.cn/v1";
  const apiKey = "sk-yzkoxvntccgqjuedobkcjavgzrsrmdjhteawuozepedbswkg";
  const model = "Pro/MiniMaxAI/MiniMax-M2.1";

  console.log(`Testing MiniMax M2.1 via OpenAI SDK...`);
  console.log(`Base URL: ${baseURL}`);
  console.log(`Model: ${model}`);

  const openai = new OpenAI({
    baseURL,
    apiKey,
  });

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "user", content: "你好，请回复'API测试成功'。" }
      ],
      max_tokens: 100,
    });

    console.log("Response received:");
    console.log(response.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error calling API:", error);
  }
}

testMiniMax();
