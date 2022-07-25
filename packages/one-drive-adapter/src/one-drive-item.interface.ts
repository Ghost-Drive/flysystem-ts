export interface OneDriveItem {

    id: string,
    name: string,
    parentReference?: {
        id: string,
        path: string,
    },
    folder?: Record<string, any>,
    size: number,
    deleted?: {
        state: string
    },
}
