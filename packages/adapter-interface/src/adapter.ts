import { FlysystemException, MethodEnum, StorageItem } from '@flysystem-ts/common';

export interface Adapter {
    [MethodEnum.GET_BY_ID](id: string): Promise<StorageItem>,
    [MethodEnum.MKDIR_BY_ID](options: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem>;
    exceptionsPipe<E extends Error = Error>(error: E): FlysystemException,
}
