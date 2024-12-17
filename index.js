import express from 'express';
import { readFile } from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { NewsSource } from './types.js';
import { BinanceAPI } from './apis/binance.js';
import { ProductHuntAPI } from './apis/producthunt.js';
import { BinanceTransformer } from './transformers/binance.js';
import { ProductHuntTransformer } from './transformers/producthunt.js';
import { SupabaseService } from './services/supabase.js';

const app = express();

const createServices = async (config) => {
    const supabase = createClient(config.supabase_url, config.supabase_key);
    const supabaseService = new SupabaseService(supabase);
    
    const genAI = new GoogleGenerativeAI(config.gemini_api_key);
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const binanceSource = new NewsSource('https://www.binance.com/bapi/composite/v4/friendly/pgc/feed/news/list');
    const productHuntSource = new NewsSource('https://api.producthunt.com/v2/api/graphql');

    const binanceTransformer = new BinanceTransformer();
    const productHuntTransformer = new ProductHuntTransformer(geminiModel);

    const binanceAPI = new BinanceAPI(binanceSource, binanceTransformer);
    const productHuntAPI = new ProductHuntAPI(productHuntSource, productHuntTransformer, config.product_hunt_token);

    return {
        supabaseService,
        binanceAPI,
        productHuntAPI
    };
};

app.get('/api/news', async (req, res) => {
    try {
        const config = JSON.parse(await readFile('config.json', 'utf8'));
        const { supabaseService, productHuntAPI } = await createServices(config);
        
        const articles = await productHuntAPI.getTopProducts();
        await supabaseService.updateArticles(articles);

        res.json({
            status: 'success',
            count: articles.length,
            articles
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/crypto-news', async (req, res) => {
    try {
        const config = JSON.parse(await readFile('config.json', 'utf8'));
        const { supabaseService, binanceAPI } = await createServices(config);
        
        const articles = await binanceAPI.getNews();
        await supabaseService.updateArticles(articles);

        res.json({
            status: 'success',
            count: articles.length,
            articles
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000/api/news'));