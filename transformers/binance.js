import { BaseTransformer } from './base.js';

export class BinanceTransformer extends BaseTransformer {
    getSourceInfo() {
        return {
            source_name: 'Binance News',
            source_url: 'binance.com'
        };
    }

    async transformData(article) {
        const image = article.images?.[0] || article.authorAvatar || null;
        
        return {
            title: article.title,
            description: article.subTitle,
            content: article.subTitle,
            url: article.webLink,
            image: image,
        };
    }
}
