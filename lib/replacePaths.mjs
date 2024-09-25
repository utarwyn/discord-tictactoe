// Inspired from https://github.com/markokajzer/discord-soundbot
// MIT License - Copyright (c) 2020 Marko Kajzer
import { readFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import { replaceInFileSync } from 'replace-in-file';

const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));
const pathAliases = tsconfig.compilerOptions.paths;

const from = Object.keys(pathAliases).map(key => new RegExp(`${key.split('/*')[0]}/[^'"]*`, 'g'));

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

    const normalizedRelativePath = relative(
      join(process.cwd(), dirname(filename)),
      join(process.cwd(), 'dist', to[replacePattern], ...file)
    );

    const relativePath = normalizedRelativePath.startsWith('.')
      ? normalizedRelativePath
      : `./${normalizedRelativePath}`;

    return relativePath.replace(/\\/g, '/');
  }
};

replaceInFileSync(options);
