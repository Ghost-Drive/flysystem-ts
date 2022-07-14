export type RequirePart<T, K extends keyof T> = Partial<T> &
  {
    [P in K]-?: T[P];
  };
