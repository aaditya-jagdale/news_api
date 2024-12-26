// productHuntController.js
import { readFile } from 'fs/promises';
import { createClient } from '@supabase/supabase-js';
import { ProductHuntAPI } from '../apis/producthunt.js';
import { SupabaseService } from '../services/supabase.js';

export async function getRawProductHunt(req, res) {
    try {
        const config = JSON.parse(await readFile('config.json', 'utf8'));
        
        if (!config.producthunt_token) {
            return res.status(500).json({
                status: 'error',
                code: 'MISSING_CONFIG',
                message: 'Missing ProductHunt token'
            });
        }

        const productHuntAPI = new ProductHuntAPI(config);
        const products = await productHuntAPI.fetchData(20);

        return res.json({
            status: 'success',
            data: products
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            status: 'error',
            code: error.code || 'FETCH_ERROR',
            message: error.message || 'Failed to fetch products'
        });
    }
}

export async function uploadProductHunt(req, res) {
    try {
        const config = JSON.parse(await readFile('config.json', 'utf8'));
        
        if (!config.producthunt_token || !config.supabase_url || !config.supabase_key) {
            return res.status(500).json({
                status: 'error',
                code: 'MISSING_CONFIG',
                message: 'Missing required configuration'
            });
        }

        const productHuntAPI = new ProductHuntAPI(config);
        const supabase = createClient(config.supabase_url, config.supabase_key);
        const supabaseService = new SupabaseService(supabase);
        
        const products = await productHuntAPI.fetchData(20);
        const result = await supabaseService.uploadProductHunt(products);

        return res.json({
            status: 'success',
            message: 'Products uploaded successfully',
            data: {
                total_products: products.length,
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