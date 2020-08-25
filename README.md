![Discord TicTacToe logo](https://i.imgur.com/d9ldRKK.png)

<h4 align="center">
An innovative Bot for playing Tic Tac Toe on Discord!
<br>
Created with <a href="https://github.com/discordjs/discord.js">discord.js</a>.
</h4>

<p align="center">
    <a href="https://github.com/utarwyn/discord-tictactoe/actions">
        <img src="https://github.com/utarwyn/discord-tictactoe/workflows/Node.js%20CI/badge.svg" alt="Node.js CI">
    </a>
    <a href="https://hub.docker.com/r/utarwyn/discord-tictactoe">
        <img src="https://img.shields.io/docker/cloud/build/utarwyn/discord-tictactoe" alt="Docker Build status">
    </a>
    <a href="https://github.com/utarwyn/discord-tictactoe/releases">
        <img src="https://img.shields.io/github/package-json/v/utarwyn/discord-tictactoe" alt="Npm version">
    </a>
    <a href="https://github.com/utarwyn/discord-tictactoe/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/utarwyn/discord-tictactoe" alt="License">
    </a>
</p>

<p align="center">
    <img src="https://i.imgur.com/bfl7wwm.gif" alt="demo">
</p>

"Discord TicTacToe" is a **self-hosted NodeJS bot** which allows you to play the popular TicTacToe game on Discord.
Invite your friends or play against our robot, a fearsome opponent. Type `!ttt` to challenge someone else and use reactions to play, so simple!
Works **out-of-the-box**, no configuration needed.

If you have a problem when using the bot, or you want to propose a new feature, feel free to open an issue.

Have fun!

> A **SaaS-based bot** (hosted solution) is under consideration. More info soon!

Installation
------------

Before installing the bot, you need to create your own [Discord Application][6].
Then, you can install the bot via Docker or npm (check below!). If you are not a programmer, I recommend you to opt for Docker because its the simplest solution.

The bot works **out-of-the-box**. Otherwise if you want to configure it, check the file `config.example.json` in the config folder.
Create a file called `config.json` to change default options.

Running via Docker
------------

1. Make sure to have Docker installed.
2. Pull the latest image from [DockerHub][1]:\
   `docker pull utarwyn/discord-tictactoe`
3. Start the Docker container by providing Discord Client ID and Token:\
   `docker run --name tictactoebot -e CLIENT_ID=YOUR_CLIENT_ID -e TOKEN=YOUR_TOKEN utarwyn/discord-tictactoe`
4. Add `-d` option to run the bot in the background.\
   You can also pass others options with `-e OPTION_NAME=option_value`.
5. Use the option `-v $(pwd)/config/config.json:/app/config/config.json` to load a custom config file.

Use it in your project
------------

1. Install the project from [npm][2]:\
   `npm install discord-tictactoe` or `yarn add discord-tictactoe`
2. Use as an independent bot:
   ```javascript
   const TicTacToe = require('discord-tictactoe');
   const bot = new TicTacToe({
     clientId: 'YOUR_CLIENT_ID',
     token: 'YOUR_BOT_USER_TOKEN',
     language: 'en',
     command: '!ttt'
   }); 
   bot.connect().catch(() => console.error("Cannot connect TicTacToe bot"));
   ```
3. **OR** use it in your own bot:
   ```javascript
   const TicTacToe = require('discord-tictactoe');
   const Discord = require('discord.js');
   const yourBot = new Discord.Client();
   
   new TicTacToe({
     language: 'fr',
     command: '!ttt'
   }, yourBot);
   
   yourBot.login('YOUR_BOT_TOKEN');
   ```

License
--------

"Discord TicTacToe" is open-sourced software licensed under the [Apache-2.0 license][3].

---
> GitHub [@utarwyn][4] &nbsp;&middot;&nbsp; Twitter [@Utarwyn][5]


[1]: https://hub.docker.com/r/utarwyn/discord-tictactoe
[2]: https://www.npmjs.com/package/discord-tictactoe
[3]: https://github.com/utarwyn/discord-tictactoe/blob/master/LICENSE
[4]: https://github.com/utarwyn
[5]: https://twitter.com/Utarwyn
[6]: https://discordapp.com/developers/applications
