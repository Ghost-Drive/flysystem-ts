import { Adapter } from '@flysystem-ts/adapter-interface';
import {
    DeleteById, DownloadById, FlysystemException, GetById, MakeDirById, UploadById,
} from '@flysystem-ts/common';

type FullAdapter = Adapter & GetById & DeleteById & UploadById & DownloadById & MakeDirById;

export class Flysystem {
    private constructor(private adapter: FullAdapter) {}

    private resolveOrReject<T extends any>(res: Promise<T>): Promise<T> {
        return res.catch((error) => {
            if (error instanceof FlysystemException) { throw error; }

            throw this.adapter.exceptionsPipe(error);
        });
    }

    public static init<
        T extends Partial<Omit<FullAdapter, 'exceptionsPipe'>> & Adapter
    >(adapter: T) {
        return new Flysystem(adapter as unknown as FullAdapter) as unknown as Omit<T, 'exceptionsPipe'>;
    }

    getById(id: string) {
        return this.resolveOrReject(this.adapter.getById(id));
    }

    mkdirById(options: {
        name: string,
        parentId?: string
    }) {
        return this.resolveOrReject(this.adapter.mkdirById(options));
    }

    uploadById(data: Buffer, metadata: {
        name: string,
        mimeType?: string,
        parentId?: string,
    }) {
        return this.resolveOrReject(this.adapter.uploadById(data, metadata));
    }

    deleteById(id: string, soft = false) {
        return this.resolveOrReject(this.adapter.deleteById(id, soft));
    }

    downloadById(id: string) {
        return this.resolveOrReject(this.adapter.downloadById(id));
    }
}
