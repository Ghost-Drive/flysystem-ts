import { Adapter } from '@flysystem-ts/adapter-interface';
import { FlysystemException, MakeDirById, StorageItem } from '@flysystem-ts/common';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

export class OneDriveAdapter implements Adapter, MakeDirById {
    constructor(private msClient: Client) {}

    mkdirById(options: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem> {
        const { name, parentId } = options;

        return this
            .msClient
            .api(`/drive/root/${parentId
                ? parentId.replace(/^\//, '')
                : '/children'}`)
            .post({
                name,
                folder: { },
            })as Promise<any>;
    }

    exceptionsPipe(error: any): FlysystemException {
        return new FlysystemException(error?.code || 'unknown error', {
            storage: 'OneDrive',
            type: error?.message || 'unknown error',
            originalError: error,
        });
    }
}
