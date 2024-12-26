// src/transformers/reddit.js
import { BaseTransformer } from './base.js';
import { ContentExtractor } from '../services/contentExtractor.js';

export class RedditTransformer extends BaseTransformer {
    constructor(geminiModel) {
        super();
        this.geminiModel = geminiModel;
    }

    getSourceInfo() {
        return {
            source_name: 'Reddit - r/CryptoCurrency',
            source_url: 'https://www.reddit.com/r/CryptoCurrency'
        };
    }

    extractHostname(url) {
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace(/^www\./, '');
        } catch {
            return null;
        }
    }

    async generateArticleWithAI(title, content, url) {
        try {
            const prompt = `Write a 60-word crypto news article about this content. Use journalistic AP style, focusing on key developments and market impact:

Title: ${title}
Content: ${content}
Source: ${url}

Format response as JSON:
{
    "title": "headline focusing on market/industry impact",
    "subtitle": "one-line summary of significance",
    "content": "60-word AP style crypto news article(must not exceed 70 words)",
    "category": "primary topic"
}`;

            const result = await this.geminiModel.generateContent(prompt);
            const text = result.response.text();
            console.log('AI Response:', text); // Debug log
            
            try {
                const parsed = JSON.parse(text.replace(/```json\n|\n```/g, '').trim());
                return parsed;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw parseError;
            }
        } catch (error) {
            console.error('AI Generation Error:', error);
            throw error;
        }
    }
    getFallbackTransformation(data, content, sourceUrl) {
        return {
            title: data.title,
            description: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
            content: content,
            url: sourceUrl,
            image: data.thumbnail !== 'self' ? data.thumbnail : null,
            published_at: new Date(data.created_utc * 1000).toISOString(),
            source_name: this.extractHostname(sourceUrl) || 'reddit.com',
            source_url: sourceUrl
        };
    }

    async transformData(posts) {
        return await Promise.all(posts.map(async post => {
            const { data } = post;
            let sourceUrl = data.url;
            let content = data.selftext;
            
            if (data.url && !data.url.includes('reddit.com')) {
                sourceUrl = data.url;
                const extractedContent = await ContentExtractor.extract(sourceUrl);
                if (extractedContent) {
                    content = extractedContent;
                }
            }
    
            try {
                const articleData = await this.generateArticleWithAI(data.title, content, sourceUrl);
                console.log(`${this.extractHostname(sourceUrl) || 'Reddit'} news summarized`);
                
                return {
                    title: articleData.title,
                    description: articleData.subtitle,
                    content: articleData.subtitle,
                    url: sourceUrl,
                    image: data.thumbnail !== 'self' ? data.thumbnail : null
                };
            } catch (error) {
                return {
                    title: data.title,
                    description: content.substring(0, 200),
                    content: content.substring(0, 200),
                    url: sourceUrl,
                    image: data.thumbnail !== 'self' ? data.thumbnail : null
                };
            }
        }));
    }
}