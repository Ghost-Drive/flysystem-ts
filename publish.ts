import { exec } from 'child_process';

function makePause(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(null), sec);
    });
}

function execInShell(command: string, pause = 0) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stout, sterr) => {
            if (stout) {
                console.info(stout);
            }

            if (err) {
                console.error('==== ERROR ====');
                console.error(err);
                console.error('==== ERROR ====');
                reject(err);
            }

            if (sterr) {
                console.error(sterr.split('\n').map((l) => ' '.repeat(50) + l).join('\n'));
            }
        }).on('error', (err) => {
            console.error('==== ERROR ====');
            console.error(err);
            console.error('==== ERROR ====');
        }).on('exit', () => {
            makePause(pause).then(resolve).catch(reject);
        });
    });
}

async function publish() {
    // await execInShell('npm run _0_uninstall');

    // await execInShell('npm run _1_install');
    // await execInShell('npm run _1_build');

    // await execInShell('npm run _2_install');
    // await execInShell('npm run _2_build');

    // await execInShell('npm run _3_1_install');
    // await execInShell('npm run _3_2_install');
    // await execInShell('npm run _3_build');

    // await execInShell('npm run _4_1_install');
    // await execInShell('npm run _4_2_install');
    // await execInShell('npm run _4_3_install');
    // await execInShell('npm run _4_4_install');
    // await execInShell('npm run _4_build');

    // await execInShell('npm run _5_1_install');
    // await execInShell('npm run _5_2_install');
    // await execInShell('npm run _5_3_install');
    // await execInShell('npm run _5_4_install');
    // await execInShell('npm run _5_build');

    // await execInShell('npx lerna bootstrap');

    await execInShell('cd packages/common && npx lerna publish', 5);
    await execInShell('cd packages/adapter-interface && npx lerna publish', 5);
    await execInShell('cd packages/flysystem && npx lerna publish', 5);
}

publish();
