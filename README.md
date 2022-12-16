<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://i.imgur.com/hzVv8Cx.png">
  <source media="(prefers-color-scheme: light)" srcset="https://i.imgur.com/d9ldRKK.png">
  <img alt="Discord TicTacToe logo" src="https://i.imgur.com/d9ldRKK.png">
</picture>

<h4 align="center">
An innovative Bot for playing Tic Tac Toe on Discord!
<br>
Created with <a href="https://github.com/discordjs/discord.js">discord.js</a>.
</h4>

<p align="center">
   <a href="https://sonarcloud.io/dashboard?id=utarwyn_discord-tictactoe">
      <img src="https://sonarcloud.io/api/project_badges/measure?project=utarwyn_discord-tictactoe&metric=alert_status" alt="Quality Gate Status">
   </a>
   <a href="https://npmjs.com/package/discord-tictactoe">
      <img alt="npm" src="https://img.shields.io/npm/v/discord-tictactoe">
   </a>
   <a href="https://hub.docker.com/r/utarwyn/discord-tictactoe">
      <img src="https://img.shields.io/github/actions/workflow/status/utarwyn/discord-tictactoe/publish_docker.yml?label=docker%20build&branch=next" alt="Docker Build status">
   </a>
   <a href="https://github.com/utarwyn/discord-tictactoe/blob/next/LICENSE">
      <img src="https://img.shields.io/github/license/utarwyn/discord-tictactoe" alt="License">
   </a>
</p>

<p align="center">
    <img src="https://i.imgur.com/QB7z1j4.gif" alt="demo">
</p>

"Discord TicTacToe" is a **self-hosted NodeJS bot** which allows you to play the popular TicTacToe game on Discord.
Invite your friends or play against our robot, a fearsome opponent. Use `/tictactoe` command to challenge someone else
and use buttons to play, so simple! Works **out-of-the-box**, no configuration needed.

If you have a problem when using the bot, or you want to propose a new feature, feel free to open an issue.

Have fun! 🥳


Requirements
------------

Before installing the bot, you need to create your own [Discord Application][6].
Then, you can install the bot via Docker or npm (check below!). If you are not a programmer, I recommend you to opt for Docker because its the easiest solution.

> ⚠️ Make sure your Discord bot has these permissions in all channels where games can be played:
> "Read message history", "Send messages", "View channel", "Application commands" or "Add reactions" depending on what you plan to use.


Installation
------------

The module is suitable for discord.js ~~v12~~, **v13** and **v14**. Check the table below to see which version meets your needs.

discord.js | Node.JS | Module version | Status | NPM package          | Docker image                |
---------- | ------- | -------------- | ------ | -------------------- | --------------------------- |
v14.*      | 16.9+   | v4.*           | Active | discord-tictactoe@^4 | utarwyn/discord-tictactoe@4 |
v13.*      | 16.6+   | v3.*           | Active | discord-tictactoe@^3 | utarwyn/discord-tictactoe@3 |
v12.*      | 14+     | v2.*           | Legacy | discord-tictactoe@^2 | utarwyn/discord-tictactoe@2 |

The bot works **out-of-the-box**. But if you want to configure it, check [config.example.json][7] file in the config folder.

> 🔥 Discord buttons are only supported from **v3 of the module**.


Running via Docker
------------

1. Make sure to have Docker installed.
2. Start Docker container based on one of our [DockerHub images][1] using an API token:\
   `docker run -e TOKEN=YOUR_TOKEN utarwyn/discord-tictactoe@4`
3. You can pass options directly with `-e OPTION_NAME=option_value` or use the option `-v $(pwd)/config/config.json:/app/config/config.json` to load an entire config file.


Running via Node.js
------------

1. Check with `node -v` that you are running appropriate Node.js version.
2. Install the project from [npm][2]:\
   `npm install discord-tictactoe@^4` or `yarn add discord-tictactoe@^4`
3. Import module into your script:
   ```javascript
   const TicTacToe = require('discord-tictactoe');
   ```
4. Check usage examples in this [wiki page][10].


Setup slash command ✨
--------

Slash command are enabled by default **starting from v3**!\
Just mention the bot with `tttdeploy` somewhere in your server to install it (admin only).

🚀 Want more info? Check [this detailed guide][8].


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
[8]: https://github.com/utarwyn/discord-tictactoe/wiki/Using-slash-command-in-V3-and-V4
[9]: https://github.com/utarwyn/discord-tictactoe/wiki/Using-slash-command-in-V2
[10]: https://github.com/utarwyn/discord-tictactoe/wiki/Usage-examples-with-Node.js
