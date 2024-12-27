import {RedditAPI} from "../apis/reddit.js";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from "@supabase/supabase-js";
import { SupabaseService } from "../services/supabase.js";
import { readFile } from 'fs/promises';


export async function getRawReddit(req, res) {
    try {
        const redditApi = new RedditAPI();
        const news = await redditApi.fetchCryptoNews();

        const domainCount = news.reduce((acc, post) => {
            const domain = post.data.domain;
            if (domain) {
            acc[domain] = (acc[domain] || 0) + 1;
            }
            return acc;
        }, {});

        return res.json({
            status: 'success',
            domainCount,
            length: news.length,
            data: news,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            status: 'error',
            code: error.code || 'FETCH_ERROR',
            message: error.message || 'Failed to fetch Reddit news'
        });
    }
}

const ALLOWED_DOMAINS = {
    'cryptobriefing.com': {
        selectors: ['.content-area', '.article-content', 'article p']
    },
    'crypto.news': {
        selectors: ['.article-content', '.post-content', 'article']
    },
    'm.economictimes.com': {
        selectors: ['.artText', '.article-body']
    },
    // 'cryptopotato.com': {
    //     selectors: ['coincodex-content','entry-content','col-sm-11']
    // },
    // 'financemagnates.com': {
    //     selectors: ['.article-body', '.content-area']
    // },
    // 'cryptodnes.bg': {
    //     selectors: ['.entry-content', '.post-content']
    // },
    // 'dlnews.com': {
    //     selectors: ['article-body-wrapper', '.article-content']
    // },
  
};


export async function getRedditNews() {
    try {
        const redditApi = new RedditAPI();
        const news = await redditApi.fetchCryptoNews();
        
        const processedData = await Promise.all(
            news
            .filter(post => ALLOWED_DOMAINS[post.data.domain])
            .map(async post => {
                const { data } = post;
                let content = '';

                try {
                    const response = await axios.get(data.url_overridden_by_dest);
                    const $ = cheerio.load(response.data);
                    
                    for (const selector of ALLOWED_DOMAINS[data.domain].selectors) {
                        const element = $(selector);
                        if (element.length) {
                            content = element.text().trim()
                                .replace(/\s+/g, ' ')
                                .replace(/<[^>]*>/g, '')
                                .replace(/<iframe[\s\S]*?<\/iframe>/g, '');
                            break;
                        }
                    }
                } catch (err) {
                    console.error(`Failed to fetch content from ${data.domain}:`, err);
                }

                return {
                    subreddit: data.subreddit,
                    title: data.title,
                    subreddit_name_prefixed: data.subreddit_name_prefixed,
                    thumbnail: data.thumbnail,
                    domain: data.domain,
                    url_overridden_by_dest: data.url_overridden_by_dest,
                    image: data.preview?.images[0]?.source?.url,
                    content
                };
            })
        );

        return processedData;
    } catch (error) {
        throw {
            status: 500,
            code: 'FETCH_ERROR',
            message: error.message || 'Failed to fetch Reddit news',
            details: error
        };
    }
}


export async function uploadRedditNews(req, res) {
    try {
        const config = JSON.parse(await readFile('config.json', 'utf8'));
        if (!config.supabase_url || !config.supabase_key) {
            return res.status(500).json({
                status: 'error',
                code: 'MISSING_CONFIG',
                message: 'Missing required configuration'
            });
        }

        const supabase = createClient(config.supabase_url, config.supabase_key);
        const supabaseService = new SupabaseService(supabase);
        const news = await getRedditNews();
        const result = await supabaseService.uploadRedditNews(news);

        return res.json({
            status: 'success',
            message: 'Products uploaded successfully',
            data: {
                total_products: news.length,
                uploaded_count: result?.length || 0
            }
        }); 
    } catch (error) {
        return res.status(error.status || 500).json({
            status: 'error',
            code: error.code || 'UPLOAD_ERROR',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.details : undefined
        });
    }
}