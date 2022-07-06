/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    FileAttributes,
    FlysystemException,
    FileTypeEnum,
    FInfoMimeTypeDetector,
    IMimeTypeDetector,
    IStorageAttributes,
    NotSupportedException,
    PathPrefixer,
    UnableToMoveFileException,
    UnableToRetrieveMetadataException,
    VisibilityEnum,
    RequirePart,
    VisibilityInterface,
    ReadFileOptionsInterface,
    PathOrId,
} from '@flysystem-ts/common';
import { IFlysystemAdapter } from '@flysystem-ts/adapter-interface';
import moment from 'moment';
import { ReadStream } from 'fs';
import { Readable } from 'stream';
import {
    DropboxOptions, Dropbox, files, DropboxResponse,
} from 'dropbox';
import { inspect } from 'util';

export class DropboxAdapter implements IFlysystemAdapter {
    private dbx!: Dropbox;

    private prefixer!: PathPrefixer;

    private mimeTypeDetector!: IMimeTypeDetector;

    private readonly MAX_UPLOAD_PORTION = 100_000_000;

    constructor(
        private dpbOptions: DropboxOptions,
        prefix: string = '',
        mimeTypeDetector: IMimeTypeDetector | null = null,
    ) {
        this.dbx = new Dropbox(dpbOptions);
        this.prefixer = new PathPrefixer(prefix);
        this.mimeTypeDetector = mimeTypeDetector || new FInfoMimeTypeDetector();
    }

    protected applyPathPrefix(path: string): string {
        return path
            ? `/${this.prefixer.prefixPath(path).replace(/^\//, '').replace(/$\//, '')}`
            : '';
    }

    writeStream(pathOrId: PathOrId, resource: Readable, config?: VisibilityInterface | undefined): Promise<void> {
        throw new Error('This method is not implemented yet');
    }

    visibility(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'visibility'>> {
        throw new NotSupportedException('Adapter does not support visibility controls.');
    }

    setVisibility(pathOrId: PathOrId, visibility: VisibilityEnum): Promise<void> {
        throw new NotSupportedException('Adapter does not support visibility controls.');
    }

    async readStream(pathOrId: PathOrId, config?: Record<string, any> | undefined): Promise<ReadStream> {
        throw new Error('This method is not implemented yet');
    }

    async read(pathOrId: PathOrId, config?: ReadFileOptionsInterface | undefined): Promise<string | Buffer> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const location = this.applyPathPrefix(path);
        const { fileSize } = await this.fileSize(pathOrId);

        // TODO (check)
        // file is to large - so we simply return link for downloading it
        if (fileSize > this.MAX_UPLOAD_PORTION) {
            const { result: { link } } = await this.dbx.filesGetTemporaryLink({ path: location });

            return link;
        }

        const { result: { fileBinary } } = await this.dbx.filesDownload({ path: location }) as DropboxResponse<files.FileMetadata & { fileBinary: Buffer }>;

        return fileBinary;
    }

    async listContents(pathOrId: PathOrId, deep: boolean): Promise<IStorageAttributes[]> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const { headers, status, result: { entries } } = await this.dbx.filesListFolder({ path: this.applyPathPrefix(path), recursive: deep });

        return entries.reduce((acc, item) => {
            if (item['.tag'] === 'deleted') return acc;

            const data = {
                path: item.path_display || item.path_lower || item.name,
                id: item.id,
            };

            if (item['.tag'] === 'file') {
                acc.push({
                    ...data,
                    size: item.size,
                    isDir: false,
                    isFile: true,
                    type: FileTypeEnum.file,
                    lastModified: moment(item.client_modified).unix(), // TODO check 'item.server_modified',
                });
            } else if (item['.tag'] === 'folder') {
                acc.push({
                    ...data,
                    isDir: true,
                    isFile: false,
                    type: FileTypeEnum.dir,
                } as any);
            }

            return acc;
        }, [] as IStorageAttributes[]);
    }

    // TODO why do we need thid method?
    getPathPrefix(): PathPrefixer {
        return this.prefixer;
    }

    async copy(source: PathOrId, destination: PathOrId, config?: Record<string, any> | undefined): Promise<void> {
        if (source.type !== 'id' || destination.type !== 'id') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: _source } = source;
        const { value: _destination } = destination;
        const [fromPath, toPath] = [this.applyPathPrefix(_source), this.applyPathPrefix(_destination)];

        try {
            await this.dbx.filesCopyV2({
                from_path: fromPath,
                to_path: toPath,
            });
        } catch (error) {
            throw new UnableToMoveFileException(`Unable to move <${fromPath}> to <${toPath}>`);
        }
    }

    async createDirectory(pathOrId: PathOrId, config?: VisibilityInterface | undefined): Promise<void> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const location = this.applyPathPrefix(path);

        await this.dbx.filesCreateFolderV2({ path: location });
    }

    async delete(pathOrId: PathOrId): Promise<void> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const location = this.applyPathPrefix(path);

        try {
            await this.dbx.filesDeleteV2({ path: location });
        // eslint-disable-next-line no-empty
        } catch (error) { }
    }

    deleteDirectory(pathOrId: PathOrId): Promise<void> {
        return this.delete(pathOrId);
    }

    async fileExists(pathOrId: PathOrId): Promise<boolean> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const location = this.applyPathPrefix(path);

        try {
            await this.dbx.filesGetMetadata({ path: location, include_deleted: false });

            return true;
        } catch (error) {
            return false;
        }
    }

    async directoryExists(pathOrId: PathOrId): Promise<boolean> {
        return this.fileExists(pathOrId);
    }

    async fileSize(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'fileSize'>> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const location = this.applyPathPrefix(path);
        let meta: Partial<files.FileMetadataReference>;

        try {
            const { result } = await this.dbx.filesGetMetadata({ path: location }) as DropboxResponse<Partial<files.FileMetadataReference>>;
            meta = result;
        } catch (error) {
            throw new FlysystemException(`Incorrect path "${path}": any data was found`);
        }

        if (!meta.size) {
            throw new UnableToRetrieveMetadataException('Unable to retrieve "size" property. May be your target is not file but folder.');
        }

        return new FileAttributes(location, { fileSize: meta.size }) as { fileSize: number };
    }

    async lastModified(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'lastModified'>> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const location = this.applyPathPrefix(path);
        let meta: Partial<files.FileMetadataReference>;

        try {
            const { result } = await this.dbx.filesGetMetadata({ path: location }) as DropboxResponse<Partial<files.FileMetadataReference>>;
            meta = result;
        } catch (error) {
            throw new FlysystemException(`Incorrect path "${path}": any data was found`);
        }

        if (!meta.server_modified) {
            throw new UnableToRetrieveMetadataException('Unable to retrieve "last_modified" property. May be your target is not file but folder.');
        }

        return new FileAttributes(location, { lastModified: moment(meta.server_modified).unix() }) as FileAttributes & { lastModified: number };
    }

    async mimeType(pathOrId: PathOrId): Promise<RequirePart<FileAttributes, 'mimeType'>> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const location = this.applyPathPrefix(path);
        const mimeType = await this.mimeTypeDetector.detectMimeTypeFromPath(location);

        if (!mimeType) {
            // TODO is it normal?
            throw new UnableToRetrieveMetadataException('Unable to retrieve "mimeType". May be your target is not file but folder.');
        }

        return new FileAttributes(
            location,
            { mimeType },
        ) as { mimeType: string };
    }

    async move(source: PathOrId, destination: PathOrId, config?: Record<string, any> | undefined): Promise<void> {
        if (source.type !== 'id' || destination.type !== 'id') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: _source } = source;
        const { value: _destination } = destination;
        const [fromPath, toPath] = [this.applyPathPrefix(_source), this.applyPathPrefix(_destination)];

        try {
            await this.dbx.filesMoveV2({
                from_path: fromPath,
                to_path: toPath,
            });
        } catch (error) {
            throw new UnableToMoveFileException(`Unable to move <${fromPath}> to <${toPath}>`);
        }
    }

    async write(pathOrId: PathOrId, contents: string | Buffer, config?: VisibilityInterface | undefined): Promise<void> {
        if (pathOrId.type !== 'path') {
            throw new FlysystemException('ById API is not implemented yet');
        }

        const { value: path } = pathOrId;
        const location = this.applyPathPrefix(path);
        const buff = typeof contents === 'string'
            ? Buffer.from(contents)
            : contents;
        const { byteLength } = buff;

        if (byteLength <= this.MAX_UPLOAD_PORTION) {
            await this.dbx.filesUpload({ path: location, contents });

            return;
        }

        let offset = 0;
        let end = this.MAX_UPLOAD_PORTION;
        const firstChank = buff.slice(offset, end);

        const { result: { session_id: sesId } } = await this.dbx.filesUploadSessionStart({
            contents: firstChank,
        });

        // eslint-disable-next-line no-constant-condition
        while (true) {
            end += this.MAX_UPLOAD_PORTION;
            offset += this.MAX_UPLOAD_PORTION;

            const remainData = byteLength - offset;
            const isFinish = remainData <= this.MAX_UPLOAD_PORTION;
            const _end = isFinish ? byteLength : end;
            const _contents = buff.slice(offset, _end);

            if (isFinish) {
                // eslint-disable-next-line no-await-in-loop
                const { status } = await this.dbx.filesUploadSessionFinish({
                    commit: { path: location },
                    cursor: {
                        offset,
                        session_id: sesId,
                    },
                    contents: _contents,
                });

                return;
            }

            // eslint-disable-next-line no-await-in-loop
            const { status } = await this.dbx.filesUploadSessionAppendV2({
                cursor: {
                    session_id: sesId,
                    offset,
                },
                contents: _contents,
            });
        }
    }

    // this method is not exists in adapter!
    public getUrl(path: string): Promise<string> {
        return this.dbx.filesGetTemporaryLink({ path: this.applyPathPrefix(path) }).then(({ result: { link } }) => link);
    }
}
