import {
    FlysystemException, MethodEnum, StorageItem, SuccessRes,
} from '@flysystem-ts/common';

export interface Adapter {
    [MethodEnum.GET_BY_ID](id: string): Promise<StorageItem>,
    [MethodEnum.MKDIR_BY_ID](options: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem>;
    [MethodEnum.UPLOAD_BY_ID](data: Buffer, metadata: {
        name: string,
        parentId?: string,
        mimeType?: string,
    }): Promise<StorageItem>;
    [MethodEnum.DELETE_BY_ID](id: string, soft: boolean): Promise<SuccessRes>;
    exceptionsPipe<E extends Error = Error>(error: E): FlysystemException,
}
