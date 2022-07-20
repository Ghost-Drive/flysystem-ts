import { Adapter } from '@flysystem-ts/adapter-interface';

export class Flysystem {
    constructor(private adapter: Adapter) {}

    getById(id: string) {
        return this.adapter.getById(id).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }

    mkdirById(options: {
        name: string,
        parentId?: string
    }) {
        return this.adapter.mkdirById(options).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }

    uploadById(data: Buffer, metadata: {
        name: string,
        mimeType?: string,
        parentId?: string,
    }) {
        return this.adapter.uploadById(data, metadata).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }

    deleteById(id: string, soft = false) {
        return this.adapter.deleteById(id, soft).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }

    downloadById(id: string) {
        return this.adapter.downloadById(id).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }
}
