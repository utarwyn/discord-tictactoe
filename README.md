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

The bot works **out-of-the-box**. Otherwise if you want to configure it, check [config.example.json][7] file in the config folder.
Create a file called `config.json` to change default options.

> :warning: Check that your Discord bot has these permissions in all channels where games can be played:\
> *"Add reactions", "Manage messages", "Read message history", "Send messages", "View channel"*

Running via Docker
------------

1. Make sure to have Docker installed.
2. Pull the latest image from [DockerHub][1]:\
   `docker pull utarwyn/discord-tictactoe`
3. Start the Docker container by providing Discord API Token:\
   `docker run --name tictactoebot -e TOKEN=YOUR_TOKEN utarwyn/discord-tictactoe`
4. Add `-d` option to run the bot in the background.\
   You can also pass others options with `-e OPTION_NAME=option_value`.
5. Use the option `-v $(pwd)/config/config.json:/app/config/config.json` to load a custom config file.

Running via Node.js
------------

1. Check with `node -v` that you are running at least **Node.js 14.x**.
2. Install the project from [npm][2]:\
   `npm install discord-tictactoe` or `yarn add discord-tictactoe`
3. Use as an independent bot:
   ```javascript
   const TicTacToe = require('discord-tictactoe');
   new TicTacToe({ language: 'en', command: '!ttt' })
     .login('YOUR_BOT_TOKEN')
     .then(() => console.log('TicTacToe bot is ready to be used.'));
   ```
4. **OR** use it in your own bot:
   ```javascript
   const TicTacToe = require('discord-tictactoe');
   const Discord = require('discord.js');
   const client = new Discord.Client();
   
   new TicTacToe({ language: 'fr', command: '-ttt' })
     .attach(client);
   
   client.login('YOUR_BOT_TOKEN');
   ```
5. **OR** use it with a custom command handling system:
   ```javascript
   const TicTacToe = require('discord-tictactoe');
   const Discord = require('discord.js');
   const client = new Discord.Client();
   const game = new TicTacToe({ language: 'de' })
   
   client.on('message', message => {
     if (message.content.startsWith('-tictactoe')) {
       game.handleMessage(message);
     }
   });
   
   client.login('YOUR_BOT_TOKEN');
   ```

License
--------

"Discord TicTacToe" is open-sourced software licensed under the [Apache-2.0 license][3].

---
> GitHub [@utarwyn][4] &nbsp;&middot;&nbsp; Twitter [@Utarwyn][5]


[1]: https://hub.docker.com/r/utarwyn/discord-tictactoe
[2]: https://www.npmjs.com/package/discord-tictactoe
[3]: https://github.com/utarwyn/discord-tictactoe/blob/next/LICENSE
[4]: https://github.com/utarwyn
[5]: https://twitter.com/Utarwyn
[6]: https://discordapp.com/developers/applications
[7]: https://github.com/utarwyn/discord-tictactoe/blob/next/config/config.example.json
