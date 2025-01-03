import { createClient } from '@supabase/supabase-js'
import config from '../../config.json' assert { type: 'json' };

export class SupabaseService {
  constructor() {
    this.supabase = createClient(config.supabase_url, config.supabase_key);
    this.reddit = new RedditService(this.supabase);
    this.news = new NewsService(this.supabase);
  
  }
}

//Reddit functions
class RedditService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async upload(news) {
    try {
      const { data, error } = await this.supabase
        .from('reddit_news')
        .upsert(JSON.parse(JSON.stringify(news)), 
          { onConflict: ['url_overridden_by_dest'] }
        );

      if (error) throw error;
      return data?.length || 0;

    } catch (error) {
      console.error('Upload error:', error);
      return [];
    }
  }
  
  async get() {
    try {
      const { data, error } = await this.supabase
        .from('reddit_news')
        .select('*');

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  }
  
  async deleteById(id) {
    try {
      const { data, error } = await this.supabase
        .from('reddit_news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Delete error:', error);
      return [];
    }
  }
}

//News functions
class NewsService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async upload(news) {
    try {
      if (!news?.url_overridden_by_dest) return 0;

      const formattedNews = {
        title: news.title || '',
        description: news.content || '', // Using content as description
        content: news.content || '',
        url: news.url_overridden_by_dest,
        image: news.image || '',
        source_name: news.subreddit_name_prefixed || '',
        source_url: news.domain || ''
      };

      const { data, error } = await this.supabase
        .from('news')
        .upsert(formattedNews, { onConflict: ['url'] });

      if (error) throw error;
      return data?.length || 0;

    } catch (error) {
      console.log('-------Upload error:', error);
      return [];
    }
  }

  async get() {
    try {
      const { data, error } = await this.supabase
        .from('news')
        .select('*');

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  }

  async uploadBatch(newsArray) {
    console.log('-------Uploading:', newsArray.length, ' news');

    try {
      if (!Array.isArray(newsArray) || !newsArray.length) return 0;
  
      const formattedNews = newsArray
        .filter(news => news?.url_overridden_by_dest)
        .map(news => ({
          title: news.title || '',
          description: news.content || '',
          content: news.content || '',
          url: news.url_overridden_by_dest,
          image: news.image || '',
          source_name: news.subreddit_name_prefixed || '',
          source_url: news.domain || ''
        }));
  
      const { data, error } = await this.supabase
        .from('news')
        .upsert(formattedNews, { onConflict: ['url'] });
  
      if (error) throw error;
      return data?.length || 0;
  
    } catch (error) {
      console.log('-------Batch upload error:', error);
      return 0;
    }
  }
}



export default new SupabaseService()