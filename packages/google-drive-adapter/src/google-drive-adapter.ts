// TODO rm these 3 lines of comment
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    FileAttributes, FileTypeEnum, VisibilityInterface, ReadFileOptionsInterface, IStorageAttributes, PathPrefixer, RequirePart, VisibilityEnum,
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

    constructor(
        private gDrive: drive_v3.Drive,
    ) {
        this.virtualPathMapper = new VirtualPathMapper(gDrive);
    }

    async listContents(path: string, deep: boolean): Promise<IStorageAttributes[]> {
        const res = await this.virtualPathMapper.virtualize();
        const { folders, idPath, pathId } = res;
        const _path = trimSlashes(path);
        const folderId = pathId.get(_path);

        if (!folderId) {
            throw new Error(`Any directory by such path "${path}" (interpreted as "${_path}").`);
        }

        const options: FileListOptionsType = {
            fields: [],
        };

        if (deep) {
            const matchedFolders = folders.reduce((acc, pathToFolder) => {
                if (pathToFolder.indexOf(_path) === 0) {
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
            // TODO concrete types
            return {
                isDir,
                isFile,
                type,
                path: idPath.get(file.id!) || `${idPath.get(String(file.parents?.at(-1)))}/${file.name}`,
                lastModified,
                size: file.size ? parseFloat(file.size!) : undefined,
                visibility: file.copyRequiresWriterPermission ?? false ? VisibilityEnum.PRIVATE : VisibilityEnum.PUBLIC,
            };
        });
    }

    // TODO What we should do, if the file name will contains "/" character???
    async fileExists(path: string): Promise<boolean> {
        const { folders, idPath, pathId } = await this.virtualPathMapper.virtualize();
        const _path = trimSlashes(path);
        const [fileName] = _path.match(/(?!\/)[^\/]+$/) || [];
        const folderPath = _path.slice(0, path.lastIndexOf(fileName));
        const folderId = pathId.get(folderPath);

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
        throw new Error('Method not implemented.');
    }

    async directoryExists(path: string): Promise<boolean> {
        const { folders, idPath, pathId } = await this.virtualPathMapper.virtualize();
        const _path = trimSlashes(path);

        return !!pathId.get(_path);
    }

    async write(path: string, contents: string | Buffer, config?: VisibilityInterface | undefined): Promise<void> {
        const { folders, idPath, pathId } = await this.virtualPathMapper.virtualize();
        const _path = trimSlashes(path);
        const [fileName] = _path.match(/(?!\/)[^\/]+$/) || [];
        const folderPath = _path.slice(0, path.lastIndexOf(fileName));
        const folderId = pathId.get(folderPath);

        if (!folderId) {
            throw new Error(`Any directory by such path "${path}" (interpreted as "${folderPath}").`);
        }

        await GoogleDriveApiExecutor
            .req(this.gDrive)
            .simpleFilesCreate(folderId, fileName, contents);
    }

    writeStream(path: string, resource: Readable, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
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

    deleteDirectory(path: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    createDirectory(path: string, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('Method not implemented.');
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
}
