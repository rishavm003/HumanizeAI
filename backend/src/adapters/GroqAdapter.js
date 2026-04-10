import Groq from 'groq-sdk';

class GroqAdapter {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  getName() {
    return 'groq-mistral';
  }

  async complete(systemPrompt, userText, options = {}) {
    const tone = options.tone || 'casual';

    const toneMap = {
      casual: 'Rewrite casually, use contractions, friendly tone.',
      professional: 'Rewrite formally, clear and structured.',
      conversational: 'Rewrite in a natural, engaging conversational style.',
      academic: 'Rewrite in a precise and formal academic tone.'
    };

    const toneInstruction = toneMap[tone] || toneMap.casual;

    const response = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a human editor. Rewrite text naturally.
Keep the meaning EXACTLY the same. Do NOT add new information.
Avoid robotic phrases like "delve", "furthermore", "it is important to note".
Return ONLY the rewritten text, nothing else.`
        },
        {
          role: 'user',
          content: `Style: ${toneInstruction}\n\nText:\n${userText}` 
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0].message.content.trim();
  }
}

export default GroqAdapter;
