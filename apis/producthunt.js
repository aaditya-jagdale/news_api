export class ProductHuntAPI {
    constructor(source, transformer, developerToken) {
        this.source = source;
        this.transformer = transformer;
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${developerToken}`
        };
    }

    async getTopProducts(limit = 20) {
        const query = {
            query: `query {
                posts(first: ${limit}, featured: true) {
                    edges {
                        node {
                            name
                            tagline
                            description
                            url
                            votesCount
                            topics {
                                edges {
                                    node {
                                        name
                                    }
                                }
                            }
                            createdAt
                            thumbnail {
                                url
                            }
                        }
                    }
                }
            }`
        };

        const response = await fetch(this.source.baseUrl, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(query)
        });

        const data = await response.json();
        if (!response.ok || data.errors) {
            throw new Error(data.errors?.[0]?.message || `API error: ${response.status}`);
        }

        const products = data.data.posts.edges.map(({ node }) => ({
            name: node.name,
            tagline: node.tagline,
            description: node.description,
            url: node.url,
            votes: node.votesCount,
            topics: node.topics.edges.map(e => e.node.name),
            created: node.createdAt,
            thumbnail: node.thumbnail?.url
        }));

        const articles = await Promise.all(
            products.map(product => this.transformer.transform(product))
        );

        return articles;
    }
}
