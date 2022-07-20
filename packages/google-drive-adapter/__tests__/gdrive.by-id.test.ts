/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
// eslint-disable new-cap
// eslint-disable no-unused-vars
import { config } from 'dotenv';
import { Flysystem } from '@flysystem-ts/flysystem';
import { drive_v3, google, Auth } from 'googleapis';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Readable } from 'stream';
import { FlysystemException } from '@flysystem-ts/common';
import { GDriveAdapter } from '../src/index';

config({ path: '.test.env' });

const { GDRIVE_ACCESS } = process.env;
const TEST_PIC_PATH = join(__dirname, '../../resources/photo-for-test.jpg');

describe('GDrive: by "id" strategy', () => {
    let flysystem: Flysystem;
    let origin: drive_v3.Drive;
    const originFiles: drive_v3.Schema$File[] = [];

    beforeAll(async () => {
        const auth: Auth.OAuth2Client = new google.auth.OAuth2();

        auth.setCredentials({ access_token: GDRIVE_ACCESS });
        origin = google.drive({ version: 'v3', auth });

        const { data: { files } } = await origin.files.list({
            q: '"root" in parents',
            fields: 'files(id)',
            pageSize: 1,
        });
        originFiles.push(...files!);
    });

    beforeEach(() => {
        flysystem = new Flysystem(new GDriveAdapter(origin));
    });

    it('Should delete file permanently', async () => {
        const pic = readFileSync(TEST_PIC_PATH);
        const name = `DELETE-${new Date().getTime()}.jpg`;
        const originRes = await origin.files.create({
            requestBody: {
                name,
            },
            media: {
                body: Readable.from(pic),
            },
        });
        const fileId = originRes.data.id!;
        const res = await flysystem.deleteById(fileId, false);

        expect(res.success).toBe(true);

        await expect(origin.files.get({ fileId }))
            .rejects
            .toThrowError('File not found');
    });

    it('Should delete file with "soft" option', async () => {
        const pic = readFileSync(TEST_PIC_PATH);
        const name = `SOFT-DELETE-${new Date().getTime()}.jpg`;
        const originRes = await origin.files.create({
            requestBody: {
                name,
            },
            media: {
                body: Readable.from(pic),
            },
        });
        const fileId = originRes.data.id!;
        const res = await flysystem.deleteById(fileId, true);

        expect(res.success).toBe(true);

        const originAfterRes = await origin.files.get({ fileId, fields: 'trashed' });

        expect(originAfterRes.data.trashed).toBe(true);
    });

    it('Should upload file', async () => {
        const pic = readFileSync(TEST_PIC_PATH);
        const name = `measter3-testing-${new Date().getTime()}.jpg`;
        const res = await flysystem.uploadById(Buffer.from(pic), {
            name,
        });

        expect(res.name).toBe(name);
    });

    it('Should return file by id', async () => {
        const item = originFiles.pop();
        const res = await flysystem.getById(item?.id || 'any-origin-files....');

        expect(res.id).toBe(item?.id);
    });

    it('Should create directory', async () => {
        const res = await flysystem.mkdirById({
            name: `hello-${new Date().getTime()}-world`,
        });

        expect(res.isFolder).toBe(true);
    });
});
