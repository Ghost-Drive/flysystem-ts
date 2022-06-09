declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DBX_ACCESS: string,
        GDRIVE_AUTH_CODE: string,
      }
    }
  }

export { };
