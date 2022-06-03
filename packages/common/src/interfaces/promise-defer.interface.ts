export interface IPromiseDeferInterface<T> {
  promise: Promise<T>;
  resolve: (it?: T) => void;
  reject: (it: any) => void;
}
