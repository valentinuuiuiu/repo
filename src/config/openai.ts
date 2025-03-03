import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true,
});

export const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
export const OPENAI_EMBEDDING_MODEL = import.meta.env.VITE_OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002';

export const getOpenAICompletion = async (
  messages: ChatCompletionMessageParam[],
  temperature: number = 0.7
): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      temperature,
    });

    const content = completion.choices[0].message.content;
    if (content === null || content === undefined) {
      throw new Error('OpenAI returned empty response');
    }

    return content;
  } catch (error) {
    console.error('Error in OpenAI completion:', error);
    throw error;
  }
};

export const getOpenAIEmbedding = async (text: string) => {
  try {
    const response = await openai.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error in OpenAI embedding:', error);
    throw error;
  }
};

export default openai;