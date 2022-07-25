/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Flysystem } from '@flysystem-ts/flysystem';
import { join } from 'path';
import { config } from 'dotenv';
import { Client, Options } from '@microsoft/microsoft-graph-client';
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

    it.only('Should create folder', async () => {
        const res = await flysystem.mkdirById({
            name: `folder-${new Date().getTime()}`,
        });

        console.log(res);
    });

    it('Should authenticate to OneDrive', async () => {
        expect(process.env.ODRIVE_ACCESS).toBeDefined();
        expect(flysystem).toBeDefined();
    });
});
