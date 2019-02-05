# Smite RPC
Discord Remote Procedural Calls to show your smite match!

## Setup:
* Apply to the [smite api](https://fs12.formsite.com/HiRez/form48/secure_index.html). They accept everyone but you may have to wait a couple hours. They will email you your devId and authKey when you are accepted
* Open config.json in any text editor (notepad should do fine) and put in your username, platform (pc/xbox/ps4), api devId and api authKey
* Download [Node.js](https://nodejs.org/en/) recommended version
* Open command prompt and go to the directory you have the files in. To do this type **cd** then the directory
* type **npm install** to install all the dependencies
* type **node app**
* Have fun!
Each time you want to run it, open command prompt again and type **node app** in the your directory

## Settings:
There are 3 different settings you can change inside config.json
* showRateLimit - When true it will show you have many sessions and calls you have left today with the smite api. It will NOT run the RPC!
* offline - When true it will show when you are offline
* log - When true will log http requests to help debug if something goes wrong
The settings should always be true or false depending on what you want

## Contact:
* **Discord:** Blake Belladonna#1608 (id: 166641492113358848)
* **Reddit:** /u/Gazder

## Forever:
It can be a pain to turn it on each time you get on smite and off when you get on. You can use something called forvever so that it will always be running in the background, forever. It will containly be using your CPU but VERY little. To download forever type **npm install forever -g** into command prompt, that it all. When you want to start the smite RPC type **forever start app.js** in your directory. You can close your command prompt and it will still be running. To stop it again type **forever stop app.js** in your directory. I highly recommend you change the settings in config.json so that offline is false.