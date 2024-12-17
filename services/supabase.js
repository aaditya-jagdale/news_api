export class SupabaseService {
    constructor(client) {
        this.client = client;
    }

    async updateArticles(articles) {
        const { data, error } = await this.client
            .from('news')
            .upsert(articles, {
                onConflict: 'url',
                ignoreDuplicates: true
            });

        if (error) throw error;
        return data;
    }
}
