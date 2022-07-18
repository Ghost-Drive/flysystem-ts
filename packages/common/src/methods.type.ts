import { MethodEnum } from './method.enum';

export type MethodsType<
    T extends MethodEnum | never = never,
    > = Record<T, (...args: unknown[]) => (Promise<unknown> | unknown)>;
