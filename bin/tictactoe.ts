#!/usr/bin/env node

import ConfigProvider from '@config/ConfigProvider';
import TicTacToe from '../src';

const bot = new TicTacToe(new ConfigProvider());
bot.connect().then(() => console.log('Bot is now connected to Discord. Check your server!'));
