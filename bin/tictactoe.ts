#!/usr/bin/env node

import ConfigProvider from '../src/config/ConfigProvider';
import TicTacToeBot from '../src';

const bot = new TicTacToeBot(new ConfigProvider());
bot.connect();
