// TODO rm these 3 lines of comment
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    FileAttributes, FileTypeEnum, VisibilityInterface, ReadFileOptionsInterface, IStorageAttributes, PathPrefixer, RequirePart, VisibilityEnum, DirectoryAttributes,
} from '@flysystem-ts/common';
import { IFlysystemAdapter } from '@flysystem-ts/adapter-interface';
import fs, { ReadStream } from 'fs';
import { Readable } from 'stream';
import { drive_v3 } from 'googleapis';
import { inspect } from 'util';
import { VirtualPathMapper } from './virtual-path-mapper';
import { FileListOptionsType, GoogleDriveApiExecutor } from './google-drive-api-executor';
import { FOLDER_MIME_TYPE } from './google-drive.constants';

function trimSlashes(str: string) {
    return `/${str.replace(/^\//, '').replace(/$\//, '')}`;
}
export class GoogleDriveAdapter implements IFlysystemAdapter {
    private virtualPathMapper!: VirtualPathMapper;

    private prefixer!: PathPrefixer;

    constructor(
        private gDrive: drive_v3.Drive,
    ) {
        this.virtualPathMapper = new VirtualPathMapper(gDrive);
        this.prefixer = new PathPrefixer('');
    }

    async listContents(path: string, deep: boolean): Promise<IStorageAttributes[]> {
        const {
            folderId, folders, trimedPath, pathId, idPath,
        } = await this.explorePath(path);

        if (!folderId) {
            throw new Error(`Any directory by such path "${path}" (interpreted as "${trimedPath}").`);
        }

        const options: FileListOptionsType = {
            fields: [],
        };

        if (deep) {
            const matchedFolders = folders.reduce((acc, pathToFolder) => {
                if (pathToFolder.indexOf(trimedPath) === 0) {
                    acc.push(`"${pathId.get(pathToFolder)}" in parents`);
                }

                return acc;
            }, [] as string[]);

            options.inWhichFolderOnly = matchedFolders.length
                ? ` and (${matchedFolders.join(' or ')}) ` as any
                : ` and "${folderId}" in parents `;
        } else {
            options.inWhichFolderOnly = ` and "${folderId}" in parents `;
        }

        const { files } = await GoogleDriveApiExecutor
            .req(this.gDrive)
            .filesList(options);

        return files.map((file) => {
            const isDir = file.mimeType === FOLDER_MIME_TYPE;
            const isFile = !isDir;
            const type = isDir ? FileTypeEnum.dir : FileTypeEnum.file;
            const lastModified = file.modifiedTime
                ? new Date(file.modifiedTime).getTime()
                : undefined;

            if (isDir) {
                return {
                    isDir,
                    isFile,
                    path: idPath.get(file.id!),
                    type,
                    lastModified,
                    visibility: (file.copyRequiresWriterPermission ?? false)
                        ? VisibilityEnum.PRIVATE
                        : VisibilityEnum.PUBLIC,
                } as DirectoryAttributes;
            }

            return {
                fileSize: parseFloat(file.size!),
                isDir,
                isFile,
                type,
                path: `${idPath.get(String(file.parents?.at(-1)))}/${file.name}`,
                lastModified,
                visibility: file.copyRequiresWriterPermission ?? false ? VisibilityEnum.PRIVATE : VisibilityEnum.PUBLIC,
            } as FileAttributes;
        });
    }

    // TODO What we should do, if the file name will contains "/" character???
    async fileExists(path: string): Promise<boolean> {
        const { folderId, fileName, folderPath } = await this.explorePath(path);

        if (!folderId) {
            throw new Error(`Any directory by such path "${path}" (interpreted as "${folderPath}").`);
        }

        let nextPageToken: string | null | undefined;
        let exists = false;

        do {
            // eslint-disable-next-line no-await-in-loop
            const res = await GoogleDriveApiExecutor
                .req(this.gDrive)
                .filesList({
                    inWhichFolderOnly: ` and "${folderId}" in parents `,
                    fields: ['nextPageToken'],
                    fieldsInFile: ['name'],
                });

            exists = res.files.some((f) => f.name! === fileName);
            nextPageToken = res.nextPageToken;

            if (exists) {
                return true;
            }
        } while (nextPageToken);

        return exists;
    }

    getPathPrefix(): PathPrefixer {
        return this.prefixer;
    }

    async directoryExists(path: string): Promise<boolean> {
        const { folders, idPath, pathId } = await this.virtualPathMapper.virtualize();
        const _path = trimSlashes(path);

        return !!pathId.get(_path);
    }

    async write(path: string, contents: string | Buffer, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async writeStream(path: string, resource: Readable, config?: VisibilityInterface | undefined): Promise<void> {
        const { folderId, folderPath, fileName } = await this.explorePath(path);

        if (!folderId) {
            throw new Error(`Any directory by such path "${path}" (interpreted as "${folderPath}").`);
        }

        await GoogleDriveApiExecutor
            .req(this.gDrive)
            .filesCreateFromStream(folderId, fileName!, resource);
    }

    read(path: string, config?: ReadFileOptionsInterface | undefined): Promise<string | Buffer> {
        throw new Error('Method not implemented.');
    }

    readStream(path: string, config?: Record<string, any> | undefined): Promise<ReadStream> {
        throw new Error('Method not implemented.');
    }

    delete(path: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async deleteDirectory(path: string): Promise<void> {
        const { folderId } = await this.explorePath(path, true);

        await GoogleDriveApiExecutor.req(this.gDrive).filesDelete(folderId);
    }

    async createDirectory(path: string, config?: VisibilityInterface | undefined): Promise<void> {
        const _path = trimSlashes(path);
        const upFolder = _path.slice(0, _path.lastIndexOf('/'));
        const folder = _path.slice(upFolder.length + 1);
        const { pathId } = await this.virtualPathMapper.virtualize();
        const parentId = pathId.get(upFolder);

        await GoogleDriveApiExecutor.req(this.gDrive).filesCreateFolder(parentId!, folder);
    }

    setVisibility(path: string, visibility: VisibilityEnum): Promise<void> {
        throw new Error('Method not implemented.');
    }

    visibility(path: string): Promise<RequirePart<FileAttributes, 'visibility'>> {
        throw new Error('Method not implemented.');
    }

    mimeType(path: string): Promise<RequirePart<FileAttributes, 'mimeType'>> {
        throw new Error('Method not implemented.');
    }

    lastModified(path: string): Promise<RequirePart<FileAttributes, 'lastModified'>> {
        throw new Error('Method not implemented.');
    }

    fileSize(path: string): Promise<RequirePart<FileAttributes, 'fileSize'>> {
        throw new Error('Method not implemented.');
    }

    move(source: string, destination: string, config?: Record<string, any> | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    copy(source: string, destination: string, config?: Record<string, any> | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private async explorePath(path: string, isFolder = false): Promise<{ folderId: string, folderPath: string, fileName?: string, folders: string[], idPath: Map<string, string>, pathId: Map<string, string>, trimedPath: string }> {
        const { folders, idPath, pathId } = await this.virtualPathMapper.virtualize();
        const trimedPath = trimSlashes(path);
        const [fileName] = isFolder
            ? [undefined]
            : trimedPath.match(/(?!\/)[^\/]+$/) || [];
        const folderPath = isFolder
            ? trimedPath
            : trimedPath.slice(0, path.lastIndexOf(fileName!));
        const folderId = pathId.get(folderPath);

        if (!folderId) {
            throw new Error(`Any directory by such path "${path}" (interpreted as "${folderPath}").`);
        }

        return {
            folderId, fileName, folderPath, folders, idPath, pathId, trimedPath,
        };
    }
}
