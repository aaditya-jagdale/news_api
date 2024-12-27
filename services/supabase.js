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
                    topics: JSON.stringify(product.topics),
                    thumbnail_url: product.thumbnail_url || null,
                    // video_url: product.media?.videoUrl || null,
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
    
    async uploadRedditNews(news) {
        // First check for existing URLs
        const { data: existingUrls } = await this.client
            .from('reddit_news')
            .select('url_overridden_by_dest')
            .in('url_overridden_by_dest', news.map(n => n.url_overridden_by_dest));
     
        // Filter out duplicates
        const existingUrlSet = new Set(existingUrls.map(item => item.url_overridden_by_dest));
        const uniqueNews = news.filter(post => !existingUrlSet.has(post.url_overridden_by_dest))
            .map(post => ({
                subreddit: post.subreddit,
                title: post.title,
                subreddit_name_prefixed: post.subreddit_name_prefixed,
                thumbnail: post.thumbnail,
                domain: post.domain,
                url_overridden_by_dest: post.url_overridden_by_dest,
                image: post.image || null,
                content: post.content
            }));
     
        if (uniqueNews.length === 0) return [];
     
        const { data, error } = await this.client
            .from('reddit_news')
            .insert(uniqueNews)
            .select();
     
        if (error) throw error;
        return data;
     }

}