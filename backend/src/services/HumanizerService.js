import GroqAdapter from '../adapters/GroqAdapter.js';

const groqAdapter = new GroqAdapter();

class HumanizerService {
  constructor() {
    this.adapter = groqAdapter;
  }

  async humanize(text, options = {}) {
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required and must be a string');
    }

    if (text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > 5000) {
      throw new Error('Text exceeds maximum length of 5000 characters');
    }

    const systemPrompt = `You are a human editor. Rewrite text naturally.
Keep the meaning EXACTLY the same. Do NOT add new information.
Avoid robotic phrases like "delve", "furthermore", "it is important to note".
Return ONLY the rewritten text, nothing else.`;

    const result = await this.adapter.complete(systemPrompt, text, options);
    return result;
  }

  getAvailableTones() {
    return ['casual', 'professional', 'conversational', 'academic'];
  }
}

export default new HumanizerService();
