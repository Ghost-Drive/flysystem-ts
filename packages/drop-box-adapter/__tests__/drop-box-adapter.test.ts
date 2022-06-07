// eslint-disable-next-line import/no-extraneous-dependencies
import { config } from 'dotenv';
import { Flysystem } from '@flysystem-ts/flysystem';
import { DropboxAdapter } from '../src/index';

config({ path: '../../../.test.env' });

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

    it('Should return "false". Folder is not exists', async () => {
        const res = await flysystem.directoryExists('no-such-directory');

        expect(res).toBe(false);
    });
});
