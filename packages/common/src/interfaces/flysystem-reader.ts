import { ReadStream } from 'fs';
import { IStorageAttributes } from './storage-attributes.interface';
import { VisibilityEnum } from '../enum';

export interface IFilesystemReader {
  /**
   * Check whether a file exists.
   *
   * @param {string} location
   * @returns {boolean}
   * @throws FilesystemException
   * @throws UnableToCheckFileExistence
   */
  fileExists(path: string): Promise<boolean>;

  directoryExists(path: string): Promise<boolean>;

  /**
   * Read a file.
   * @param {string} path  file path
   * @returns {false|Array<any>}
   * @throws UnableToReadFile
   * @throws FilesystemException
   */
  read(path: string): Promise<Buffer | string>;

  /**
   * Read a file as a stream.
   * @param path string
   * @return ReadStream
   * @throws
   */
  readStream(path: string): Promise<ReadStream>;

  /**
   * List contents of a directory.
   * @param {string} directory
   * @param {boolean} deep
   * @returns {Promise<Array<IStorageAttributes>>>}
   */
  listContents(directory: string, deep?: boolean): Promise<IStorageAttributes[]>;

  /**
   * @throws UnableToRetrieveMetadata
   * @throws FilesystemException
   */
  lastModified(path: string): Promise<number>;

  /**
   * Get the size of a file.
   *
   * @param {string} path
   *
   * @returns {Array| false}
   */
  fileSize(path: string): Promise<number>;

  /**
   * Get the mimetype of a file.
   *
   * @param path
   *
   * @returns {string}
   * @throws UnableToRetrieveMetadata
   * @throws FilesystemException
   */
  mimeType(path: string): Promise<string>;

  /**
   * Get the visibility of a file.
   * @param {string} path
   *
   * @returns {VisibilityEnum|undefined}
   */
  visibility(path: string): Promise<VisibilityEnum>;
}
