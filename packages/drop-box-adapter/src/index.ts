/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Adapter } from '@flysystem-ts/adapter-interface';
import {
    FlysystemException, MethodEnum, StorageItem, SuccessRes,
} from '@flysystem-ts/common';

export class DBoxAdapter implements Adapter {
    [MethodEnum.GET_BY_ID](id: string): Promise<StorageItem> {
        throw new Error('Thiw method is not implemented yet');
    }

    [MethodEnum.MKDIR_BY_ID](options: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem> {
        throw new Error('Thiw method is not implemented yet');
    }

    [MethodEnum.UPLOAD_BY_ID](data: Buffer, metadata: {
        name: string,
        parentId?: string,
        mimeType?: string,
    }): Promise<StorageItem> {
        throw new Error('Thiw method is not implemented yet');
    }

    [MethodEnum.DELETE_BY_ID](id: string, soft: boolean): Promise<SuccessRes> {
        throw new Error('Thiw method is not implemented yet');
    }

    exceptionsPipe<E extends Error = Error>(error: E): FlysystemException {
        throw new Error('Thiw method is not implemented yet');
    }

    [MethodEnum.DOWNLOAD_BY_ID](id: string): Promise<Buffer> {
        throw new Error('Thiw method is not implemented yet');
    }
}
