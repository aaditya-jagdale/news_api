import { BaseTransformer } from './base.js';

export class ProductHuntTransformer extends BaseTransformer {
    constructor(geminiModel) {
        super();
        this.geminiModel = geminiModel;
    }

    getSourceInfo() {
        return {
            source_name: 'Product Hunt',
            source_url: 'producthunt.com'
        };
    }

    async transformData(product) {
        try {
            const articleData = await this.generateArticleWithAI(product);
            return {
                title: articleData.title,
                description: articleData.subtitle,
                content: articleData.content,
                url: product.url,
                image: product.thumbnail,
            };
        } catch (error) {
            return this.getFallbackTransformation(product);
        }
    }

    async generateArticleWithAI(product) {
        const prompt = `Write a 60-word tech news article about this product launch. Use journalistic AP style, focusing on impact and innovation:

Product: ${product.name}
Details: ${product.description}
Context: Launched on Product Hunt, garnering ${product.votes} votes

Format response as JSON:
{
    "title": "headline focusing on industry impact",
    "subtitle": "one-line summary of significance",
    "content": "60-word AP style tech news article(must not exceed 70 words)",
    "category": "primary topic"
}`;

        const result = await this.geminiModel.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text.replace(/```json\n|\n```/g, '').trim());
    }

    getFallbackTransformation(product) {
        return {
            title: `${product.name} Launches with Industry-First Features`,
            description: `New platform introduces innovative solutions in ${product.topics[0]}`,
            content: `In a significant development for the ${product.topics[0]} sector, ${product.name} launched today on Product Hunt, introducing ${product.tagline}. The platform has already attracted substantial attention from the tech community, securing ${product.votes} votes within hours of its debut.`,
            url: product.url,
            image: product.thumbnail,
        };
    }
}
