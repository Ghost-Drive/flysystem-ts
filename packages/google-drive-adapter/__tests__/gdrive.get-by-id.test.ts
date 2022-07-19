/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
// eslint-disable new-cap
// eslint-disable no-unused-vars
import { config } from 'dotenv';
import { Flysystem } from '@flysystem-ts/flysystem';
import { drive_v3, google, Auth } from 'googleapis';
import { GDriveAdapter } from '../src/index';

config({ path: '.test.env' });

const { GDRIVE_ACCESS } = process.env;

describe('GDrive: .getById()', () => {
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

    it('Should return file by id', async () => {
        const item = originFiles.pop();
        const res = await flysystem.getById(item?.id || 'any-origin-files....');

        expect(res.id).toBe(item?.id);
    });
});
