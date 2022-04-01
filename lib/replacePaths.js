// Inspired from https://github.com/markokajzer/discord-soundbot
// MIT License - Copyright (c) 2020 Marko Kajzer
const path = require('path');
const replace = require('replace-in-file');
const tsconfig = require('../tsconfig.json');
const pathAliases = tsconfig.compilerOptions.paths;

const from = Object.keys(pathAliases)
    .map(key => new RegExp(`${key.split('/*')[0]}/[^'"]*`, 'g'));

const to = {};
Object.entries(pathAliases).forEach(([key, value]) => {
    const match = key.split('/*')[0];
    to[match] = value[0].split('/*')[0];
});

const options = {
    files: ['dist/**/*.@(j|t)s'],
    from,
    to: (...args) => {
        const [match, , , filename] = args;
        const [replacePattern, ...file] = match.split('/');

        const normalizedRelativePath = path.relative(
            path.join(process.cwd(), path.dirname(filename)),
            path.join(process.cwd(), 'dist', to[replacePattern], ...file)
        );

        const relativePath = normalizedRelativePath.startsWith('.')
            ? normalizedRelativePath
            : `./${normalizedRelativePath}`;

        return relativePath.replace(/\\/g, '/');
    }
};

replace.sync(options);
