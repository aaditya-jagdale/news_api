import { HfInference } from '@huggingface/inference';
import config from '../../../config.json' assert { type: 'json' };

const MODELS = {
  TITLE: 'google/pegasus-xsum',
  BODY: 'facebook/bart-large-cnn'
};

export class ContentSummarizer {
  #hf;
  
  constructor() {
    if (!config?.hf_api_key) {
      throw new Error('HuggingFace API key is required');
    }
    this.#hf = new HfInference(config.hf_api_key);
  }

  async #summarize(content, model) {
    try {
      if (!content?.trim()) {
        throw new Error('Content is required');
      }
      if (!Object.values(MODELS).includes(model)) {
        throw new Error('Invalid model');
      }

      const { summary_text } = await this.#hf.summarization({
        model,
        parameters: { max_length: 120, min_length: 50 },
        inputs: content.slice(0, 1000), // Prevent excessive tokens
        ...(model === MODELS.TITLE && { temperature: 1 })
      });

      return summary_text || '';
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error instanceof Error ? error : new Error('Summarization failed');
    }
  }

  summarizeTitle = async (content) => this.#summarize(content, MODELS.TITLE);
  summarizeBody = async (content) => this.#summarize(content, MODELS.BODY);
}

export default ContentSummarizer;