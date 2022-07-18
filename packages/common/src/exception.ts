export class FlysystemException extends Error {
    public details?: Record<string, any>;

    constructor(message: string, details?: {
        originalError?: Error,
        [key: string]: any
    }) {
        super(message);

        this.name = 'FLYSYSTEM_EXCEPTION';

        if (details) this.details = details;
    }
}
