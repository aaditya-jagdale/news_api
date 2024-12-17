export class BaseTransformer {
    constructor() {
        if (this.constructor === BaseTransformer) {
            throw new Error('BaseTransformer cannot be instantiated directly');
        }
    }

    // To be implemented by child classes
    getSourceInfo() {
        throw new Error('getSourceInfo must be implemented');
    }

    // Template method pattern
    async transform(data) {
        const transformed = await this.transformData(data);
        return {
            ...transformed,
            ...this.getSourceInfo()
        };
    }

    // To be implemented by child classes
    async transformData(data) {
        throw new Error('transformData must be implemented');
    }
}