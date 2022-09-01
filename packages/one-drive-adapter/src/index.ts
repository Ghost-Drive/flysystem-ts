import { Adapter } from '@flysystem-ts/adapter-interface';
import {
    DeleteById,
    DownloadById,
    FlysystemException,
    GetById,
    GetDownloadLinkById,
    IsFileExistsByPath,
    MakeDirById,
    StorageItem,
    SuccessRes,
    UploadById,
    slashResolver,
} from '@flysystem-ts/common';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { getType } from 'mime';
import { Blob } from 'buffer';
import { extname } from 'path';
import { OneDriveItem } from './one-drive-item.interface';

function nativeToCommon(item: OneDriveItem): StorageItem {
    const {
        id, name, parentReference, folder, size, deleted,
    } = item;
    const extension = extname(name) || 'unknown';
    const mimeType = getType(extension) || 'unknown';

    return {
        id,
        name,
        ...(parentReference && {
            path: parentReference.path,
            parentFolderId: parentReference.id,
            parentFolderName: parentReference.path.split('/').at(-1),
        }),
        size,
        trashed: !!deleted,
        isFolder: !!folder,
        mimeType,
        extension,
    };
}

export class OneDriveAdapter implements
    Adapter,
    MakeDirById,
    DeleteById,
    UploadById,
    DownloadById,
    GetById,
    GetDownloadLinkById,
    IsFileExistsByPath {
    constructor(private msClient: Client) { }

    async isFileExistsByPath(path: string): Promise<false | string> {
        try {
            const res = await this
                .msClient
                .api(`/me/drive/root:${slashResolver(path)}:/content`)
                .get();

            console.log(res);

            return res as any;
        } catch (error) {
            console.error(error);

            return false;
        }
    }

    async getDownloadLinkById(id: string) {
        const res = await this.msClient.api(`/me/drive/items/${id}/createLink`).post({
            type: 'embed',
        });

        return {
            link: res.link.webUrl,
            expiredAt: null,
        };
    }

    async getById(id: string): Promise<StorageItem> {
        const res = await this.msClient.api(`/me/drive/items/${id}`).get();

        return nativeToCommon(res);
    }

    async downloadById(id: string): Promise<Buffer> {
        const res = await this.msClient.api(`/me/drive/items/${id}/content`).get() as Blob;

        return Buffer.from(await res.arrayBuffer());
    }

    async uploadById(data: Buffer, options: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem> {
        const { name, parentId } = options;
        const graph = parentId
            ? `/me/drive/items/${parentId}:/${name}:/content`
            : `/me/drive/root:/${name}:/content`;
        const res = await this.msClient.api(graph).put(data);

        return nativeToCommon(res);
    }

    async deleteById(id: string, soft: boolean): Promise<SuccessRes> {
        if (!soft) {
            throw new FlysystemException('Only "soft"=true deletion is supported', {
                type: 'Unsupported flag',
                storage: 'OneDrive',
            });
        }

        await this.msClient.api(`/me/drive/items/${id}`).delete();

        return {
            success: true,
        };
    }

    async mkdirById(options: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem> {
        const { name, parentId } = options;
        const graph = parentId
            ? `/me/drive/items/${parentId}/children`
            : `/me/drive/root/children`;
        const res = await this
            .msClient
            .api(graph)
            .post({
                name,
                folder: {},
            });

        return nativeToCommon(res);
    }

    exceptionsPipe(error: any): FlysystemException {
        return new FlysystemException(error?.code || 'unknown error', {
            storage: 'OneDrive',
            type: error?.message || 'unknown error',
            originalError: error,
        });
    }
}
