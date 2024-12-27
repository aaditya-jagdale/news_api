export class ProductHuntAPI {
    constructor(config) {
        this.url = config.producthunt_url;
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.producthunt_token}`
        };
    }

    async fetchData(limit = 20) {
        const query = {
            query: `query {
                posts(first: ${limit}) {
                    edges {
                        node {
                            id
                            name
                            tagline
                            description
                            url
                            website
                            votesCount
                            createdAt
                            topics {
                                edges {
                                    node {
                                        name
                                    }
                                }
                            }
                            thumbnail {
                                url
                            }
                            media {
                                url
                                videoUrl
                            }
                        }
                    }
                }
            }`
        };

        const response = await fetch(this.url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(query)
        });

        const data = await response.json();
        if (!response.ok || data.errors) {
            throw new Error(data.errors?.[0]?.message || `API error: ${response.status}`);
        }

        return data.data.posts.edges.map(({ node }) => ({
            name: node.name,
            tagline: node.tagline,
            description: node.description,
            url: node.url,
            website: node.website,
            votes_count: node.votesCount,
            created_at: node.createdAt,
            topics: node.topics.edges.map(e => e.node.name),
            thumbnail_url: node.thumbnail?.url,
            media: node.media
        }));
    }
}
