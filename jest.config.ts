import { Config } from '@jest/types';
import { config } from 'dotenv';

config({ path: '.test.env' });

const jestConfig: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    moduleDirectories: ['node_modules'],
};

export default async () => jestConfig;
