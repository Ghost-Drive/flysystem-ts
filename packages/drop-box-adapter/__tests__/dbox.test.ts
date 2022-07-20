/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
// eslint-disable new-cap
// eslint-disable no-unused-vars
import { Dropbox } from 'dropbox';
import { Flysystem } from '@flysystem-ts/flysystem';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
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

    it('Should return file metadata', async () => {
        const { result: { id: originId } } = await originSdk.filesUpload({
            path: '/dbox-sdk.jpg',
            contents: Buffer.from(readFileSync(TEST_PIC_PATH)),
        });
        const res = await flysystem.getById(originId);

        expect(res.id).toBe(originId);
    });
});
