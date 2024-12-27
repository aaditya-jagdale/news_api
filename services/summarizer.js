// summarizer.js
import { HfInference } from '@huggingface/inference';
import config from '../config.json' assert { type: 'json' };

const hf = new HfInference(config.hf_api_key);

export async function newsBodySummarizer(text) {
    try {
        const result = await hf.summarization({
            model: 'facebook/bart-large-cnn',
            inputs: text,
          
        });
        return result.summary_text;
    } catch (error) {
        throw new Error(`Summarization failed: ${error.message}`);
    }
}

export async function newsTitleSummarizer(text) {
    try {
        const result = await hf.summarization({
            model: 'google/pegasus-xsum',
            inputs: text,
            temperature: 1,
            
        });
        return result.summary_text;
    } catch (error) {
        throw new Error(`Summarization failed: ${error.message}`);
    }
}
