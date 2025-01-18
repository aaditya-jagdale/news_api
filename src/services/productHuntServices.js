import config from '../../config.json' assert { type: 'json' };
import { GraphQLClient } from 'graphql-request';
import { ContentGenerator } from './utils/content_generator.js';


export class ProductHuntService {

  constructor() {
    this.client = new GraphQLClient(config.producthunt_url, {
      headers: {
        authorization: `Bearer ${config.producthunt_token}`,
      },
    });
  }

  async getTopProducts(limit = 20) {
    const query = `
      query {
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
      }
    `;

    try {
      const { posts } = await this.client.request(query);
      
      return posts.edges.map(({ node }) => ({
        name: node.name,
        tagline: node.tagline,
        description: node.description,
        url: node.url,
        votes_count: node.votesCount,
        topics: node.topics.edges.map(e => e.node.name),
        thumbnail_url: node.thumbnail?.url
      }));
    } catch (error) {
      throw new Error(`ProductHunt API error: ${error.message}`);
    }
  }
  
  async transformProduct() {
    const generator = new ContentGenerator();
    const content = await generator.generate();

    return { 
      content
    };

  }

}