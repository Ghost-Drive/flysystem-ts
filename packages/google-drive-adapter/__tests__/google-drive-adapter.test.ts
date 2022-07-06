/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import fs from 'fs';
import { join } from 'path';
import { google, Auth } from 'googleapis';
import { Flysystem } from '@flysystem-ts/flysystem';
import { inspect } from 'util';
import { config } from 'dotenv';
import { GoogleDriveAdapter } from '../src';

config({ path: join(__dirname, '../../..', '.test.env') });

const { LOG_MODE } = process.env;
const log = (...args: any[]) => args.forEach((a) => (LOG_MODE === 'debug' ? console.info(inspect(a, { colors: true, depth: null })) : {}));

type CredentialsType = Record<string, any> & { web: any };
type OAuth2Client = Auth.OAuth2Client;
// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
let CREDENTIALS: CredentialsType | null = null;
const TEST_PIC_PATH = join(__dirname, '../../resourses', 'photo-for-test.jpg');

async function _getAccessToken(oAuth2Client: OAuth2Client): Promise<OAuth2Client> {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.info('Authorize this app by visiting this url:', authUrl);
    console.warn('Paste code from this url to .test.env in GDRIVE_AUTH_CODE variable and run tests again');

    return new Promise<Auth.OAuth2Client>((resolve) => {
        const { GDRIVE_AUTH_CODE: code } = process.env;

        if (!code) {
            throw new Error('GDRIVE_AUTH_CODE variable in .test.env is empty');
        }

        oAuth2Client.getToken(code, (authError, token) => {
            if (authError) {
                console.error('Error retrieving access token', authError);
            }

            oAuth2Client.setCredentials(token!);
            // Store the token to disk for later program executions
            fs.writeFile(join(__dirname, '..', TOKEN_PATH), JSON.stringify(token), (fsError) => {
                console.info('Token stored to', TOKEN_PATH);

                resolve(oAuth2Client);
            });
        });
    });
}

async function authorize(credentials: CredentialsType): Promise<OAuth2Client> {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    return new Promise<OAuth2Client>((resolve) => {
        fs.readFile(join(__dirname, '..', TOKEN_PATH), (err, token) => {
            if (!err) {
                const creds = JSON.parse(token.toString()) || {};
                const isFresh = (creds.expiry_date || 0) > (new Date().getTime() + 60 * 1000);

                // Check if access is fresh otherwise - has json refresh
                if (isFresh || creds.refresh_token) {
                    oAuth2Client.setCredentials(creds);

                    return resolve(oAuth2Client);
                }
            }

            return _getAccessToken(oAuth2Client).then(resolve);
        });
    });
}

describe('GoogleDriveAdapter testing', () => {
    let flysystem: Flysystem<GoogleDriveAdapter>;
    let auth: OAuth2Client;
    /**
     * AT FIRST TIME OF TEST'S RUN YOU SHOULD MANUALY CLICK TO LINK IN TERMINAL
     * IT WILL OPEN PAGE WITH ACCESS TOKEN
     * COPY AND PASTE BACK TO CONSOLE
     *
     * (YOU HAVE 40 SECS)
     */
    beforeAll(async () => {
        // Load client secrets from a local file.
        CREDENTIALS = JSON.parse(fs.readFileSync(join(__dirname, '..', 'credentials.json'), { encoding: 'utf-8' }).toString()) as CredentialsType;
        auth = await authorize(CREDENTIALS);
        flysystem = new Flysystem(
            new GoogleDriveAdapter(google.drive({ version: 'v3', auth })),
        );
    }, 3000); // little more than input to give chance correct error appear in console in case of fail

    it('Should return full list of files', async () => {
        const res = await flysystem.listContents();

        expect(res).toBeInstanceOf(Array);
        expect(res.length).not.toBe(0);
    }, 1000 * 10);

    it('Should not contain any like "A" folders', async () => {
        const res = await flysystem.listContents({ type: 'path', value: 'C' });

        expect(res).toBeInstanceOf(Array);
        expect(res.some(({ path }) => /\/A+\//.test(path))).toBe(false);
    }, 1000 * 10);

    it('Should return empty array', async () => {
        const res = await flysystem.listContents({ type: 'path', value: 'EmptyFolder' });

        log(res);

        expect(res).toBeInstanceOf(Array);
        expect(res.length).toBe(0);
    }, 1000 * 10);

    it('Should return folder entries without recurcion', async () => {
        const res = await flysystem.listContents({ value: 'C', type: 'path' }, false);

        expect(res).toBeInstanceOf(Array);
        expect(res.length).not.toBe(0);
        expect(res.reduce((acc, item) => (item.isFile ? acc + 1 : acc), 0)).toBe(1);
    }, 1000 * 10);

    it('Should return true because of file existing', async () => {
        const res = await flysystem.fileExists({ value: '/A/random.pdf', type: 'path' });

        log(res);

        expect(res).toBe(true);
    }, 1000 * 10);

    it('Should return false because of file unexisting', async () => {
        const res = await flysystem.fileExists({ value: '/A/no-such-file.pdf', type: 'path' });

        log(res);

        expect(res).toBe(false);
    }, 1000 * 10);

    it.each([
        { pathOrId: { value: 'C/CC/CCC', type: 'path' as const }, isExists: true },
        { pathOrId: { value: 'N/O/S/U/C/H/F/O/L/D/E/R', type: 'path' as const }, isExists: false },
    ])('Should return is directory exist', async ({ pathOrId, isExists }) => {
        const res = await flysystem.directoryExists(pathOrId);

        log(res);

        expect(res).toBe(isExists);
    });

    it('Should upload picture (stream)', async () => {
        const picName = `pic-${new Date().getTime()}-test.jpg`;
        const path = `B/${picName}`;
        const pathOrId = { value: path, type: 'path' as const };

        await flysystem.writeStream(pathOrId, fs.createReadStream(TEST_PIC_PATH));

        expect(await flysystem.fileExists(pathOrId)).toBe(true);
    });

    it('Should upload picture (buffer)', async () => {
        const picName = `pic-${new Date().getTime()}-test.jpg`;
        const path = `B/${picName}`;
        const pathOrId = { value: path, type: 'path' as const };

        await flysystem.write(pathOrId, fs.readFileSync(TEST_PIC_PATH));

        expect(await flysystem.fileExists(pathOrId)).toBe(true);
    });

    it('Should create directory', async () => {
        const folderName = `new-folder-${new Date().getTime()}-test`;
        const path = `A/${folderName}`;
        const pathOrId = { type: 'path' as const, value: path };

        await flysystem.createDirectory(pathOrId);

        expect(await flysystem.directoryExists(pathOrId)).toBe(true);
    });

    it('Should remove directory', async () => {
        const folderName = `new-folder-${new Date().getTime()}-test`;
        const path = `A/${folderName}`;
        const pathOrId = { type: 'path' as const, value: path };

        await flysystem.createDirectory(pathOrId);

        expect(await flysystem.directoryExists(pathOrId)).toBe(true);

        await flysystem.deleteDirectory(pathOrId);

        expect(await flysystem.directoryExists(pathOrId)).toBe(false);
    }, 10_000);

    it('Should download file', async () => {
        const res = await flysystem.read({ value: '/A/random.pdf', type: 'path' });
        const pathToDownload = join(__dirname, 'downloaded.pdf');

        fs.writeFileSync(pathToDownload, res);

        expect(fs.existsSync(pathToDownload)).toBe(true);

        fs.rmSync(pathToDownload);
    });
});
