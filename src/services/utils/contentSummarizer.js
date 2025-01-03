import { HfInference } from '@huggingface/inference';
import config from '../../../config.json' assert { type: 'json' };

const MODELS = {
  TITLE: 'google/pegasus-xsum',
  BODY: 'facebook/bart-large-cnn'
};

export class ContentSummarizer {
  #hf;
  
  constructor() {
    this.#hf = new HfInference(config.hf_api_key);
  }

  async #summarize(content, model) {
    if (!content?.trim()) return '';
    
      const { summary_text } = await this.#hf.summarization({
        model,
        inputs: content,
        ...(model === MODELS.TITLE && { temperature: 1 })
      });
      return summary_text;
  }

  summarizeTitle = (content) => this.#summarize(content, MODELS.TITLE);
  summarizeBody = (content) => this.#summarize(content, MODELS.BODY);
}

export default ContentSummarizer;