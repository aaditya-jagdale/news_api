import { Router } from 'express';
import { RedditService } from '../services/redditServices.js';
import supabase, { SupabaseService } from '../services/supabase.js';
import { ContentSummarizer } from '../services/utils/contentSummarizer.js';
import { ProductHuntService } from '../services/productHuntServices.js';
import { ContentGenerator } from '../services/utils/content_generator.js';

const router = Router();
const redditService = new RedditService();
const productHunt = new ProductHuntService();

router.get('/reddit-news', async (req, res, next) => {
    try {
        const redditNews = await redditService.getRedditNews();
        res.json({
            status: 'success',
            length: redditNews.length,
            news: redditNews,
        });

    } catch (error) {
      next(error);
    }
  });
  
  router.get('/summarize-reddit-news', async (req, res, next) => {
    const supabase = new SupabaseService();
    const summarizer = new ContentSummarizer();
    
    try {
      const savedNews = await supabase.reddit.get();
      const chunkSize = 5; 
      const results = [];
      
      for (let i = 0; i < savedNews.length; i += chunkSize) {
        const chunk = savedNews.slice(i, i + chunkSize);
        const summaries = await Promise.all(
          chunk.map(async (news) => {
        try {
          return {
            ...news,
            content: await summarizer.summarizeBody(news.content)
          };
        } catch (error) {
          return null; // Skip the article if there's an error
        }
          })
        );
        results.push(...summaries.filter(summary => summary !== null));
      }
      const uploads = supabase.news.uploadBatch(results, { test: false });
  
      res.json({
        status: 'success',
        totalNews: results.length,
        news: results,
      });
  
    } catch (error) {
      next(error);
    }
  });

  router.get('/productHunt-news', async (req, res, next) => {
    const products = await productHunt.getTopProducts();
    const uploads = supabase.productHunt.uploadBatch(products);

    res.json({
      status: 'success',
      length: uploads.length,
      uploads,
    });

  });

  router.get('/ph-data', async (req, res, next) => {
    try {
      const products = await supabase.productHunt.get();
      res.json({
        status: 'success',
        length: products.length,
        products,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/generate', async (req, res, next) => {
    try {
      // Fetch products from the 'productHunt' table
      const products = (await supabase.productHunt.get());
  
      // Extract URLs from the products
      const productUrls = products.map(product => product.url);
  
      // Check which URLs already exist in the 'news' table
      const existingNewsUrls =  supabase.news.getExistingUrls(productUrls);
      existingNewsUrls.map(news => news.url);

      // Filter out products whose URLs already exist in the 'news' table
      const newProducts = products.filter(product => !existingNewsUrls.includes(product.url));
  
      if (newProducts.length === 0) {
        return res.json({ status: 'success', message: 'No new products to process' });
      }
  
      // Generate content for the remaining products
      const generatedProducts = await ContentGenerator.getInstance().generate(newProducts);
  
      // Transform the generated products
      const transformedProducts = generatedProducts.map(product => ({
        title: product.title || '',
        content: product.content || '',
        url_overridden_by_dest: product.url,
        image: product.thumbnail_url || '',
        subreddit_name_prefixed: 'Product Hunt',
        domain: product.url
      }));
  
      // Upload transformed products to the 'news' table
      await supabase.news.uploadBatch(transformedProducts, { test: false });
  
      // Delete the processed products from the 'productHunt' table
      const ids = newProducts.map(product => product.id);
      await supabase.productHunt.deleteAll(ids);
  
      res.json({ status: 'success', productsProcessed: newProducts.length, newProducts });
    } catch (error) {
      next(error);
    }
  });
  
export default router;