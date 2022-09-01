import { drive_v3 } from 'googleapis';
import { GoogleDriveApiExecutor } from './google-drive-api-executor';

type FileProjectionType = { id: string, parents: [string], name: string, mimeType: string };
type IdStorageNodeType = { id: string, name: string, childs: { name: string, id: string }[] };
type FolderTreeType = {
    folders: string[],
    pathId: Map<string, string>,
    idPath: Map<string, string>,
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const PAGE_SIZE_FOR_FOLDER_REQ = 100;
const ROOT_PATH = '/';
const DEFAULT_ROOT_ID = 'root';
export class VirtualPathMapper {
    constructor(private gDrive: drive_v3.Drive) { }

    // TODO add cache possibility
    public async virtualize(): Promise<FolderTreeType> {
        const rootId = await this.getRootFolderId();

        if (!rootId) {
            return {
                folders: [ROOT_PATH],
                idPath: new Map().set(rootId, ROOT_PATH),
                pathId: new Map().set(ROOT_PATH, DEFAULT_ROOT_ID),
            };
        }

        const all: FileProjectionType[] = [];
        let pageToken: string | null | undefined;
        let totalReqCount = 0;

        do {
            // eslint-disable-next-line no-await-in-loop
            const { nextPageToken, files } = await GoogleDriveApiExecutor
                .req(this.gDrive)
                .filesList({
                    folderOption: ' and mimeType = "application/vnd.google-apps.folder" ',
                    pageToken,
                });

            ++totalReqCount;
            pageToken = nextPageToken;

            if (files) {
                all.push(...files! as FileProjectionType[]);
            }
        } while (pageToken && totalReqCount < 50);

        const idMap = all
            .reduce((acc, folder) => {
                const { id, name, parents: [parentId] } = folder;
                const parent = acc.get(parentId);
                const me = acc.get(id);

                if (parent) {
                    parent.childs.push({ id, name });
                } else {
                    acc.set(parentId, { id: parentId, name: '', childs: [{ id, name }] });
                }

                if (me) {
                    me.name = name;
                } else {
                    acc.set(id, { id, name, childs: [] });
                }

                return acc;
            }, new Map<string, IdStorageNodeType>().set(rootId, { childs: [], id: rootId, name: 'root' }));

        return this.generateFullPaths(idMap, rootId);
    }

    private generateFullPaths(idMap: Map<string, IdStorageNodeType>, parentId: string): FolderTreeType {
        const inRoot = idMap.get(parentId)!;
        const { childs: inRootChilds } = inRoot;
        const folderTree: FolderTreeType = {
            pathId: new Map<string, string>().set(ROOT_PATH, parentId),
            idPath: new Map<string, string>().set(parentId, ROOT_PATH),
            folders: [ROOT_PATH],
        };
        let nextLevel: { id: string, name: string, pwd: string }[] = inRootChilds.map((inRootChild) => ({ ...inRootChild, pwd: '' }));

        while (nextLevel.length) {
            const currentLevel = nextLevel;

            nextLevel = [];
            // eslint-disable-next-line no-loop-func
            currentLevel.forEach(({ pwd, id, name }) => {
                const path = `${pwd}/${name}`;
                const nextParent = idMap.get(id);

                folderTree.folders.push(path);
                folderTree.idPath.set(id, path);
                folderTree.pathId.set(path, id);

                if (nextParent) {
                    nextLevel.push(...nextParent.childs.map((grandChild) => ({ ...grandChild, pwd: path })));
                }
            });
        }

        return folderTree;
    }

    private getRootFolderId(): Promise<string | null> {
        return GoogleDriveApiExecutor
            .req(this.gDrive)
            .filesList({
                fieldsInFile: ['parents'],
                pageSize: 1,
                inWhichFolderOnly: ' and "root" in parents ',
            }).then(({ files: [{ parents }] }) => parents?.pop() || null);
    }
}
