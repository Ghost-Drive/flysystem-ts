export const slashResolver = (path: string) => (path.startsWith('/')
    ? path
    : `/${path}`);
