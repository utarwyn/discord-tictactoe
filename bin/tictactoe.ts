#!/usr/bin/env node

import ConfigProvider from '@config/ConfigProvider';
import TicTacToe from '../src';

new TicTacToe(new ConfigProvider())
    .login()
    .then(() => console.log('TicTacToe module ready to be used. Check your Discord server!'));
