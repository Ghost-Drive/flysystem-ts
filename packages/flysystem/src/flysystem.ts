import { Adapter } from '@flysystem-ts/adapter-interface';
import { MethodEnum } from '@flysystem-ts/common';

export class Flysystem {
    constructor(private adapter: Adapter) {}

    [MethodEnum.GET_BY_ID](id: string) {
        return this.adapter.getById(id).catch(this.adapter.exceptionsPipe);
    }
}
