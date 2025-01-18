import { createClient } from '@supabase/supabase-js'
import config from '../../config.json' assert { type: 'json' };

export class SupabaseService {
  constructor() {
    this.supabase = createClient(config.supabase_url, config.supabase_key);
    this.reddit = new RedditServer(this.supabase);
    this.productHunt = new ProductHuntServer(this.supabase);
    this.news = new NewsServer(this.supabase);
  
  }
}

//Reddit functions
class RedditServer {
  constructor(supabase) {
    this.supabase = supabase;
  }

  //upload reddit news
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
        .select();
        

        console.log('-------response:', data);
        if (error) throw error;
        
        
        return data || [];
        
      } catch (error) {
      console.log('-------error:', error);
      console.error('Fetch error:', error);
      return [];
    }
  }

  async deleteAll(Array = []) {
    try {
      const { data, error } = await this.supabase
        .from('reddit_news')
        .delete();

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Delete error:', error);
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

//ProductHunt functions
class ProductHuntServer {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async uploadBatch(newsArray) {

    try {
      if (!Array.isArray(newsArray) || !newsArray.length) return 0;
  
  
      const { data, error } = await this.supabase
        .from('product_hunt')
        .upsert(newsArray, { onConflict: ['url'] });
  
        console.log('-------response PH:', data);

      if (error) throw error;
      return data?.length || 0;

    } catch (error) {
      console.log('-------Batch upload error:', error);
      return 0;
    }
  }
  
  async get() {
    try {
      const { data, error } = await this.supabase
        .from('product_hunt')
        .select();

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  }

  async deleteAll(Array = []) {
    try {
      const { data, error } = await this.supabase
        .from('product_hunt')
        .delete();

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Delete error:', error);
    }
  }
  
  async deleteById(id) {
    try {
      const { data, error } = await this.supabase
        .from('product_hunt')
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
class NewsServer {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async upload(news) {
    try {
      if (!news?.url_overridden_by_dest) return 0;

      const formattedNews = {
        title: news.title || '',
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

  async getExistingUrls(productUrls) {
    try { 
      const { data , error } = await supabase
      .from('news')
      .select('url')
      .in('url', productUrls);

      console.log('-------response:', data);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  }

  async uploadBatch(newsArray, {test = false}) {
    console.log('-------Uploading:', newsArray.length, ' news');

    try {
      if (!Array.isArray(newsArray) || !newsArray.length) return 0;
  
      const formattedNews = newsArray
        .filter(news => news?.url_overridden_by_dest)
        .map(news => ({
          title: news.title || '',
          content: news.content || '',
          url: news.url_overridden_by_dest,
          image: news.image || '',
          source_name: news.subreddit_name_prefixed || '',
          source_url: news.domain || '',
          category: news.category || '',
        }));
  
      const { data, error } = await this.supabase
        .from( test ? 'news_test' :'news')
        .upsert(formattedNews, { onConflict: ['url'] });
        
        console.log('-------Uploading complete:', data);

      if (error) throw error;
      return data?.length || 0;
  
    } catch (error) {
      console.log('-------Batch upload error:', error);
      return 0;
    }
  }
}

export default new SupabaseService()