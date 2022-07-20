import { Adapter } from '@flysystem-ts/adapter-interface';
import { MethodEnum } from '@flysystem-ts/common';

export class Flysystem {
    constructor(private adapter: Adapter) {}

    [MethodEnum.GET_BY_ID](id: string) {
        return this.adapter.getById(id).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }

    [MethodEnum.MKDIR_BY_ID](options: {
        name: string,
        parentId?: string
    }) {
        return this.adapter.mkdirById(options).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }

    [MethodEnum.UPLOAD_BY_ID](data: Buffer, metadata: {
        name: string,
        mimeType?: string,
        parentId?: string,
    }) {
        return this.adapter.uploadById(data, metadata).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }

    [MethodEnum.DELETE_BY_ID](id: string, soft = false) {
        return this.adapter.deleteById(id, soft).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }

    [MethodEnum.DOWNLOAD_BY_ID](id: string) {
        return this.adapter.downloadById(id).catch((error) => {
            throw this.adapter.exceptionsPipe(error);
        });
    }
}
