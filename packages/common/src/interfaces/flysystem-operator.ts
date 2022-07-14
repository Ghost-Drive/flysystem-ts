import { IFilesystemReader } from './flysystem-reader';
import { IFilesystemWriter } from './flysystem-writer';

export interface IFilesystemOperator extends IFilesystemReader, IFilesystemWriter {}
