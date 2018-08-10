const config = require('./config.json');
const DiscordRPC = require('discord-rpc');
const md5 = require('md5');
const moment = require('moment');
const request = require('request');
const Enmap = require('enmap');
smite = new Enmap();
const clientId = '438285137776607242';
DiscordRPC.register(clientId);
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const startTimestamp = new Date();

let domain = {
	"pc": 'http://api.smitegame.com/smiteapi.svc',
	"xbox": 'http://api.xbox.smitegame.com/smiteapi.svc',
	"ps4": 'http://api.ps4.smitegame.com/smiteapi.svc'
};
domain = domain[config.platform];
let q = {
	"435": "Arena",
	"448": "Joust",
	"426": "Conquest",
	"445": "Assault",
	"466": "Clash",
	"495": "Adventure",
	"451": "Ranked Conquest",
	"434": "MOTD",
	"459": "Siege",
	"450": "Ranked Joust",
	"440": "Duel",
	"441": "Custom Joust",
	"457": "Arena (vs AI) Easy",
	"468": "Arena (vs AI) Medium",
	"436": "Basic Tutorial",
	"438": "Custom Arena",
	"429": "Custom Conquest"
};
const log = (msg) => console.log(`[${moment().utc().format('HH:mm:ss')}] ${msg}`);
const requestErr = (err, res) => {
	if (err || res.statusCode !== 200) {
		log(`Error: ${err}\nCode: ${res.statusCode}`);
	}
};
const createSignature = (method) => {return md5(config.devId + method + config.authKey + moment().utc().format('YYYYMMDDHHmmss'))};
const createURL = (method, session, para) => {
	let url = `${domain}/${method}Json/${config.devId}/${createSignature(method)}`;
	url += session ? `/${smite.get('session')}` : '';
	url += `/${moment().utc().format('YYYYMMDDHHmmss')}`;
	url += para.length > 0 ? `/${para.join('/')}` : '';
	return url;
};

function smiteApi() {
	request.get({
		url: createURL('testsession', true, []),
		json: true,
		headers: {'User-Agent': 'request'}
	}, (err, res, data) => {
		requestErr(err, res);
		let message = data.split(' ');
		message = message[0] + message[1] + message[2];
		if (message === "Invalidsessionid.") {
			request.get({
				url: createURL('createsession', false, []),
				json: true,
				headers: {'User-Agent': 'request'}
			}, (err, res, data) => {
				requestErr(err, res);
				smite.set('session', data.session_id);
				smiteApi();
			});
		} else {
			if (config.showRateLimit) {
				request.get({
					url: createURL('getdataused', true, []),
					json: true,
					headers: {'User-Agent': 'request'}
				}, (err, res, data) => {
					requestErr(err, res);
					console.log(`Requests: ${data[0].Total_Requests_Today} / ${data[0].Request_Limit_Daily}`);
					console.log(`Sessions: ${data[0].Total_Sessions_Today} / ${data[0].Session_Cap}`);
					process.exit(1);
				});
			} else {
				request.get({
					url: createURL('getplayerstatus', true, [config.username]),
					json: true,
					headers: {'User-Agent': 'require'}
				}, (err, res, data) => {
					requestErr(err, res);
					if (data[0].Match !== 0) {
						if (smite.get('match') === undefined) {
							request.get({
								url: createURL('getmatchplayerdetails', true, [data[0].Match]),
								json: true,
								headers: {'User-Agent': 'request'}
							}, (err, res, matchData) => {
								request.get({
									url: createURL('getfriends', true, [config.username]),
									json: true,
									headers: {'User-Agent': 'request'}
								}, (err, res, friendData) => {
									var p = matchData.find(function(obj) {return obj.playerName === config.username});
									var maxPartySize = matchData.length / 2;
									var partyCount = 1;
									for (let player of matchData) {
										if (player.taskForce === p.taskForce) {
											let f = friendData.find(function(obj) {return obj.name === player.playerName});
											if (f !== undefined) {partyCount++;}
										}
									}
									rpc.setActivity({
										details: q[p.Queue],
										state: `Party (${partyCount} / ${maxPartySize})`,
										startTimestamp,
										largeImageKey: p.GodName.replace(/_/g, '').toLowerCase() + '_jpg',
										largeImageText: p.GodName,
										instance: false
									});
									smite.set('match', p.Match);
									log('Match Started');
								});
							});
						}
					} else if (data[0].status === 0 || data[0].status === 5) {
						rpc.setActivity({
							details: 'Offline',
							largeImageKey: 'logo_png',
							largeImageText: 'Offline',
							instance: false
						});
						if (smite.get('match') !== undefined) {
							log('Offline');
							smite.delete('match');
						}
					} else {
						rpc.setActivity({
							details: 'Main Menu',
							largeImageKey: 'logo_png',
							largeImageText: 'Main Menu',
							instance: false
						});
						if (smite.get('match') !== undefined) {
							log('Main Menu');
							smite.delete('match');
						}
					}
				});
			}
		}
	});
}

async function setActivity() {
	if (!rpc) return;
	smiteApi();
}

rpc.on('ready', () => {
	setActivity();
	log('Ready!');
	setInterval(() => {
		setActivity();
	}, 15e3);
});

rpc.login({clientId}).catch(console.error);
