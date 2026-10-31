import path from 'node:path';

Object.assign(globalThis, {
    __dirname: path.join(process.cwd(), 'test', 'runtime', 'env')
});
