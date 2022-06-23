import { spawn } from 'child_process';

function makePause(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(null), sec);
    });
}

function execInShell(command: string, args: string[] = [], pause = 0) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args).on('exit', () => {
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

async function bootstrap() {
    await execInShell('npm', ['run', '_0_uninstall']);

    await execInShell('npm', ['run', '_1_install']);
    await execInShell('npm', ['run', '_1_build']);

    await execInShell('npm', ['run', '_2_install']);
    await execInShell('npm', ['run', '_2_build']);

    await execInShell('npm', ['run', '_3_1_install']);
    await execInShell('npm', ['run', '_3_2_install']);
    await execInShell('npm', ['run', '_3_build']);

    await execInShell('npm', ['run', '_4_1_install']);
    await execInShell('npm', ['run', '_4_2_install']);
    await execInShell('npm', ['run', '_4_3_install']);
    await execInShell('npm', ['run', '_4_4_install']);
    await execInShell('npm', ['run', '_4_build']);

    await execInShell('npm', ['run', '_5_1_install']);
    await execInShell('npm', ['run', '_5_2_install']);
    await execInShell('npm', ['run', '_5_3_install']);
    await execInShell('npm', ['run', '_5_4_install']);
    await execInShell('npm', ['run', '_5_build']);

    await execInShell('npx', ['lerna', 'bootstrap']);
}

bootstrap();
