// src/services/base/HttpService.js
export class HttpService {
    async fetch(url, options = {}) {
      const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
      };
  
      const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
      });
  
      if (!response.ok) {
        const error = new Error(await response.text());
        error.status = response.status;
        throw error;
      }
  
      return response.json();
    }
  }