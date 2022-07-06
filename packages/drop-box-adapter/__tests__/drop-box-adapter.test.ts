// eslint-disable-next-line import/no-extraneous-dependencies
import { config } from 'dotenv';
import { Flysystem } from '@flysystem-ts/flysystem';
import * as fs from 'fs';
import { join } from 'path';
import { inspect } from 'util';
import { DropboxAdapter } from '../src/index';

config({ path: '../../../.test.env' });

config({ path: join(__dirname, '../../..', '.test.env') });

const { LOG_MODE } = process.env;
const log = (...args: any[]) => args.forEach((a) => (LOG_MODE === 'debug' ? console.info(inspect(a, { colors: true, depth: null })) : {}));

const TEST_PIC_NAME = 'photo-for-test.jpg';
const TEST_PIC_PATH = join(__dirname, '../resourses', TEST_PIC_NAME);

describe('Drop-box-adapter package testing', () => {
    let flysystem: Flysystem<DropboxAdapter>;

    beforeAll(() => {
        flysystem = new Flysystem(new DropboxAdapter({ accessToken: process.env.DBX_ACCESS }));
    });

    it('"process.env.DBX_ACCESS" should be defined', () => {
        expect(process.env.DBX_ACCESS).toBeDefined();
    });

    it('Should return list of files', async () => {
        const res = await flysystem.listContents();

        expect(res).toBeInstanceOf(Array);
    });

    it('Should return only files from "animals" folder', async () => {
        const res = await flysystem.listContents({ value: '/animals', type: 'path' });

        log(res);

        expect(res).toBeInstanceOf(Array);
    });

    it('Should return "false". Folder is not exists', async () => {
        const res = await flysystem.directoryExists({ value: 'no-such-directory', type: 'path' });

        expect(res).toBe(false);
    });

    it('Should create and remove directory', async () => {
        await flysystem.createDirectory({ value: 'hello', type: 'path' });

        const isFolderCreated = await flysystem.directoryExists({ value: 'hello', type: 'path' });

        expect(isFolderCreated).toBe(true);
        await flysystem.deleteDirectory({ value: 'hello', type: 'path' });

        const isFolderRemoved = !(await flysystem.directoryExists({ value: 'hello', type: 'path' }));

        expect(isFolderRemoved).toBe(true);
    });

    it('Should upload file', async () => {
        const pic = fs.readFileSync(TEST_PIC_PATH);
        const dbxPath = `one/pic-${new Date().getTime()}.jpg`;
        const pathOrId = { value: dbxPath, type: 'path' as const };

        await flysystem.write(pathOrId, pic);

        const success = await flysystem.fileExists(pathOrId);

        expect(success).toBe(true);
    });

    it('Should upload and remove file', async () => {
        const pic = fs.readFileSync(TEST_PIC_PATH);
        const dbxPath = `one/pic-${new Date().getTime()}.jpg`;
        const pathOrId = { value: dbxPath, type: 'path' as const };

        await flysystem.write(pathOrId, pic);
        await flysystem.delete(pathOrId);

        expect(await flysystem.fileExists(pathOrId)).toBe(false);
    });
});
