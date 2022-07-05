/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from 'dotenv';
import { join } from 'path';
import { inspect } from 'util';
import { Flysystem } from '@flysystem-ts/flysystem';
import { OneDriveAdapter } from '../src';

config({ path: join(__dirname, '../../..', '.test.env') });

const { LOG_MODE } = process.env;

const log = (...args: any[]) => args.forEach((a) => (LOG_MODE === 'debug' ? console.info(inspect(a, { colors: true, depth: null })) : {}));

describe('OneDriveAdapter package testing', () => {
    let flysystem: Flysystem<OneDriveAdapter>;

    beforeAll(async () => {
        flysystem = new Flysystem(new OneDriveAdapter({
            authProvider(done) {
                return done(null, process.env.ODRIVE_ACCESS!);
            },
        }));
    });

    it('Should authenticate to OneDrive', async () => {
        expect(process.env.ODRIVE_ACCESS).toBeDefined();
        expect(flysystem).toBeDefined();
    });

    it('Should return list of files', async () => {
        const res = await flysystem.listContents();

        log(res);

        expect(res).toBeDefined();
    });
});
