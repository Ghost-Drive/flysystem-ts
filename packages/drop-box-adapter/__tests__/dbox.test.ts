/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
// eslint-disable new-cap
// eslint-disable no-unused-vars
import { Dropbox } from 'dropbox';
import { Flysystem } from '@flysystem-ts/flysystem';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DBoxAdapter } from '../src';

config({ path: '.test.env' });

const { DBX_ACCESS } = process.env;
const TEST_PIC_PATH = join(__dirname, '../../resources/photo-for-test.jpg');

describe('DBox by "id" strategy', () => {
    let flysystem: Flysystem;
    let originSdk: Dropbox;

    beforeAll(async () => {
        originSdk = new Dropbox({ accessToken: DBX_ACCESS });
    });

    beforeEach(async () => {
        flysystem = new Flysystem(new DBoxAdapter(new Dropbox({ accessToken: DBX_ACCESS })));
    });

    it('Should download file', async () => {
        const { result: { id } } = await originSdk.filesUpload({
            path: `/pic-${new Date().getTime()}.jpg`,
            contents: readFileSync(TEST_PIC_PATH),
        });
        const res = await flysystem.downloadById(id);

        writeFileSync(join(__dirname, 'ok.jpg'), res);

        expect(res).toBeInstanceOf(Buffer);
        expect(res).not.toHaveLength(0);
    });

    it('Should upload file', async () => {
        const uploadsFolder = `/test-uploads-${new Date().getTime()}`;
        const { result: { metadata } } = await originSdk.filesCreateFolderV2({ path: uploadsFolder });
        const data = readFileSync(TEST_PIC_PATH);
        const data2 = Buffer.from(data);
        const res = await flysystem.uploadById(data, {
            name: 'out-pic.jpg',
        });
        expect(res.id).toBeDefined();
        const res2 = await flysystem.uploadById(data2, {
            name: 'in-pic.jpg',
            parentId: metadata.id,
        });
        expect(res2.id).toBeDefined();
    });

    it('Should make directory', async () => {
        const outsideFolder = `/out-root-${new Date().getTime()}`;
        const { result: { metadata } } = await originSdk.filesCreateFolderV2({ path: outsideFolder });
        const res = await flysystem.mkdirById({ name: `out-${new Date().getTime()}-folder` });

        expect(res.id).toBeDefined();

        const insideFolder = `in-${new Date().getTime()}`;
        const { path } = await flysystem.mkdirById({ name: insideFolder, parentId: metadata.id });

        expect(path).toBe(`${outsideFolder}/${insideFolder}`);
    });

    it('Should return file metadata', async () => {
        const { result: { id: originId } } = await originSdk.filesUpload({
            path: `/dbox-sdk-${new Date().getTime()}.jpg`,
            contents: Buffer.from(readFileSync(TEST_PIC_PATH)),
        });
        const res = await flysystem.getById(originId);

        expect(res.id).toBe(originId);
    });

    it('Should make "soft" delete', async () => {
        const { result: { id: originId, rev } } = await originSdk.filesUpload({
            path: '/dbox-sdk.jpg',
            contents: Buffer.from(readFileSync(TEST_PIC_PATH)),
        });
        const res = await flysystem.deleteById(originId, true);

        expect(res.success).toBe(true);

        const { result } = await originSdk.filesGetMetadata({ path: originId, include_deleted: true });

        expect((result as any)['.tag']).toBe('deleted');
    });

    it('Should not delete file permanently', async () => {
        const { result: { id: originId, rev } } = await originSdk.filesUpload({
            path: '/dbox-sdk.jpg',
            contents: Buffer.from(readFileSync(TEST_PIC_PATH)),
        });

        let error;

        try {
            const res = await flysystem.deleteById(originId, false);

            expect(res.success).toBe(true);
        } catch (err: any) {
            expect(err.name).toBe('FLYSYSTEM_EXCEPTION');
            error = err;
        }

        expect(error).toBeDefined();
    });
});
