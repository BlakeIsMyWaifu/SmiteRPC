# Smite RPC
Discord Remote Procedural Calls to show your smite match!

## Setup:
* Apply to the [smite api](https://fs12.formsite.com/HiRez/form48/secure_index.html). They accept everyone but you may have to wait a couple hours. They will email you your devId and authKey when you are accepted
* Open config.json in any text editor (notepad should do fine) and put in your username, platform (pc/xbox/ps4), API devId and API authKey
* Download [Node.js](https://nodejs.org/en/) recommended version (must be 8.0.0+)
* Open command prompt and go to the directory you have the files in. To do this type **cd** then the directory
* type **npm install** to install all the dependencies
* type **node app**
* Have fun!

## Additional Notes:
* To stop it just close the command prompt
* Each time you want to run it, open command prompt again and type **node app** in the your directory
* You have to start it **BEFORE** you launch smite. Since smite has added their own ~~garbage~~ discord RPC you have to start this one before because it is the first one that is open that is shown

## Config:
##### Required Config
* username - This is your smite username
* platform - This is the platform you are playing smite on [pc/xbox/ps4]
* devId - The developer ID that is given to you when you apply for the smite API
* authKey - The authentication key that is given to you when you apply for the smite API

##### Optional Config
* checkerInterval - This changes how often it will check your smite status. The lower the interval number the more API calls it will require so be careful
* getAPIUseData - When set to true, each time your status changes it will also tell you how many API calls you have used and how many you have left
* customClientId - If you want to use your own pictures for the gods and gamemodes then add your discord rpc client id here. The file names should be all lowercase with no spaces with the filetype of jpg.

## Contact:
* **Discord:** Blake Belladonna#1608 (id: 166641492113358848)
* **Reddit:** /u/Gazder
