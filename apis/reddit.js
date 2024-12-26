import fetch from 'node-fetch';

export class RedditAPI {
     async fetchCryptoNews() {
        try {
            const response = await fetch('https://www.reddit.com/r/CryptoCurrency/search.json?q=flair_name%3A%22GENERAL-NEWS%22&restrict_sr=true&sort=top&t=day&limit=100');
            
            if (!response.ok) {
                throw new Error(`Reddit API error: ${response.status}`);
            }

            const data = await response.json();
            return data.data.children;
        } catch (error) {
            throw new Error(`Failed to fetch Reddit crypto news: ${error.message}`);
        }
    }
}