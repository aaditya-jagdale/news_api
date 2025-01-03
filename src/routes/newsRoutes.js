import { Router } from 'express';
import { RedditService } from '../services/redditServices.js';
import supabase, { SupabaseService } from '../services/supabase.js';
import { ContentSummarizer } from '../services/utils/contentSummarizer.js';


const router = Router();
const redditService = new RedditService();

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
      const chunkSize = 5; // Process 5 articles at a time
      const results = [];
      
      for (let i = 0; i < savedNews.length; i += chunkSize) {
        const chunk = savedNews.slice(i, i + chunkSize);
        const summaries = await Promise.all(
          chunk.map(async (news) => ({
            ...news,
            content: await summarizer.summarizeBody(news.content)
          }))
        );
        results.push(...summaries);
      }
      const uploads = supabase.news.uploadBatch(results);
  
      res.json({
        status: 'success',
        totalNews: results.length,
        totalUploads: uploads.length,
        news: uploads,
      });
  
    } catch (error) {
      next(error);
    }
  });

export default router;