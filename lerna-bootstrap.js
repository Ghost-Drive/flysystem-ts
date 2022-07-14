/* eslint-disable */
const { spawn } = require('child_process');
const DotJson = require('dot-json');
const { join } = require('path');

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
    '@flysystem-ts/one-drive-adapter',
];
const script_UNINSTALL = `npx lerna exec npm uninstall ${SORTED_CORE_PACKAGES.join(' ')}`;
const corePackageBootstrapingScript = SORTED_CORE_PACKAGES
    .reduce((acc, p, i) => {
        // const path = join(__dirname, 'packages', p.split('/')[1], 'package.json');
        // const packageJson = new DotJson(path);
        // console.log(path);
        // const dependencies = packageJson.get('dependencies') || {};
        // SORTED_CORE_PACKAGES.forEach((s) => delete dependencies[s]);
        let total = acc;
        // ${Object.keys(dependencies).join(' ')}

        total += `npx lerna exec npm i --scope=${p} && `;

        for (let j = 0; j < i; ++j) {
            total += `npx lerna add ${SORTED_CORE_PACKAGES[j]} --scope=${p} && `;
        }

        total += `npx lerna run build --scope=${p}`;

        return i === SORTED_CORE_PACKAGES.length - 1
            ? total
            : `${total} && `;
    }, '');
const allAdaptersBootstrapingScript = ADAPTER_PACKAGES
    .reduce((acc, p, i) => acc.concat(
        `npx lerna exec npm i --scope=${p} && `,
        ...CORE_DEPENDENCIES.map((d) => `npx lerna add ${d} --scope=${p} && `),
        ...CORE_DEV_DEPENDENCIES.map((d) => `npx lerna add -D ${d} --scope=${p} && `),
        `npx lerna run build --scope=${p}`,
        i === ADAPTER_PACKAGES.length - 1
            ? ''
            : ' && ',
    ), '');

async function bootstrap() {
    await execInShell(script_UNINSTALL);
    console.log(corePackageBootstrapingScript
        .split(' && '));
    console.log(allAdaptersBootstrapingScript
        .split(' && '));
    await corePackageBootstrapingScript
        .split(' && ')
        .reduce((acc, c) => acc.then(() => execInShell(c)), Promise.resolve());
    await allAdaptersBootstrapingScript
        .split(' && ')
        .reduce((acc, c) => acc.then(() => execInShell(c)), Promise.resolve());
    await execInShell('npx lerna bootstrap');
}

bootstrap();

function makePause(sec) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(null), sec);
    });
}

function execInShell(command, pause = 0) {
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
