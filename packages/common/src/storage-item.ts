export type StorageItem = {
    id?: string | null;
    isFolder?: boolean | null;
    name?: string | null;
    mimeType?: string | null;
    extension?: string | null;
    size?: number | string | null;
    trashed?: boolean | null;
    parentFolderId?: string | null;
    parentFolderName?: string | null;
    path?: string | null;
}
