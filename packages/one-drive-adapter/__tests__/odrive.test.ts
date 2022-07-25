/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Flysystem } from '@flysystem-ts/flysystem';
import { join } from 'path';
import { config } from 'dotenv';
import { Client, Options } from '@microsoft/microsoft-graph-client';
import { readFileSync, writeFileSync } from 'fs';
import { OneDriveAdapter } from '../src';

config({ path: '.test.env' });

const { ODRIVE_ACCESS } = process.env;
const TEST_PIC_PATH = join(__dirname, '../../resources/photo-for-test.jpg');

describe('OneDriveAdapter package testing', () => {
    let flysystem: Omit<OneDriveAdapter, 'exceptionsPipe'>;
    let origin: Client;

    beforeAll(async () => {
        origin = Client.init({
            authProvider(done) {
                return done(null, ODRIVE_ACCESS!);
            },
        });

        flysystem = Flysystem.init(new OneDriveAdapter(origin));
    });

    it('Should download file', async () => {
        const pic = readFileSync(TEST_PIC_PATH);
        const { id } = await origin.api(`/me/drive/root:/test-pic-${new Date().getTime()}:/content`).put(pic);
        const res = await flysystem.downloadById(id);

        expect(res.length).toBe(pic.length);
    });

    it('Should upload to the specific folder', async () => {
        const pic = readFileSync(TEST_PIC_PATH);
        const { id: parentId } = await origin.api('/me/drive/root/children').post({
            folder: {},
            name: `test-folder-for-pic-${new Date().getTime()}.jpg`,
        });
        const res = await flysystem.uploadById(pic, {
            name: `test-pic-in-folder-${new Date().getTime()}`,
            parentId,
        });

        expect(res.parentFolderId).toBe(parentId);
    });

    it('Should upload to the root folder', async () => {
        const pic = readFileSync(TEST_PIC_PATH);
        const res = await flysystem.uploadById(pic, {
            name: `test-pic-${new Date().getTime()}.jpg`,
        });

        expect(res.path).toMatch(/root/);
    });

    it('Should create folder inside parent by its "id"', async () => {
        const { id: parentId } = await origin.api('/me/drive/root/children').post({
            folder: {},
            name: `TEST-PARENT-${new Date().getTime()}-FOLDER`,
        });
        const res = await flysystem.mkdirById({
            name: `test-child-${new Date().getTime()}-folder`,
            parentId,
        });

        expect(parentId).toBe(res.parentFolderId);
    });

    it('Should delete folder', async () => {
        const { id } = await origin.api('/me/drive/root/children').post({
            folder: {},
            name: `should-be-deleted ${new Date().getTime()}`,
        });
        const res = await flysystem.deleteById(id, true);

        expect(res.success).toBe(true);
    });

    it('Should create folder at the "root" level', async () => {
        const res = await flysystem.mkdirById({
            name: `TEST-${new Date().getTime()}-FOLDER`,
        });

        expect(res.id).toBeDefined();
        expect(res.isFolder).toBe(true);
    });

    it('Should authenticate to OneDrive', async () => {
        expect(process.env.ODRIVE_ACCESS).toBeDefined();
        expect(flysystem).toBeDefined();
    });
});
