// packages
const md5 = require('md5'),
	moment = require('moment'),
	request = require('request'),
	rp = require('request-promise'),
	chalk = require('chalk'),
	DiscordRPC = require('discord-rpc');

// databases
const config = require('./config.json'),
	queue = require('./queue.json');

// discord rpc set up
const clientId = config.customClientId || '438285137776607242',
	rpc = new DiscordRPC.Client({transport: 'ipc'}),
	startTimestamp = new Date();

// global variables
var activeSession,
	currentActivity,
	platform = ['pc', 'xbox', 'ps4'].includes(config.platform.toLowerCase()) ? config.platform.toLowerCase() : 'pc',
	domain = platform === 'pc' ? 'http://api.smitegame.com/smiteapi.svc/' : `http://api.${platform}.smitegame.com/smiteapi.svc/`,
	devId = config.devId,
	authKey = config.authKey;

// utility functions
const log = (colour, message) => console.log(chalk[colour](`[${moment().format("HH:mm:ss")}] ${message}`)),
	removeAllSpaces = str => str.replace(/\s+/g, '');

// node version checker
if (process.version.slice(1).split('.')[0] < 8) {
	log('red', 'Node version 8.0.0 or higher is required!');
	process.exit(1);
}

// smite api functions
var rpOptions = (method, session = true, para = []) => {
	let timestamp = moment().utc().format('YYYYMMDDHHmmss'),
		signature = md5(devId + method + authKey + moment().utc().format('YYYYMMDDHHmmss'));
		url = `${domain}/${method}Json/${devId}/${signature}`;
	url += session ? `/${activeSession}` : '';
	url += `/${moment().utc().format('YYYYMMDDHHmmss')}`;
	url += para.length > 0 ? `/${para.join('/')}` : '';
	let options = {
		uri: url,
		json: true,
		headers: {'User-Agent': 'Request-Promise'}
	};
	return options;
};
var getData = async (method, session = true, para = []) => {
	let testSession = await rp(rpOptions('testsession')).catch(err => log('red', err));
	if (testSession.startsWith('Invalid session id.')) {
		log('magenta', 'New Session Created');
		let createSession = await rp(rpOptions('createsession', false)).catch(err => log('red', err));
		activeSession = createSession.session_id;
	}
	let data = await rp(rpOptions(method, session, para)).catch(err => log('red', err));
	return data;
};

// discord rpc start
DiscordRPC.register(clientId);
rpc.on('ready', () => {
	rpc.setActivity({
		details: 'Loading . . .',
		largeImageKey: 'logo_png',
		largeImageText: 'Loading . . .',
		instance: false
	});
	log('blue', 'Ready!');
	smiteAPI();
	config.checkerInterval = /^\d+$/.test(config.checkerInterval) ? config.checkerInterval : 15e3;
	setInterval(() => smiteAPI(), config.checkerInterval);
});
rpc.login({clientId}).catch(err => console.log(err));

// starting function
async function smiteAPI() {
	let playerStatus = await getData('getplayerstatus', true, [config.username]).catch(err => log('red', err));
	playerStatus[0].status == 3 ? inGame(playerStatus[0]) : outOfGame(playerStatus[0]);
}

// make RPC for in game
async function inGame({Match, status_string}) {
	let liveMatch = await getData('getmatchplayerdetails', true, [Match]).catch(err => log('red', err)),
		friendsList = await getData('getfriends', true, [config.username]).catch(err => log('red', err)),
		playerData = liveMatch.find(obj => obj.playerName === config.username),
		maxPartySize = liveMatch.length / 2,
		partyCount = 1;
	liveMatch.forEach(player => {
		if (player.taskForce !== playerData.taskForce) return;
		if (friendsList.find(obj => obj.name === player.playerName)) {partyCount++;}
	});
	rpc.setActivity({
		details: queue[playerData.Queue][0],
		state: `Party (${partyCount} / ${maxPartySize})`,
		startTimestamp,
		largeImageKey: removeAllSpaces(playerData.GodName.replace(/_/g, '')).toLowerCase() + '_jpg',
		largeImageText: playerData.GodName.replace(/_/g, ' '),
		smallImageKey: queue[playerData.Queue][1] + '_png',
		smallImageText: queue[playerData.Queue][1].replace(/^\w/, c => c.toUpperCase()),
		instance: false
	}).catch(err => log('red', err));
	if (currentActivity !== status_string) {
		let god = playerData.GodName.replace(/_/g, ' ');
		let gamemode = queue[playerData.Queue][1].replace(/^\w/, c => c.toUpperCase());
		log('green', `RPC: God=${god} Gamemode=${gamemode}`);
		currentActivity = status_string;
		if (config.getAPIUseData) getDataUsed();
	}
}

// make RPC for out of game
function outOfGame({status_string}) {
	if (currentActivity !== status_string) {
		log('green', `RPC: ${status_string}`);
		currentActivity = status_string;
		if (config.getAPIUseData) getDataUsed();
	}
	rpc.setActivity({
		details: status_string,
		largeImageKey: 'logo_png',
		largeImageText: status_string,
		instance: false
	}).catch(err => log('red', err));
}

async function getDataUsed() {
	let apiData = await getData('getdataused');
	apiData = apiData[0];
	log('yellow', `Active Sessions: ${apiData.Active_Sessions} / ${apiData.Concurrent_Sessions}`);
	log('yellow', `Daily Sessions: ${apiData.Total_Sessions_Today} / ${apiData.Session_Cap}`);
	log('yellow', `Daily Requests: ${apiData.Total_Requests_Today} / ${apiData.Request_Limit_Daily}`);
}
