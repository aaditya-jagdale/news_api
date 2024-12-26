export class SupabaseService {
    constructor(client) {
        this.client = client;
    }

    async uploadProductHunt(products) {
        const { data, error } = await this.client
            .from('product_hunt')
            .upsert(
                products.map(product => ({
                    name: product.name,
                    tagline: product.tagline,
                    description: product.description,
                    url: product.url,
                    website: product.website,
                    votes_count: product.votes_count,
                    created_at: product.created_at,
                    topics: JSON.stringify(product.topics),
                    media_url: product.media?.url || null,
                    video_url: product.media?.videoUrl || null,
                    updated_at: new Date().toISOString()
                })),
                { 
                    onConflict: 'url',
                    ignoreDuplicates: true 
                }
            )
            .select();

        if (error) throw error;
        return data;
    }
}