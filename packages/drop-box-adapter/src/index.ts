/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Adapter } from '@flysystem-ts/adapter-interface';
import {
    FlysystemException, MethodEnum, StorageItem, SuccessRes,
} from '@flysystem-ts/common';
import { Dropbox, DropboxResponseError, files } from 'dropbox';

const nativeToCommon = (item: files.DeletedMetadataReference | files.FileMetadataReference | files.FolderMetadataReference): StorageItem => ({
    id: (item as files.FileMetadataReference).id,
    name: (item as files.FileMetadataReference).name,
    isFolder: item['.tag'] === 'folder',
    path: item.path_lower,
    size: (item as files.FileMetadataReference).size,
    parentFolderId: item.parent_shared_folder_id,
});
const slashResolver = (path: string) => (path.startsWith('/')
    ? path
    : `/${path}`);

export class DBoxAdapter implements Adapter {
    constructor(private dBox: Dropbox) {}

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

    [MethodEnum.UPLOAD_BY_ID](data: Buffer, metadata: {
        name: string,
        parentId?: string,
        mimeType?: string,
    }): Promise<StorageItem> {
        throw new Error('Thiw method is not implemented yet');
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

    [MethodEnum.DOWNLOAD_BY_ID](id: string): Promise<Buffer> {
        throw new Error('Thiw method is not implemented yet');
    }
}
