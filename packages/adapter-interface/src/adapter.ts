import {
    FlysystemException,
} from '@flysystem-ts/common';

export interface Adapter {
    exceptionsPipe<E extends Error = Error>(error: E): FlysystemException,
}
