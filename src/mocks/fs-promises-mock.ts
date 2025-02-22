// Mock implementation of fs/promises for browser environments

class BrowserFSError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'BrowserFSError';
    this.code = code;
  }
}

const createError = (operation: string, path: string) => {
  return new BrowserFSError(
    `ENOENT: Cannot perform ${operation} on '${path}' in browser environment`,
    'ENOENT'
  );
};

export const readFile = async (path: string, encoding?: BufferEncoding) => {
  throw createError('readFile', path);
};

export const writeFile = async (path: string, data: string | Buffer) => {
  throw createError('writeFile', path);
};

export const mkdir = async (path: string) => {
  throw createError('mkdir', path);
};

export const readdir = async (path: string) => {
  throw createError('readdir', path);
};

export const access = async (path: string) => {
  throw createError('access', path);
};

export const copyFile = async (src: string, dest: string) => {
  throw createError('copyFile', src);
};

export const rename = async (src: string, dest: string) => {
  throw createError('rename', src);
};

export const stat = async (path: string) => {
  throw createError('stat', path);
};

export const unlink = async (path: string) => {
  throw createError('unlink', path);
};

export const open = async (path: string, flags?: string) => ({
  readFile: async () => { throw createError('readFile', path); },
  writeFile: async () => { throw createError('writeFile', path); },
  close: async () => {}
});

export const constants = {
  O_RDWR: -1,
  O_CREAT: -1
};

// Export all functions as default object
const fsPromisesMock = {
  readFile,
  writeFile,
  mkdir,
  readdir,
  access,
  copyFile,
  rename,
  stat,
  unlink,
  open,
  constants
} as unknown as typeof import('fs/promises');

export default fsPromisesMock;