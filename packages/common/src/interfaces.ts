import { Method } from './method';
import { MethodEnum } from './method.enum';
import { StorageItem } from './storage-item';
import { SuccessRes } from './success-res.type';

type UploadByIdArgs = [
    Buffer,
    {
        name: string,
        parentId?: string,
        mimeType?: string,
    },
];
type MkdirByIdArgs = [{
    name: string,
    parentId?: string,
}];
type DeleteByIdArgs = [string, boolean];

export interface GetById extends Method<MethodEnum.GET_BY_ID, [string], StorageItem> {}
export interface DeleteById extends Method<MethodEnum.DELETE_BY_ID, DeleteByIdArgs, SuccessRes> {}
export interface UploadById extends Method<MethodEnum.UPLOAD_BY_ID, UploadByIdArgs, StorageItem> {}
export interface DownloadById extends Method<MethodEnum.DOWNLOAD_BY_ID, [string], Buffer> {}
export interface MakeDirById extends Method<MethodEnum.MKDIR_BY_ID, MkdirByIdArgs, StorageItem> {}
