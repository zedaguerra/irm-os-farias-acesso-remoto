import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const getRoleSpecificPrompt = (role: string, message: string) => {
  const prompts = {
    admin: `Como especialista em gestão de TI, responda profissionalmente: ${message}`,
    support: `Como técnico de suporte, explique detalhadamente: ${message}`,
    default: `Responda de forma clara e didática: ${message}`
  };
  return prompts[role as keyof typeof prompts] || prompts.default;
};

export const fetchAIResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post<DeepSeekResponse>(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error in DeepSeek API:', error);
    throw new Error('Failed to get AI response');
  }
};