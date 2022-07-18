export type StorageItem = {
    id: string;
    isFolder: string;
    name?: string;
    mimeType?: string;
    size?: number;
    trashed?: boolean;
    parentFolderId?: string;
    parentFolderName?: string;
    path?: string;
}
