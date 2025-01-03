import { REDDIT_API } from '../config/constants.js';
import { HttpService } from './base/HttpService.js';
import * as cheerio from 'cheerio';
import { SupabaseService } from './supabase.js';
import ContentSummarizer from './utils/contentSummarizer.js';

const ALLOWED_DOMAINS = {
    'cryptobriefing.com': {
        selectors: ['.content-area', '.article-content', 'article p']
    },
    'crypto.news': {
        selectors: ['.article-content', '.post-content', 'article']
    },
    'm.economictimes.com': {
        selectors: ['.artText', '.article-body']
    }
};

export class RedditService extends HttpService {
  #summarizer = new ContentSummarizer();
  #supabase = new SupabaseService();

  #cleanContent(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const cleanedLines = lines.filter(line => 
      !line.includes('Share') &&
      !line.includes('Link copied') &&
      !line.includes('You might also like') &&
      !line.includes('Read more about') &&
      !line.includes('iframe') &&
      !line.trim().startsWith('By') &&
      !line.trim().startsWith('Edited')
    );
    return cleanedLines.map(line => line.trim()).filter(line => line).join('\n');
  }

  #buildUrl() {
    const baseUrl = `${REDDIT_API.BASE_URL}/${REDDIT_API.SUBREDDIT}`;
    const queryParams = new URLSearchParams({
      restrict_sr: 'true',
      limit: String(100),
      f: 'flair_name:"GENERAL-NEWS"',
    });
    return `${baseUrl}/hot.json?${queryParams}`;
  }    

  async #fetchContent(url, domain) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const selectors = ALLOWED_DOMAINS[domain]?.selectors;
      if (!selectors) return '';

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length) {
          const rawContent = elements.map((_, el) => $(el).text()).get().join(' ');
          return this.#cleanContent(rawContent);
        }
      }
      return '';
    } catch (error) {
      console.error(`Error fetching content from ${url}:`, error);
      return '';
    }
  }
  
  async getRedditNews() {
    const url = this.#buildUrl();
    const response = await fetch(url);
    const data = await response.json();
    
    const posts = data.data.children.filter(post => 
      post.data.link_flair_text === "GENERAL-NEWS" && 
      ALLOWED_DOMAINS[post.data.domain]
    );

    const redditNews = await Promise.all(posts.map(async post => ({
      subreddit: post.data.subreddit,
      title: post.data.title,
      subreddit_name_prefixed: post.data.subreddit_name_prefixed,
      thumbnail: post.data.thumbnail,
      domain: post.data.domain,
      url_overridden_by_dest: post.data.url_overridden_by_dest,
      image: post.data.preview?.images[0]?.source?.url,
      content: await this.#fetchContent(
        post.data.url_overridden_by_dest,
        post.data.domain
      )
    })));

    const uploadedDataLength = await this.#supabase.reddit.upload(redditNews);

    return {
      status: 'success',
      fetchedNews: redditNews.length,
      totalUploaded: uploadedDataLength,
      news: redditNews
    };
  }

}