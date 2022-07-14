type RequiredFileItem = {
    id: string,
    name: string,
    isFolder: boolean,
    createdAt: Date,
    updatedAt: Date,
    size: number, // so 'size' is required
}

type RequiredFolderItem = Omit<RequiredFileItem, 'size'> & {
    size: number | null, // so probably unknown
}

type RequiredStorageItem = RequiredFileItem | RequiredFolderItem;

type AdditionalPropsType = Record<string, any> | undefined;

type StandardStorageItem<T extends AdditionalPropsType = undefined> = {
    mimeType: string,
    downloadLink: string | null,
    path: string | null,
    parent: {
        id: string,
        name?: string,
    },
    trashed: {
        permanently: boolean,
        trashedTime?: Date,
    } | null,
    hasThubnail: boolean,
    shared: {
        with: string[],
        from: {
            source: string,
        } | null,
    } | null,
    optionalProps: {
        contentHash: string,
        thubnailLink?: string,
        iconLink?: string,
        viewLink?: string,
        description?: string,
    } | null,
    additionalProps?: T,
}

/**
 * // TODO
 * This type should be used as core and common type for any
 * storage item (file or folder)
 */

export type StorageItem<
    A extends AdditionalPropsType = undefined, // Additional props type
    T extends keyof StandardStorageItem = 'additionalProps', // Partial props from StandardStorageItem
    U extends keyof StandardStorageItem | '' = '', // Exclude props from StandardStorageItem
    P extends Record<string, any> = {} // Custom type for intersection with StandardStorageItem
    > = RequiredStorageItem
    & Omit<StandardStorageItem<A>, U | T>
    & Partial<Pick<StandardStorageItem, T>> & P;
