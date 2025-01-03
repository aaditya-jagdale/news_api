export class RetryQueue {
    #queue = [];
    #maxRetries = 3;
    #currentAttempts = new Map();
  
    async add(item) {
      this.#queue.push(item);
      this.#currentAttempts.set(item.id, 0);
    }
  
    async process(processFunction) {
      const failedItems = [];
      
      for (const item of this.#queue) {
        const attempts = this.#currentAttempts.get(item.id);
        
        if (attempts < this.#maxRetries) {
          try {
            await processFunction(item);
            this.#currentAttempts.delete(item.id);
          } catch (error) {
            this.#currentAttempts.set(item.id, attempts + 1);
            failedItems.push(item);
          }
        }
      }
      
      this.#queue = failedItems;
      return {
        succeeded: this.#queue.length === 0,
        remainingItems: this.#queue
      };
    }
  
    get pendingItems() {
      return this.#queue;
    }
  }
  