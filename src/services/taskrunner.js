import { RedditService } from './redditServices.js';
import { SupabaseService } from './supabase.js';
import { ContentSummarizer } from './utils/contentSummarizer.js';
import { ProductHuntService } from './productHuntServices.js';
import { ContentGenerator } from './utils/content_generator.js';

export const runRedditTasks = async (nextExecutionTime) => {
  const redditService = new RedditService();
  const supabase = new SupabaseService();
  const summarizer = new ContentSummarizer();

  try {
    console.log('Fetching Reddit news...');
    const redditNews = await redditService.getRedditNews();
    
    const savedNews = await supabase.reddit.get();
    const chunkSize = 5;
    const summarizedNews = [];
    
    for (let i = 0; i < savedNews.length; i += chunkSize) {
      const chunk = savedNews.slice(i, i + chunkSize);
      const summaries = await Promise.all(
        chunk.map(async (news) => {
          try {
            return {
              ...news,
              content: await summarizer.summarizeBody(news.content),
            };
          } catch (error) {
            return null;
          }
        })
      );
      summarizedNews.push(...summaries.filter(summary => summary !== null));
    }
    
    await supabase.news.uploadBatch(summarizedNews, { test: false });
    await supabase.reddit.deleteAll();
    
    console.log(`Reddit tasks completed. Next run at: ${nextExecutionTime}`);
  } catch (error) {
    console.error('Error executing Reddit tasks:', error);
  }
};

export const runProductHuntTasks = async (nextExecutionTime) => {
  const supabase = new SupabaseService();
  const productHunt = new ProductHuntService();
  const generator = ContentGenerator.getInstance();

  try {
    console.log('Fetching Product Hunt news...');
    const products = await productHunt.getTopProducts();
    await supabase.productHunt.uploadBatch(products);

    const newProducts = await generator.generate(await supabase.productHunt.get());
    const transformedProducts = newProducts.map(product => ({
      title: product.title || '',
      content: product.content || '',
      url_overridden_by_dest: product.url,
      image: product.thumbnail_url || '',
      subreddit_name_prefixed: 'Product Hunt',
      domain: product.url,
    }));

    await supabase.news.uploadBatch(transformedProducts, { test: false });
    await supabase.productHunt.deleteAll();

    console.log(`Product Hunt tasks completed. Next run at: ${nextExecutionTime}`);
  } catch (error) {
    console.error('Error executing Product Hunt tasks:', error);
  }
};