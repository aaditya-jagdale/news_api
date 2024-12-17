export class BinanceAPI {
    constructor(source, transformer) {
        this.source = source;
        this.transformer = transformer;
    }

    async getNews(pageIndex = 1, pageSize = 20) {
        try {
            const response = await fetch(
                `${this.source.baseUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}&featured=true`,
                { headers: { 'clienttype': 'web' } }
            );

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error('Failed to fetch Binance news');
            }

            const articles = await Promise.all(
                data.data.vos.map(article => this.transformer.transform(article))
            );

            return articles;
        } catch (error) {
            throw new Error(`Binance API Error: ${error.message}`);
        }
    }
}
