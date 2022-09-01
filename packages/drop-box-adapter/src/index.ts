/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Adapter } from '@flysystem-ts/adapter-interface';
import {
    DeleteById,
    DownloadById,
    FlysystemException,
    GetById,
    MakeDirById,
    StorageItem,
    SuccessRes,
    UploadById,
    GetDownloadLinkById,
} from '@flysystem-ts/common';
import { getType } from 'mime';
import { fromBuffer } from 'file-type';
import { extname } from 'path';
import { Dropbox, DropboxResponseError, files } from 'dropbox';

const nativeToCommon = (item: files.DeletedMetadataReference | files.FileMetadataReference | files.FolderMetadataReference): StorageItem => {
    const isFolder = item['.tag'] === 'folder';
    const extension = extname(item.name) || 'unknown';
    const mimeType = getType(extension) || 'unknown';

    return {
        id: (item as files.FileMetadataReference).id,
        name: (item as files.FileMetadataReference).name,
        isFolder,
        path: item.path_lower,
        size: (item as files.FileMetadataReference).size,
        parentFolderId: item.parent_shared_folder_id,
        mimeType,
        extension,
    };
};
const slashResolver = (path: string) => (path.startsWith('/')
    ? path
    : `/${path}`);

export class DBoxAdapter implements
    Adapter,
    GetById,
    MakeDirById,
    DeleteById,
    UploadById,
    DownloadById,
    GetDownloadLinkById {
    constructor(private dBox: Dropbox) { }

    async getDownloadLinkById(id: string): Promise<{ link: string, expiredAt: number }> {
        const res = await this.dBox.filesGetTemporaryLink({
            path: id,
        });

        return {
            link: res.result.link,
            expiredAt: new Date().getTime() + 1000 * 60 * 60 * 4,
        };
    }

    async getById(id: string): Promise<StorageItem> {
        const { result } = await this.dBox.filesGetMetadata({ path: id });

        return nativeToCommon(result);
    }

    async mkdirById(options: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem> {
        const { name, parentId } = options;
        const location = parentId
            ? await this.dBox.filesGetMetadata({ path: parentId })
                .then(({ result: { path_lower } }) => `${path_lower}${slashResolver(name)}`)
            : slashResolver(name);

        const { result: { metadata } } = await this.dBox.filesCreateFolderV2({
            path: location,
        });

        return {
            id: metadata.id,
            isFolder: true,
            parentFolderId: metadata.parent_shared_folder_id,
            path: metadata.path_lower,
        };
    }

    async uploadById(data: Buffer, metadata: {
        name: string,
        parentId?: string,
    }): Promise<StorageItem> {
        const { name, parentId } = metadata;
        const parentPath = parentId
            ? (await this.getById(parentId)).path
            : '';
        const path = `${parentPath}${slashResolver(name)}`;
        const { result } = await this.dBox.filesUpload({
            path,
            contents: data,
        });
        const { ext, mime } = await fromBuffer(data) || { ext: 'unknown', mime: 'unknown' };

        return {
            extension: ext,
            mimeType: mime,
            id: result.id,
            isFolder: false,
            size: result.size,
            parentFolderId: result.parent_shared_folder_id,
            path,
            name: result.name,
        };
    }

    async deleteById(id: string, soft: boolean): Promise<SuccessRes> {
        let result;

        if (soft) {
            ({ result } = await this.dBox.filesDeleteV2({ path: id }));
        } else {
            ({ result } = await this.dBox.filesPermanentlyDelete({ path: id }));
        }

        return {
            success: !!result?.metadata,
        };
    }

    exceptionsPipe<E extends Error = Error>(error: E): FlysystemException {
        if (error instanceof DropboxResponseError) {
            return new FlysystemException(error.message, {
                type: error.error,
                storage: 'dropbox',
                originalError: error,
            });
        }

        return new FlysystemException('unknown error', {
            type: 'unknown',
            storage: 'dropbox',
            originalError: error,
        });
    }

    async downloadById(id: string): Promise<Buffer> {
        const { result } = await this.dBox.filesDownload({ path: id });

        // TODO
        return (result as any).fileBinary;
    }
}
