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
}
