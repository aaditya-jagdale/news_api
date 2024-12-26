// src/services/contentExtractor.js
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

export class ContentExtractor {
    static headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    static articleSelectors = [
        'article',
        '[class*="article"]',
        '[class*="content"]',
        '.post-content',
        'main',
        '#main-content'
    ];

    static async extract(url) {
        try {
            const response = await fetch(url, { headers: this.headers });
            const html = await response.text();
            const $ = cheerio.load(html);

            $('script, style, nav, header, footer, .ads, .comments, .related').remove();

            let content = '';
            for (const selector of this.articleSelectors) {
                const element = $(selector);
                if (element.length) {
                    content = element.text().trim();
                    break;
                }
            }

            if (!content) {
                content = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || '';
            }

            content = content
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 1000);

            return content || null;
        } catch (error) {
            console.error(`Failed to extract content from ${url}:`, error);
            return null;
        }
    }
}