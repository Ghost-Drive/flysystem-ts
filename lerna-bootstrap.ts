/* eslint-disable no-use-before-define */
/* eslint-disable arrow-body-style */
import { spawn } from 'child_process';

const CORE_DEPENDENCIES = [
    '@flysystem-ts/common',
    '@flysystem-ts/adapter-interface',
];
const CORE_DEV_DEPENDENCIES = [
    '@flysystem-ts/flysystem',
];
const SORTED_CORE_PACKAGES = [
    ...CORE_DEPENDENCIES,
    ...CORE_DEV_DEPENDENCIES,
];
const ADAPTER_PACKAGES = [
    '@flysystem-ts/drop-box-adapter',
    '@flysystem-ts/google-drive-adapter',
];
const uninstallScript = `npx lerna exec npm uninstall ${SORTED_CORE_PACKAGES.join(' ')}`;
const corePackageBootstrapingScript = SORTED_CORE_PACKAGES
    .reduce((acc, p, i) => {
        let total = acc;

        for (let j = 0; j < i; ++j) {
            total += `npx lerna add ${SORTED_CORE_PACKAGES[j]} --scope=${p} && `;
        }

        total += `npx lerna exec npm i --scope=${p} && `;
        total += `npx lerna run build --scope=${p}`;

        return i === SORTED_CORE_PACKAGES.length - 1
            ? total
            : `${total} && `;
    }, '');
const allAdaptersBootstrapingScript = ADAPTER_PACKAGES
    .reduce((acc, p, i) => acc.concat(
        ...CORE_DEPENDENCIES.map((d) => `npx lerna add ${d} --scope=${p} && `),
        ...CORE_DEV_DEPENDENCIES.map((d) => `npx lerna add -D ${d} --scope=${p} && `),
        `npx lerna exec npm i --scope=${p} && `,
        `npx lerna run build --scope=${p}`,
        i === ADAPTER_PACKAGES.length - 1
            ? ''
            : ' && ',
    ), '');

async function bootstrap() {
    await execInShell(uninstallScript);
    await corePackageBootstrapingScript
        .split(' && ')
        .reduce((acc, c) => acc.then(() => execInShell(c)), Promise.resolve() as Promise<unknown>);
    await allAdaptersBootstrapingScript
        .split(' && ')
        .reduce((acc, c) => acc.then(() => execInShell(c)), Promise.resolve() as Promise<unknown>);
    await execInShell('npx lerna bootstrap');

    console.log([
        uninstallScript,
        corePackageBootstrapingScript,
        allAdaptersBootstrapingScript,
    ]);
}

bootstrap();

function makePause(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(null), sec);
    });
}

function execInShell(command: string, pause = 0) {
    return new Promise((resolve, reject) => {
        const [_command, ..._args] = command.split(' ');
        const child = spawn(_command, _args).on('exit', () => {
            makePause(pause).then(resolve).catch(reject);
        }).on('error', (err) => {
            console.error('=== ERROR ===');

            reject(err);
        });

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        process.stdin.pipe(child.stdin);
    });
}
