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

    it('Should return lest of files', async () => {
        const res = await flysystem.listContents();

        console.log(res);

        expect(res).toBeInstanceOf(Array);
    });
});
