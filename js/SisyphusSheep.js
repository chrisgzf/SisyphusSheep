var SisyphusSheepGame = function(){
	var self = this;
	var sheep;
	var startGameFn;

	this.isOnline = navigator.onLine;

	this._gameStarted = false;
	this._runToStartGame = false;

	//Canvas and Controls
	this.hwratio = 9/16; //most screens are of game resolution
	this.canvasWidth = 1600;
	this.canvasHeight = 900;

	this.controls = {
		"movement": {
			"keys": [39], //Down-Arrow, S
			"callback": "heroRun",
			"keyup": true,
			"keydown": true
		},
		"sprint": {
			"keys": [32], //Right Arrow, D, Space
			"callback": "heroSprint",
			"keyup": true,
			"keydown": true
		},
		"pause": {
			"keys": ["P".charCodeAt(), 27], //P, Esc
			"callback": "togglePause",
			"keyup": true,
			"keydown": false
		},
		"muteMain": {
			"keys": ["M".charCodeAt()], //M
			"callback": "toggleMuteMain",
			"keyup": true,
			"keydown": false
		},
		"muteFX": {
			"keys": ["M".charCodeAt()], //M
			"callback": "toggleMuteFX",
			"keyup": true,
			"keydown": false
		},
		"info": {
			"keys": ["I".charCodeAt()], //I
			"callback": "showInfo",
			"keyup": true,
			"keydown": false
		},
		"store": {
			"keys": ["S".charCodeAt()], //S
			"callback": "showShop",
			"keyup": true,
			"keydown": false
		}
	};

	//-Upgrades
	/* NOTE:
		- The name in this.upgrades refers to the variable name that will be incremented
		- Chances
	*/
	this.upgrades = {
		"powerupChance": {
			"title": "Power Boost",
			"desc": "Increases chance that a powerup will spawn",
			"increment_value": 0.05,
			"max_increments": 5,
			"increment_count": 0,
			"type": "chance",
			"cost": 100,
			"value": 0.2
		},
		"noDeathChance": {
			"title": "Adrenaline",
			"desc": "Increases chance that you won't die from a spike",
			"increment_value": 0.025,
			"max_increments": 5,
			"increment_count": 0,
			"type": "chance",
			"cost": 250,
			"value": 0
		},
		"shieldTimeInc": {
			"title": "Protection",
			"desc": "Increases time shield powerup is active",
			"increment_value": 20,
			"max_increments": 10,
			"increment_count": 0,
			"type": "time",
			"cost": 200,
			"value": 500
		},
		"obstaclesFreezeTime": {
			"title": "Sub-Zero",
			"desc": "Increases time freeze powerup is active",
			"increment_value": 200,
			"max_increments": 10,
			"increment_count": 0,
			"type": "time",
			"cost": 200,
			"value": 3000
		},
		"startingShield": {
			"title": "Armour",
			"desc": "Gives a starting shield on every new game",
			"increment_value": 1,
			"max_increments": 1,
			"increment_count": 0,
			"type": "one-off",
			"cost": 5000,
			"value": false
		},
		"coinIncAmt": {
			"title": "Merchant",
			"desc": "Increases the amount of coins earned per powerup",
			"increment_value": 10,
			"max_increments": 9,
			"increment_count": 0,
			"type": "value",
			"cost": 100,
			"value": 20
		}
	};
	this.upgradesSection = {};

	//Hero
	this.hero = null;
	this.heroShield = null;

	this.heroStartX = {
		"min": this.canvasWidth*(1/3),
		"max": this.canvasWidth*(1/5),
		"inc": this.canvasWidth*(1/60)
	}

	this.heroSpeed = 5.5;
	this.heroSpeed_lamb = 7.5;

	this.startingShield = this.upgrades.shieldTimeInc.value;
	this.shieldTimer = null;
	this.shieldTimeInc = this.upgrades.shieldTimeInc.value; //ms
	this.shieldFadeInc = 0.1;

	this.preventHeroMovement = 0;

	this.defOptions = {
		"muteFX":false,
		"muteMain":false
	};

	this.portalsPassed = 0;
	this.portalsScore = 5;
	this.portalsScoreMultiplier = 1.1;

	this.score = 0;
	this.highscore = 0;

	this.scoreTimer = null;
	this.scorePerSecond = 1;

	this.scoreText = null;
	this.overSym = null;
	this.highscoreText = null;

	this.sprint = {
		"level": 100,
		"inc": 0.1,
		"dec": 1,
		"portalInc":10,
		"multiplier": 1.8,
		"circle": null
	};

	this._paused = false;
	this._musicMuted = false;
	this._FXMuted = false;

	this.startScreen = null;
	this.loadingBar = null;

	this.fadeObjects = null;
	this.fadeInTimer = null;

	//Treadmill
	this.heroSpeed_default = 13;
	this.heroSpeed_lamb = 12.5;
	this.heroSpeed = this.heroSpeed_default; //cannot be below treadmillMaxSpeed

	this.treadmill = null;
	this.treadmillMinSpeed = 6;
	this.treadmillMaxSpeed = 11;
	this.treadmillIncSpeed = 1.25;

	//Playing buttons
	this.playButtons = null;

	//Animations and sprites
	this.animations = {
		"treadmill":{
			"frames":[],
			"totalFrames": 4
		},
		"sheep_base":{
			"frames":[],
			"totalFrames": 6
		},
		"sheep_gold":{
			"frames":[],
			"totalFrames": 6
		}
	};

	this.sprites = {};

	//Audio
	this.audioLib = ["main_music", "coin", "die", "freeze", "shield"];
	this.audioVol = [0.4, 0.6, 0.8, 0.6, 0.8];
	this.audio = {};

	//Icons and Buttons
	this.iconNames = [ "pause","play","music_on","music_off","fx_on","fx_off","games","info","web","logout","leaderboard","achievements","restart","ad","shop","coin","dollar","post","back","left_arrow","right_arrow","shirt","tick","restore", "sprint", "run" ];

	this.pauseButton = null;
	this.muteMusicButton = null;
	this.muteFXButton = null;

	this.gamesButton = null;
	this.webButton = null;

	this.infoButton = null;
	this.infoOverlay = null;

	//Fonts
	this.fonts = {};
	this.totalFonts = 0;
	this.totalFontsFailed = 0;
	this.totalFontsLoaded = 0;

	//Obstacles
	this.obstacles = null;
	this.obstacleTimer = null;
	this.obstacleSpawnTime = 1000; //in ms
	this.obstacleRange = 4;

	this.obstaclesFrozen = false;
	this.freezeTimer = null;
	this.obstaclesFreezeTime = this.upgrades.obstaclesFreezeTime.value; //in ms

	//Coins and Shop
	this.coins = 500;
	this.coinIncAmt = this.upgrades.coinIncAmt.value;

	this.shop = null;

	this.shopButton = null;
	this.shopTabNames = ["upgrades","accessories","coins"];

	//--Powerups
	this.powerupNames = ["coin","freeze","shield"];
	this.powerups = null;
	this.powerupChance = this.upgrades.powerupChance.value;

	this.noDeathChance = this.upgrades.noDeathChance.value;

	//-Skins and Accessories
	/* NOTE:
		- The name in this.accessories refers to the name of the skin, hat or cape in this.animations or this.sprite
		- "currency" is either coin or dollar
		- "type" is either: skin, hat or cape (necklaces are under capes)
	*/
	this.accessories = {
		"sheep_base":{
			"title":"Base Sheep",
			"desc":"Back to basics",
			"type":"skin",
			"currency":"coin",
			"cost":0,
			"purchased":true,
			"activated":true
		},
		"sheep_gold":{
			"title":"Golden Sheep",
			"desc":"All that glitters is not gold.\n\nThen again, who cares - Bonus +10 for every coin collected/earned!",
			"type":"skin",
			"currency":"coin",
			"cost":200,
			"purchased":false,
			"activated":false
		},
		"little_lamb":{
			"title":"Little Lamb",
			"desc":"A cute little lamb.\n\nSmaller surface area but runs slightly slower",
			"type":"skin",
			"currency":"dollar",
			"cost":1.99,
			"purchased":false,
			"activated":false
		},
		"no_hat":{
			"title":"Invisible\nHat",
			"desc":"An invisible hat!",
			"type":"hat",
			"currency":"coin",
			"cost":0,
			"purchased":true,
			"activated":true
		},
		"top_hat":{
			"title":"Top Hat",
			"desc":"Fancy top hat for fancy chaps",
			"type":"hat",
			"currency":"coin",
			"cost":100,
			"purchased":false,
			"activated":false
		},
		"crown":{
			"title":"Crown",
			"desc":"Who's the king?\nI'm the king!\n\nBonus: +10% to final score",
			"type":"hat",
			"currency":"coin",
			"cost":300,
			"purchased":false,
			"activated":false
		},
		"no_cape":{
			"title":"Invisible\nCape",
			"desc":"An invisible cape!",
			"type":"cape",
			"currency":"coin",
			"cost":0,
			"purchased":true,
			"activated":true
		},
		"red_cape":{
			"title":"Red Cape",
			"desc":"The original red cape!",
			"type":"cape",
			"currency":"coin",
			"cost":100,
			"purchased":false,
			"activated":false
		},
		"royal_cape":{
			"title":"Royal Cape",
			"desc":"All hail his excellecy,\nRoyal Sheep!\n\nBonus: Collect 10% tax on all coins earned!",
			"type":"cape",
			"currency":"dollar",
			"cost":0.99,
			"purchased":false,
			"activated":false
		},
		"black_cape":{
			"title":"Black Cape",
			"desc":"Behold! The Dark Sheep.",
			"type":"cape",
			"currency":"coin",
			"cost":100,
			"purchased":false,
			"activated":false
		},
		"white_cape":{
			"title":"White Cape",
			"desc":"Sheep of the Light,\nShining Bright...\n\nBonus: +10% chance of not dying",
			"type":"cape",
			"currency":"coin",
			"cost":500,
			"purchased":false,
			"activated":false
		}
	};

	this.goldenSheepBonus = 10; //10 extra coins
	this.crownBonus = 0.1; //10% to final score
	this.whiteCapeBonus = 0.1;
	this.royalCapeBonus = 0.1;

	this.accessoriesNames = [];
	this.hatNames = [];
	this.capeNames = [];

	for(var ii in this.accessories){
		if(!this.accessories.hasOwnProperty(ii)) continue;

		//To avoid issues where sheep base is not initialised first, place skins at the front, so that they will be handled first
		//Inefficient, but it works
		if(this.accessories[ii].type == "skin"){
			this.accessoriesNames.unshift(ii.toString());
		}
		else{
			this.accessoriesNames.push(ii.toString());
		}

		if(ii == "no_cape" || ii=="no_hat") continue;

		if(this.accessories[ii].type == "hat") this.hatNames.push(ii.toString());
		else if(this.accessories[ii].type == "cape") this.capeNames.push(ii.toString());
	}

	this.skinsSection = {};
	this.skinsPages = {};

	//-Coins
	this.coinAdButton = null;
	this.coinBuyButton = null;
	this.restorePurchasesButton = null;

	//Pausing
	this.pauseTime = null;
	this.pauseTimer = null;
	this.pauseOverlay = null;

	//Gameover Screen
	this.gameoverScreen = null;
	this.restartButton = null;
	this.reviveButton = null;
	this.shareButton = null;

	this.tips = [
		"Did you know about the achievements under Google Play Games?",
		"Watching the ad after gaining a >100 highscore earns you coins",
		"Upgrade your sheep in the store to improve your highscore",
		"Log into Google Play Games to trash your friends' highscores",
		"Smashing into a spike with a shield destroys both the shield and the spike",
		"Smashing into a spike with a shield collects its attached powerup",
		"Customise your sheep's appearance using coins in the store",
		"Coins can be used to upgrade or customise your sheep!",
		"Earn coins by watching ads or collecting them as powerups",
		"You can still die from running into a frozen spike, so watch out!",
		"Reviving gives you an opportunity to crush your friends' highscores",
		"Every score above 10 gives you coins proportional to your score",
		"Complete achievements and earn coins!",
		"Hats and capes do not affect your sheep's hitbox",
		"Some accessories have special abilities! Equip away!"
	]

	//Google Play
	this.isLoggedIn = false;
	this.playGamesMenu = null;
	this.leaderboardID = "CgkI8sq82fwOEAIQIA";
	this.leaderboard = {
		"id":"CgkI8sq82fwOEAIQIA", //GPlay leaderboardID
		"maxResults": 10,
		"self":{
			"rank":{},
			"name":{},
			"score":{}
		},
		"others":[]
	};

	//For generating achievements object:
	/*
	var x = document.querySelectorAll("table.GAK3QBB-ad-y tbody td div")
	for(i=2;i<x.length;i+=7){
		y = {};
		y.id = x[i+1].innerHTML;
		y.name = x[i].getElementsByTagName("a")[0].innerHTML;
		y.points = parseInt(x[i+2].innerHTML);
		y.complete = false;
		y.synced = false;
		out = '{\n';
		for(j in y){
			if(!y.hasOwnProperty(j)) continue;
			out+="\t'"+j.toString()+"': '"+y[j]+",'\n";
		}
		out+="}"
		console.log(out);
	}
	*/

	//TODO: Adapt accordingly
	this.achievements = {
		"single": {
			"support": [{
				'id': 'CgkIzb_h1oMQEAIQAg',
				'name': 'Supportive Sheep',
				'points': 5,
				'complete': false,
				'synced': false
			}],
			"curiosity": [{
				'id': 'CgkIzb_h1oMQEAIQAw',
				'name': 'Curiosity slayed the lamb',
				'points': 5
			}],
			"score": [{
				'id': 'CgkIzb_h1oMQEAIQCg',
				'name': 'Over Achiever 1',
				'points': 10,
				'value': 150,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQCw',
				'name': 'Over Achiever 2',
				'points': 20,
				'value': 250,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQDQ',
				'name': 'Over Achiever - Crazy',
				'points': 100,
				'value': 500,
				'complete': false,
				'synced': false
			}],
			"shield_once": [{
				'id': 'CgkIzb_h1oMQEAIQEw',
				'name': 'Strong Sheep 1',
				'points': 5,
				'complete': false,
				'synced': false
			}],
			"enhanced_once": [{
				'id': 'CgkIzb_h1oMQEAIQFw',
				'name': 'Enhanced Sheep 1',
				'points': 5,
				'complete': false,
				'synced': false
			}],
			"max_upgrade": [{
				'id': 'CgkIzb_h1oMQEAIQGg',
				'name': 'Super Sheep',
				'points': 20,
				'complete': false,
				'synced': false
			}],
			"sprint_spent": [{
				'id': 'CgkIzb_h1oMQEAIQHA',
				'name': 'Sprinter Sheep',
				'points': 5,
				'complete': false,
				'synced': false
			}]
		},
		"incremental": {
			"die": [{
				'id': 'CgkIzb_h1oMQEAIQBA',
				'name': 'Sacrificial Lamb 1',
				'points': 5,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 10,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQBQ',
				'name': 'Sacrificial Lamb 2',
				'points': 10,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 50,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQBg',
				'name': 'Sacrificial Lamb 3',
				'points': 15,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 100,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQBw',
				'name': 'Sacrificial Lamb -  Extreme',
				'points': 25,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 500,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQCQ',
				'name': 'Sacrificial Lamb - Clearly addicted',
				'points': 50,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 1000,
				'complete': false,
				'synced': false
			}],
			"score_times": [{
				'id': 'CgkIzb_h1oMQEAIQDg',
				'name': 'Sporty Sheep 1',
				'points': 15,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 3,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQDw',
				'name': 'Sporty Sheep 2',
				'points': 25,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 5,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQEA',
				'name': 'Sporty Sheep 3',
				'points': 40,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 10,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQEQ',
				'name': 'Olympic Sheep!',
				'points': 80,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 50,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQEg',
				'name': 'Olympic Sheep - Clearly Addicted!',
				'points': 150,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 100,
				'complete': false,
				'synced': false
			}],
			"shield": [{
				'id': 'CgkIzb_h1oMQEAIQFA',
				'name': 'Strong Sheep 2',
				'points': 10,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 10,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQFQ',
				'name': 'Strong Sheep 3',
				'points': 20,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 50,
				'complete': false,
				'synced': false
			}, {
				'id': 'CgkIzb_h1oMQEAIQFg',
				'name': 'Strong Sheep - Clearly Addicted',
				'points': 50,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 100,
				'complete': false,
				'synced': false
			}],
			"enhanced": [{
					'id': 'CgkIzb_h1oMQEAIQGA',
					'name': 'Enhanced Sheep 2',
					'points': 10,
					'completedSteps': 0,
					'completedSteps_synced': 0,
					'totalSteps': 10,
					'complete': false,
					'synced': false
				},
				{
					'id': 'CgkIzb_h1oMQEAIQGQ',
					'name': 'Enhanced Sheep 3',
					'points': 15,
					'completedSteps': 0,
					'completedSteps_synced': 0,
					'totalSteps': 25,
					'complete': false,
					'synced': false
				}
			],
			"addicted": [{
				'id': 'CgkIzb_h1oMQEAIQGw',
				'name': 'Clearly Addicted',
				'points': 50,
				'completedSteps': 0,
				'completedSteps_synced': 0,
				'totalSteps': 3,
				'complete': false,
				'synced': false
			}]
		},
		"totalSteps": {} //Dynamically generated based on this.achievements data
	};

	this.achievements.totalSteps["score"] = [];

	var ii,jj;

	for(ii in this.achievements.single.score){
		this.achievements.totalSteps["score"].push(this.achievements.single.score[ii].value);
	}

	var _achInc = this.achievements.incremental;
	for(ii in _achInc){
		this.achievements.totalSteps[ii] = [];
		for(jj=0;jj<_achInc[ii].length;jj++){
			this.achievements.totalSteps[ii].push(_achInc[ii][jj].totalSteps);
		}
	}

	//Updates
	/*
	this.updates = {
		"upgrades":["coinIncAmt"],
		"achievements_single":["enhanced_once","max_upgrade"],
		"achievements_increment":["enhanced"],
		"accessories":["no_cape","no_hat","crown","top_hat","red_cape","royal_cape","black_cape","white_cape"]
	};

	this.partsForUpdate = {};

	var nm;
	for(ii in this.updates){
		if(!this.updates.hasOwnProperty(ii)) continue;

		this.partsForUpdate[ii] = {};
		for(jj=0;jj<this.updates[ii].length;jj++){
			nm = this.updates[ii][jj];
			if(ii == "achievements_single"){
				this.partsForUpdate[ii][nm] = this.achievements["single"][nm];
			}
			else if(ii == "achievements_increment"){
				this.partsForUpdate[ii][nm] = this.achievements["incremental"][nm];
			}
			else{
				this.partsForUpdate[ii][nm] = this[ii][nm];
			}
		}
	}
	*/

	//Ads
	this.totalGamesPlayed = 0;

	this.ads = {
		"enabled": true,
		"testing": false,
		"reward_type": "revive",
		"types": {
			"banner": {
				"id": "ca-app-pub-1626473425552959/7703260898",
				"autoShow": false,
				"loaded": false
			},
			"interstitial": {
				"id": "ca-app-pub-1626473425552959/8569620006",
				"autoShow": false,
				"loaded": false
			},
			"rewardvideo": {
				"id": "ca-app-pub-1626473425552959/3263600230",
				"autoShow": false,
				"loaded": false
			}
		},
		"init": function(){
			console.log("Initializing ads...");

			self = this;

			if(!this.enabled) this.testing = true;
			if(typeof admob=="undefined" || admob == null || !this.enabled) return;

			var i, nm, opt, data;
			for(i in self.types){
				if(!self.types.hasOwnProperty(i)) continue;

				nm = i.toString().toLowerCase();
				data = self.types[i];

				opt = {
					id: data["id"],
					isTesting: self.testing,
					autoShow: data["autoShow"]
				};

				admob[nm].config(opt);
				admob[nm].prepare();

				console.log(nm);
				document.addEventListener('admob.'+nm+'.events.LOAD_FAIL', function(event) {
					console.log("Load failed:", event.adType);
					data["loaded"] = false;

					if(event.adType == "rewardvideo"){
						this.updateButtons();
					}
					else if(Game.isOnline){
						console.log("Loading ad again");
						admob[event.adType].prepare();
					}
				}.bind(self));

				document.addEventListener('admob.'+nm+'.events.LOAD', function(event) {
					var _nm = event.type.split(".")[1];
					console.log("Load successful:", _nm);

					data["loaded"] = true;

					if(_nm == "rewardvideo"){
						this.updateButtons();
					}
				}.bind(self));

				if(nm!="banner"){
					document.addEventListener('admob.'+nm+'.events.CLOSE', function(event) {
						data["loaded"] = false;
						admob[event.adType].prepare();

						this.updateButtons();
					}.bind(self));
				}

				if(nm=="rewardvideo"){
					document.addEventListener('admob.rewardvideo.events.REWARD', function(event){
						console.log("You can now receive reward: "+self.reward_type);
						switch(self.reward_type){
							case "revive":
								this.revive();
								break;
							case "coin":
							case "coins":
								this.incCoins(self.reward_amount);
								break;
							default:
								return;
						}
					}.bind(Game));
				}
			}
		},
		"showAd": function(type, reward_type, reward_amount){
			if(typeof admob=="undefined" || admob == null || !this.enabled) return;

			if(typeof type == "undefined" || type==null){
				type = "interstitial";
			}

			switch(type){
				case "reward":
				case "rewardvideo":
					type = "rewardvideo";
					this.reward_type = (reward_type==null)?"coins":reward_type;
					this.reward_amount = (reward_amount==null)?(50*getRandomInt(1, 5)):reward_amount;
					break;
				case "interstitial":
				case "video":
					type = "interstitial";
					break;
				default: return;
			}

			admob[type].show();
		},
		"updateButtons": function(){
			//-Check if ads are available, if not, disable revive and coin ad button
			var i, buttons = [Game.reviveButton, Game.coinAdButton];
			var btn;
			var disabled = false, text = "";

			for(i=0;i<buttons.length;i++){
				btn = buttons[i];
				if(typeof btn == "undefined" || btn == null) continue;

				if(typeof admob == "undefined" || admob==null){
					disabled = true;

					text = "Only available\non the mobile app";
				}
				else if(Game._revived && btn == Game.reviveButton){
					disabled = true;

					text = "You can only revive once per game";
				}
				else if(!Game.isOnline){
					disabled = true;

					text = "Ad failed to load\nCheck your connection and try again";
				}
				else if(!this.types.rewardvideo.loaded){
					disabled = true;

					text = "Loading ad...";

					//Attempt to load ad
					admob["rewardvideo"].prepare();
				}
				else{
					disabled = false;
					text = (btn==Game.reviveButton)?"Watch an ad to revive\nUsable once per game":"Watch ads to earn between 10-150 coins!";
				}

				btn.buttonMode = !disabled;
				btn.interactive = !disabled;
				btn.overlay.visible = disabled;
				btn.footnote.text = text;
			}

			renderer.render(stage);
		}
	};

	//In-app purchases
	this.purchases = {
		"loaded": false,
		"appId": "io.samleo8.sisyphussheep",
		"productIdNames": ["coins_500", "little_lamb", "royal_cape"],
		"productIds": [],
		"productData": null,
		"checkAvail": function(){
			this.updateButtons();

			return (typeof inAppPurchase!="undefined" && inAppPurchase!=null && Game.isOnline);
		},
		"updateButtons": function(){
			//-Check if purchases are available, if not, disable
			var i, buttons = [Game.coinBuyButton];
			var accessoryButtonNames = [null];
			var btn;
			var disabled = false, text = "";

			//Must include buttons from accessories
			var acc;
			for(i in Game.accessories){
				if(!Game.accessories.hasOwnProperty(i)) continue;
				acc = Game.accessories[i];

				if(acc.currency == "dollar"){
					buttons.push(Game.skinsSection[i.toString()].button);
					accessoryButtonNames[buttons.length-1] = i.toString();
				}
			}

			buttons.push(Game.restorePurchasesButton); //reason for this is to ensure that the productData index doesnt screw up

			for(i=0;i<buttons.length;i++){
				btn = buttons[i];
				if(typeof btn == "undefined" || btn == null) continue;

				if(btn!=Game.coinBuyButton && btn!=Game.restorePurchasesButton){
					if(Game.accessories[accessoryButtonNames[i]].purchased){
						if(Game.accessories[accessoryButtonNames[i]].activated){
							disabled = true;
						}
						else{
							disabled = false;
						}
						text = "";

						btn.buttonMode = !disabled;
						btn.interactive = !disabled;
						btn.overlay.visible = disabled;
						btn.footnote.text = text;

						continue;
					}
				}

				if(typeof inAppPurchase == "undefined" || inAppPurchase==null){
					disabled = true;

					if(btn==Game.restorePurchasesButton){
						text = "Only available on the mobile app";
					}
					else{
						text = "Only available\non the mobile app";
					}
				}
				else if(!Game.isOnline){
					disabled = true;

					text = "Failed to load\nCheck your connection and try again";
				}
				else{
					disabled = false;
					switch(btn){
						case Game.restorePurchasesButton:
							text = "";
							break;
						case Game.coinBuyButton:
							if(this.productData==null)
								text = "Buy 500 coins\nfor $0.99";
							else
								text = "Buy 500 coins\nfor "+this.productData[i]["currency"]+" "+this.productData[i]["priceAsDecimal"];
							break;
						default:
							if(this.productData!=null){
								text = "";

								btn.text.text = this.productData[i]["currency"]+" "+this.productData[i]["priceAsDecimal"];
								btn.icon.visible = false;
							}
							break;
					}
				}

				btn.buttonMode = !disabled;
				btn.interactive = !disabled;
				btn.overlay.visible = disabled;
				btn.footnote.text = text;
			}

			renderer.render(stage);
		},
		"load":function(){
			var i, self = this;

			if(!this.checkAvail()) return;

			//Need to convert from base name to actual id based on app id
			for(i=0;i<this.productIdNames.length;i++){
				this.productIds.push(this.appId+"."+this.productIdNames[i]);
			}

			inAppPurchase.getProducts(this.productIds)
			.then(function(products){
				self.productData = products;
				self.loaded = true;

				self.updateButtons();
			})
			.catch(function(err){
				console.log(err);
				self.loaded = false;
			});
		},
		"buy":function(id){
			var i, ind=-1;
			var self = this, success = false;

			if(!this.checkAvail()) return;

			if(!this.loaded) this.load();

			if(typeof id=="undefined" || id==null) return;

			//Check if ids are in array
			for(i=0;i<this.productIdNames.length;i++){
				if(this.productIdNames[i] == id){
					ind = i;
					continue;
				}
			}
			if(ind==-1) return false;

			inAppPurchase.buy(self.productIds[ind].toLowerCase())
				.then(function(data){
					console.log(JSON.stringify(data));

					success = Game.purchases.giveReward(id, data);
				})
				.catch(function(err){
					console.log(err);
				});

			return success;
		},
		"restore":function(){
			//TODO: Make a proper restoration for purchases
			var i, data, data2, id;
			var self = this;

			if(!this.checkAvail()) return;

			inAppPurchase.restorePurchases()
			.then(function (purchase_data) {
				//console.log(JSON.stringify(purchase_data));
				console.log("Restoring Purchases...");

				for(i=0;i<purchase_data.length;i++){
					data = purchase_data[i];
					if(data.state == 0){ //active
						data2 = {
							"receipt":data.receipt,
							"signature":data.signature,
							"type":data.productType,
						}

						id = data.productId.split("."+self.appId)[0];

						self.giveReward(id, data2);
					}
				}
			}.bind(self))
			.catch(function (err) {
				console.log(err);
			});
		},
		"giveReward":function(id, data){
			//Use this function to handle the rewarding of user with whatever item he made purchase for.

			if(id==null) return;
			if(data==null) return;

			//TODO: Some verification of sorts
			//NOTE: The consume() function should only be called after purchasing consumable products, otherwise, you should skip this step
			switch(id){
				case "coins500":
					Game.incCoins(500,true);

					return inAppPurchase.consume(data.type, data.receipt, data.signature);
				case "little_lamb":
					Game.accessories[id].purchased = true;
					Game.setAccessory(id,"skin");
					return true;
				default:
					return;
			}
		}
	}

	this.backButton = null;

	//Functions
	this.initStage = function(){
		//CHECK MOBILE
		_isMobile = MobileAndTabletCheck();

		//INIT RENDERER
		var rendererOptions = {
			width: this.canvasWidth,
			height: this.canvasHeight,
			antialias: false,
			transparent: false,
			resolution: window.devicePixelRatio,
			autoResize: true,
			backgroundColor: 0x90a4ae
		};

		renderer = PIXI.autoDetectRenderer(rendererOptions);

		//INIT STAGE AND RESIZE TO FIT SCREEN
		stage = new PIXI.Container();
		this.resizeCanvas();

		document.getElementById("canvas_container").appendChild(renderer.view);

		//ADD EVENT LISTENERS
		//NOTE: Reason for adding event listeners here instead of new game is that the event listeners cannot seem to be removed upon gameover, causing a bug where more than one event listeners are added upon gameover.

		if(typeof admob=="undefined" || admob == null){
			//Prevents canvas resizing when banner ad is added
			window.addEventListener("resize", this.resizeCanvas.bind(this), false);
		}

		window.addEventListener("keyup", this.keyEvent.bind(this), false);
		window.addEventListener("keydown", this.keyEvent.bind(this), false);

		if(isApp()){
			console.log("Added pause and resume event listeners");
			document.addEventListener("resume", this.appFocus.bind(this), false);
			document.addEventListener("pause", this.appBlur.bind(this), false);
		}
		else{
			console.log("Added focus and blur event listeners");
			window.addEventListener("focus", this.appFocus.bind(this), false);
			window.addEventListener("blur", this.appBlur.bind(this), false);
		}

		//LOAD IMAGES, FONTS AND MUSIC
		this.loadFonts(); //(load fonts first to make sure start screen has proper fonts)
		//--> this.initPreload();
	};

	this.initPreload = function(){
		var i, j;

		//PRELOADING OF IMAGES INTO PIXI LOADER
		this.loader = new PIXI.Loader();
		this.loader.add("sprite_background","img/background.png");
		this.loader.add("sprite_spike","img/spike.png");
		this.loader.add("sprite_flag","img/flag.png");
		this.loader.add("dead_sheep","img/dead_sheep.png");

		for(i=0;i<this.powerupNames.length;i++){
			this.loader.add("powerup_"+this.powerupNames[i].toString(),"img/powerups/"+this.powerupNames[i]+".png");
		}

		for(i=0;i<this.hatNames.length;i++){
			this.loader.add("hat_"+this.hatNames[i].toString(),"img/hats/"+this.hatNames[i]+".png");
		}

		for(i=0;i<this.capeNames.length;i++){
			this.loader.add("cape_"+this.capeNames[i].toString(),"img/capes/"+this.capeNames[i]+".png");
		}

		for(i=0;i<this.iconNames.length;i++){
			this.loader.add("icon_"+this.iconNames[i].toString(),"img/icons/"+this.iconNames[i]+".png");
		}

		for(i in this.animations){
			if(!this.animations.hasOwnProperty(i)) continue;

			for(j=0;j<this.animations[i].totalFrames;j++){
				this.loader.add(i.toString()+"_"+j,"img/animations/"+i.toString()+"/"+j+".png");
			}
		}

		//PRELOADING OF AUDIO
		for(i=0;i<this.audioLib.length;i++){
			this.loader.add("audio_"+this.audioLib[i],"audio/"+this.audioLib[i]+".mp3");
		}

		//LOADING BAR AND START SCREEN
		this.buildStartScreen();

		this.loader.on('progress', (loader,resource) => {
			this.loadingBar.progressText.text = Math.round(loader.progress)+"%";

			var _width = Math.round(loader.progress/100)*this.loadingBar.progressBar.maxWidth;
			this.loadingBar.progressBar.beginFill(0xcfd8dc)
				.drawRect(-this.loadingBar.progressBar.maxWidth/2, 0,_width,this.loadingBar.progressBar.maxHeight)
			.endFill();

			//console.log('Progress: '+ loader.progress + '%');
			//console.log('Loading: '+ resource.name.split("_").join(" ").toUpperCase());
		});

		renderer.render(stage);

		this.loader.load((loader, resources) => {
			//NOTE: "resources" is an object where the key is the name of the resource loaded and the value is the resource object.

			//SPRITES
			//-Background
			this.sprites.background = new PIXI.TilingSprite(
				resources["sprite_background"].texture,
				this.canvasWidth+1, //FIX: fixes weird pixel bug
				this.canvasHeight
			);
			//this.sprites.background.tint = 0xeceff1;

			//-Spike
			this.sprites.spike = new PIXI.Sprite(resources["sprite_spike"].texture);

			//-Dead Sheep
			this.sprites.dead_sheep = new PIXI.Sprite(resources["dead_sheep"].texture);

			//-Flag
			this.sprites.flag = new PIXI.Sprite(resources["sprite_flag"].texture);

			stage.addChild(this.sprites.background);

			var nm, i, j;

			//HATS AND CAPES
			this.sprites.hats = {};
			for(i=0;i<this.hatNames.length;i++){
				nm = this.hatNames[i].toString();
				this.sprites.hats[nm] = new PIXI.Sprite(resources["hat_"+nm].texture);
				this.sprites.hats[nm].anchor.set(0.5);
				this.sprites.hats[nm].scale.set(0.25, 0.25);
				this.sprites.hats[nm].tint = 0x90a4ae;
				this.sprites.hats[nm].name = nm;
			}

			this.sprites.capes = {};
			for(i=0;i<this.capeNames.length;i++){
				nm = this.capeNames[i].toString();
				this.sprites.capes[nm] = new PIXI.Sprite(resources["cape_"+nm].texture);
				this.sprites.capes[nm].anchor.set(0.5);
				this.sprites.capes[nm].scale.set(0.25, 0.25);
				this.sprites.capes[nm].tint = 0x90a4ae;
				this.sprites.capes[nm].name = nm;
			}

			//POWERUPS
			this.sprites.powerups = {};
			for(i=0;i<this.powerupNames.length;i++){
				nm = this.powerupNames[i].toString();
				this.sprites.powerups[nm] = new PIXI.Sprite(resources["powerup_"+nm].texture);
			}

			this.powerupOffset = this.sprites.spike.height/100+this.sprites.powerups[this.powerupNames[0]].height*(0.3)+50;

			//-ICONS/BUTTONS
			this.sprites.icons = {};
			for(i=0;i<this.iconNames.length;i++){
				nm = this.iconNames[i].toString();
				this.sprites.icons[nm] = new PIXI.Sprite(resources["icon_"+nm].texture);
				this.sprites.icons[nm].anchor.set(0.5);
				this.sprites.icons[nm].scale.set(0.8, 0.8);
				this.sprites.icons[nm].alpha = 0;
				this.sprites.icons[nm].tint = 0x90a4ae;
				this.sprites.icons[nm].name = nm;
			}

			//--Pause Button
			this.pauseButton = new PIXI.Container();
			this.pauseButton.interactive = true;
			this.pauseButton.buttonMode = true;

			this.pauseButton.on((_isMobile)?"touchend":"mouseup",this.togglePause.bind(this));

			this.pauseButton.position.set(this.canvasWidth-60, 50);

			this.pauseButton.addChild(this.sprites.icons["pause"]);
			this.pauseButton.addChild(this.sprites.icons["play"]);
			this.pauseButton.getChildByName("pause").alpha = 1;

			//--Mute Music Button
			this.muteMusicButton = new PIXI.Container();
			this.muteMusicButton.interactive = true;
			this.muteMusicButton.buttonMode = true;

			this.muteMusicButton.on((_isMobile)?"touchend":"mouseup",this.toggleMuteMain.bind(this));

			this.muteMusicButton.position.set(this.canvasWidth-145, 50);

			this.muteMusicButton.addChild(this.sprites.icons["music_on"]);
			this.muteMusicButton.addChild(this.sprites.icons["music_off"]);
			this.muteMusicButton.getChildByName("music_on").alpha = 1;

			//--Text
			var textOpt = {
				fontFamily: 'TimeBurnerBold',
				fill: "0x90a4ae",
				letterSpacing: 5,
				align: 'center',
				fontSize: 20
			};

			var text = new PIXI.Text("MUSIC",textOpt);
			text.anchor.set(0.5, 0.5);
			text.alpha = 1;
			text.y = 55;
			this.muteMusicButton.addChild(text);

			//--Mute FX Button
			this.muteFXButton = new PIXI.Container();
			this.muteFXButton.interactive = true;
			this.muteFXButton.buttonMode = true;

			this.muteFXButton.on((_isMobile)?"touchend":"mouseup",this.toggleMuteFX.bind(this));

			this.muteFXButton.position.set(this.canvasWidth-235, 50);

			this.muteFXButton.addChild(this.sprites.icons["fx_on"]);
			this.muteFXButton.addChild(this.sprites.icons["fx_off"]);
			this.muteFXButton.getChildByName("fx_on").alpha = 1;

			//--Text
			text = new PIXI.Text("FX",textOpt);
			text.anchor.set(0.5, 0.5);
			text.alpha = 1;
			text.y = 55;
			this.muteFXButton.addChild(text);

			//--Games Button
			this.gamesButton = new PIXI.Container();

			this.gamesButton.interactive = true;
			this.gamesButton.buttonMode = true;

			this.gamesButton.on((_isMobile)?"touchend":"mouseup",this.showPlayGamesMenu.bind(this));

			this.gamesButton.position.set(80, 50);

			this.gamesButton.addChild(this.sprites.icons["games"]);
			this.gamesButton.getChildByName("games").alpha = 1;

			//--Text
			text = new PIXI.Text("PLAY\nGAMES",textOpt);
			text.anchor.set(0.5, 0.5);
			text.alpha = 1;
			text.y = 67.5;
			this.gamesButton.addChild(text);

			//--Info Button
			this.infoButton = new PIXI.Container();

			this.infoButton.interactive = true;
			this.infoButton.buttonMode = true;

			this.infoButton.on((_isMobile)?"touchend":"mouseup",this.showInfo.bind(this));

			this.infoButton.position.set(190, 50);

			this.infoButton.addChild(this.sprites.icons["info"]);
			this.infoButton.getChildByName("info").alpha = 1;

			//--Text
			text = new PIXI.Text("INFO",textOpt);
			text.anchor.set(0.5, 0.5);
			text.alpha = 1;
			text.y = 55;
			this.infoButton.addChild(text);

			//--Web Button
			this.webButton = new PIXI.Container();

			this.webButton.interactive = true;
			this.webButton.buttonMode = true;

			this.webButton.on((_isMobile)?"touchend":"mouseup",this.gotoURL.bind(this,"https://samleo8.github.io/games/"));

			this.webButton.position.set(292, 50);

			this.webButton.addChild(this.sprites.icons["web"]);
			this.webButton.getChildByName("web").alpha = 1;

			//--Text
			text = new PIXI.Text("DEV\nSITE",textOpt);
			text.anchor.set(0.5, 0.5);
			text.alpha = 1;
			text.y = 67.5;
			this.webButton.addChild(text);

			//--Shop Button
			this.shopButton = new PIXI.Container();

			this.shopButton.interactive = true;
			this.shopButton.buttonMode = true;

			this.shopButton.on((_isMobile)?"touchend":"mouseup",this.showShop.bind(this));

			this.shopButton.position.set(395, 51);

			this.shopButton.addChild(this.sprites.icons["shop"]);
			this.shopButton.getChildByName("shop").alpha = 1;

			//--Text
			text = new PIXI.Text("STORE",textOpt);
			text.anchor.set(0.5, 0.5);
			text.alpha = 1;
			text.y = 55;
			this.shopButton.addChild(text);

			//ANIMATIONS
			for(j in this.animations){
				if(!this.animations.hasOwnProperty(j)) continue;

				for(i=0;i<this.animations[j].totalFrames;i++) {
					this.animations[j].frames.push(resources[j+"_"+i].texture);
				}
				this.animations[j].frames.push(resources[j+"_0"].texture);
			}

			//LOAD AUDIO
			//NOTE: Must be done first because when loadOptions() is called in setAllAccessories(), this.audio will be null
			for(i=0;i<this.audioLib.length;i++){
				nm = this.audioLib[i];
				this.audio[nm] = resources["audio_"+nm].sound;
				this.audio[nm].volume = this.audioVol[i];
				this.audio[nm].defaultVolume = this.audioVol[i];
			}

			this.audio["main_music"].play({loop:true});
			this.audio["main_music"].loop = true;

			//-HERO
			this.hero = new PIXI.Container();

			this.setAllAccessories();

			//this.hero.width = this.hero.sheep.width;
			//this.hero.height = this.hero.sheep.height;

			this.hero.addChild(this.hero.sheep);
			this.hero.addChild(this.hero.cape);
			this.hero.addChild(this.hero.hat);

			this.allAssetsLoaded();
		});
	};

	this.loadFonts = function(){
		//INITIALIZE FONTS USING FontFaceObserver.JS
		this.fonts["TimeBurner"] = new FontFaceObserver("TimeBurner");
		this.fonts["TimeBurnerBold"] = new FontFaceObserver("TimeBurnerBold");

		this.totalFonts = Object.keys(this.fonts).length;
		this.totalFontsLoaded = 0;
		this.totalFontsFailed = 0;

		var i;
		for(i in this.fonts){
			this.fonts[i].load().then(
				this.checkAllFontsLoaded.bind(this,true),
				this.checkAllFontsLoaded.bind(this,false)
			);
		}
	};

	this.checkAllFontsLoaded = function(success){
		if(success) this.totalFontsLoaded++;
		else this.totalFontsFailed++;

		if( (this.totalFontsLoaded+this.totalFontsFailed)>=this.totalFonts){
			console.log(this.totalFontsLoaded+"/"+this.totalFonts+" Fonts Loaded...");

			this.initPreload();
		}
	};

	this.buildStartScreen = function(){
		this.startScreen = new PIXI.Container();

		var bg_basic = new PIXI.Graphics();
		//-Main Bg
		bg_basic.beginFill(0x37474f);
		bg_basic.drawRect(0, 0,this.canvasWidth,this.canvasHeight);
		bg_basic.endFill();

		var rect = new PIXI.Graphics();
		//-Sides
		rect.beginFill(0xcfd8dc, 0.9);
		rect.drawRect(0,this.canvasHeight/2-150, 500, 140);
		rect.drawRect(1100,this.canvasHeight/2-150, 500, 140);
		rect.endFill();

		//-Border for sides
		rect.lineStyle(8, 0x90a4ae)
			.moveTo(0,this.canvasHeight/2-150).lineTo(500,this.canvasHeight/2-150)
			.moveTo(0,this.canvasHeight/2-10).lineTo(500,this.canvasHeight/2-10)
			.moveTo(1100,this.canvasHeight/2-150).lineTo(1600,this.canvasHeight/2-150)
			.moveTo(1100,this.canvasHeight/2-10).lineTo(1600,this.canvasHeight/2-10);

		this.startScreen.addChild(bg_basic);

		var textOpt = {
			fontFamily: 'TimeBurnerBold',
			fill: "#cfd8dc",
			stroke: "#90a4ae",
			strokeThickness: 10,
			letterSpacing: 10,
			padding: 10,
			align: 'center',
			fontSize: 120
		};

		var text = new PIXI.Text("SISYPHUS",Object.assign(textOpt, { fontSize: 110 }));
		text.anchor.set(0.5, 0.5);
		text.x = this.canvasWidth/2;
		text.y = this.canvasHeight/2-150;

		this.startScreen.addChild(text);

		var text2 = new PIXI.Text("SHEEP",Object.assign(textOpt));
		text2.anchor.set(0.5, 0.5);
		text2.x = this.canvasWidth/2+90;
		text2.y = this.canvasHeight/2-20;

		var _offset = 95;
		rect.y -= _offset; text.y -= _offset; text2.y -= _offset;

		this.startScreen.addChild(rect);
		this.startScreen.addChild(text);
		this.startScreen.addChild(text2);

		//-Actual loader bar
		this.loadingBar = new PIXI.Container();

		this.loadingBar.progressBar = new PIXI.Graphics();
		this.loadingBar.progressBar.maxWidth = 700;
		this.loadingBar.progressBar.maxHeight = 25;
		this.loadingBar.progressBar.strokeWidth = 6;

		//--Outline
		//-(Actual Bar drawn in progress handler)
		this.loadingBar.progressBar.lineStyle(this.loadingBar.progressBar.strokeWidth, 0x90a4ae)
			.moveTo(-this.loadingBar.progressBar.maxWidth/2, 0)
			.lineTo(this.loadingBar.progressBar.maxWidth/2, 0)
			.lineTo(this.loadingBar.progressBar.maxWidth/2,this.loadingBar.progressBar.maxHeight)
			.lineTo(-this.loadingBar.progressBar.maxWidth/2,this.loadingBar.progressBar.maxHeight)
			.lineTo(-this.loadingBar.progressBar.maxWidth/2,-this.loadingBar.progressBar.strokeWidth/2);

		textOpt = {
			fontFamily: 'TimeBurner',
			fill: "#cfd8dc",
			letterSpacing: 5,
			align: 'center',
			fontSize: 40
		};

		this.loadingBar.progressText = new PIXI.Text("0%",textOpt);
		this.loadingBar.progressText.anchor.set(0.5, 0.5);
		this.loadingBar.progressText.y = this.loadingBar.progressBar.maxHeight/2+this.loadingBar.progressBar.strokeWidth/2;
		this.loadingBar.progressText.x = this.loadingBar.progressBar.width/2+80;

		this.loadingBar.position.set(this.canvasWidth/2-50,this.canvasHeight*(7/8)+10);

		this.loadingBar.addChild(this.loadingBar.progressBar);
		this.loadingBar.addChild(this.loadingBar.progressText);

		this.loadingBar.name = "loader_bar";
		this.startScreen.addChild(this.loadingBar);

		stage.addChild(this.startScreen);
	};

	//GENERATE OVERLAYS
	this.generateOverlays = function(){
		/* PAUSE OVERLAY */
		this.pauseOverlay = new PIXI.Container();

		var i;
		var rect = new PIXI.Graphics();
		rect.beginFill(0x263238, 0.7);
		rect.drawRect(0, 0,this.canvasWidth,this.canvasHeight);
		rect.endFill();

		this.pauseOverlay.addChild(rect);

		var textOpt = {
			fontFamily: 'TimeBurnerBold',
			fill: "#cfd8dc",
			stroke: "#90a4ae",
			strokeThickness: 10,
			letterSpacing: 10,
			align: 'center'
		};

		var text = new PIXI.Text("PAUSED",Object.assign(textOpt,{fontSize:120}));
		text.anchor.set(0.5, 0.5);
		text.alpha = 0.75;
		text.x = this.canvasWidth/2;
		text.y = this.canvasHeight/2-30;

		this.pauseOverlay.addChild(text);

		var line = new PIXI.Graphics();
		line.alpha = 0.85;
		line.position.set(this.canvasWidth/2-243,this.canvasHeight/2+35);
		line.lineStyle(1, 0xeceff1).moveTo(0, 0).lineTo(468, 0);
		this.pauseOverlay.addChild(line);

		var text2 = new PIXI.Text(((_isMobile)?"Tap":"Click")+" to continue ",
		Object.assign(textOpt,{
			fontFamily:'TimeBurner',
			fontSize:40,
			strokeThickness:1,
			letterSpacing: 8
		}));
		text2.anchor.set(0.5, 0.5);
		text2.alpha = 0.75;
		text2.x = this.canvasWidth/2-8;
		text2.y = this.canvasHeight/2+70;

		this.pauseOverlay.addChild(text2);

		//-Add Event Listener
		this.pauseOverlay.on((_isMobile)?"tap":"click", this.togglePause.bind(this,false));

		/* INFO OVERLAY */
		this.infoOverlay = new PIXI.Container();

		var rect = new PIXI.Graphics();
		rect.beginFill(0x263238, 0.98)
			.drawRect(0, 0,this.canvasWidth,this.canvasHeight)
		.endFill();

		this.infoOverlay.addChild(rect);

		var textOpt = {
			fontFamily: 'TimeBurnerBold',
			fill: "#cfd8dc",
			stroke: "#90a4ae",
			strokeThickness: 10,
			letterSpacing: 10,
			align: 'center',
			padding:10
		};

		var text = new PIXI.Text("INFO",Object.assign(textOpt,{fontSize:75}));
		text.anchor.set(0.5, 0.5);
		text.alpha = 0.98;
		text.x = this.canvasWidth/2;
		text.y = this.canvasHeight/8;

		this.infoOverlay.addChild(text);

		var textOpt2 = {
			fontFamily: 'TimeBurner',
			fill: "#cfd8dc",
			letterSpacing: 5,
			align: 'center',
			wordWrap: true,
			wordWrapWidth: this.canvasWidth*0.6,
			padding: 10,
			fontSize: 30
		};
		var text2 = new PIXI.Text(
			"This game was created by Samuel Leong Chee Weng\nusing PIXI.js renderer library.\n\n"+
			((isApp())?"The web version is available on my website at\n https://samleo8.github.io/SisyphusSheep":"The mobile app is available on the Google Play Store under the name \'Sisyphus Sheep\'"),
			textOpt2
		);
		text2.anchor.set(0.5, 0);
		text2.alpha = 0.98;
		text2.x = this.canvasWidth/2;
		text2.y = this.canvasHeight/6+35;

		this.infoOverlay.addChild(text2);

		var textOpt3 = Object.assign(textOpt,{strokeThickness:7,fontSize:45});

		var text3 = new PIXI.Text("MUSIC",textOpt3);
		text3.anchor.set(0.5, 0.5);
		text3.alpha = 0.98;
		text3.x = this.canvasWidth/2;
		text3.y = this.canvasHeight/2;

		this.infoOverlay.addChild(text3);

		text2 = new PIXI.Text("[Miqz] http://www.newgrounds.com/audio/listen/719242\nhttp://www.noiseforfun.com/",textOpt2);
		text2.anchor.set(0.5, 0);
		text2.alpha = 0.98;
		text2.x = this.canvasWidth/2;
		text2.y = this.canvasHeight/2+45;

		this.infoOverlay.addChild(text2);

		text3 = new PIXI.Text("SPRITES",textOpt3);
		text3.anchor.set(0.5, 0);
		text3.alpha = 0.98;
		text3.x = this.canvasWidth/2;
		text3.y = this.canvasHeight/2+160;

		this.infoOverlay.addChild(text3);

		text2 = new PIXI.Text("Material Design Icons\nSpike: http://scribblenauts.wikia.com/wiki/File:Steel_Spike.png",textOpt2);
		text2.anchor.set(0.5, 0);
		text2.alpha = 0.98;
		text2.x = this.canvasWidth/2;
		text2.y = this.canvasHeight/2+230;

		this.infoOverlay.addChild(text2);

		this.infoOverlay.on((_isMobile)?"touchend":"mouseup",this.showInfo.bind(this));

		this.infoOverlay.alpha = 0;

		/* GAMEOVER SCREEN */
		this.gameoverScreen = new PIXI.Container();

		this.gameoverScreen.sheep = this.sprites.dead_sheep;
		this.gameoverScreen.sheep.scale.set(0.6, 0.6);
		this.gameoverScreen.sheep.anchor.set(0.5, 0.5);
		this.gameoverScreen.sheep.position.set(this.canvasWidth/2,this.canvasHeight*0.29);

		this.gameoverScreen.addChild(this.gameoverScreen.sheep);

		textOpt = {
			fontFamily: 'TimeBurnerBold',
			fill: "#90a4ae",
			stroke: "#546e7a",
			strokeThickness: 10,
			letterSpacing: 10,
			align: 'center',
			padding: 10,
			fontSize: 120
		};
		this.gameoverScreen.text1 = new PIXI.Text("GAME", textOpt);
		this.gameoverScreen.text2 = new PIXI.Text("OVER", textOpt);

		this.gameoverScreen.text1.anchor.set(0.5, 0.5);
		this.gameoverScreen.text2.anchor.set(0.5, 0.5);

		this.gameoverScreen.text1.position.set(this.canvasWidth*0.25, this.gameoverScreen.sheep.y);
		this.gameoverScreen.text2.position.set(this.canvasWidth*0.75, this.gameoverScreen.sheep.y);

		this.gameoverScreen.addChild(this.gameoverScreen.text1);
		this.gameoverScreen.addChild(this.gameoverScreen.text2);

		textOpt3 = {
			fontFamily: 'TimeBurnerBold',
			fill: "#37474f",
			letterSpacing: 5,
			align: 'center',
			padding: 10,
			fontSize: 40
		};

		this.gameoverScreen.scoreText = new PIXI.Text("Score: 0", textOpt3);
		this.gameoverScreen.highscoreText = new PIXI.Text("Highscore: 0", textOpt3);
		this.gameoverScreen.scoreText.anchor.set(0.5, 0.5);
		this.gameoverScreen.highscoreText.anchor.set(0.5, 0.5);

		this.gameoverScreen.scoreText.position.set(this.canvasWidth/2, this.canvasHeight*0.5-15);
		this.gameoverScreen.highscoreText.position.set(this.canvasWidth/2, this.canvasHeight*0.58-15);

		this.gameoverScreen.addChild(this.gameoverScreen.scoreText);
		this.gameoverScreen.addChild(this.gameoverScreen.highscoreText);

		var buttonHeight = 105, buttonWidth = 335, padd = 100;
		var pseudoPaddX = 80, pseudoPaddY = 120; //for making the hitbox bigger
		var iconPos = 75;
		textOpt2 = {
			fontFamily: 'TimeBurner',
			fill: "#cfd8dc",
			letterSpacing: 5,
			align: 'center',
			padding: 10,
			fontSize: 40
		};

			//-Restart
		this.restartButton = new PIXI.Container();

		this.restartButton.position.set(this.canvasWidth/2-buttonWidth-padd,this.canvasHeight*0.65);

		this.restartButton.icon = this.sprites.icons["restart"];
		this.restartButton.icon.anchor.set(0.5, 0.5);
		this.restartButton.icon.scale.set(0.6, 0.6);
		this.restartButton.icon.position.set(iconPos,buttonHeight/2);
		this.restartButton.icon.alpha = 1;
		this.restartButton.icon.tint = 0xcfd8dc;

		this.restartButton.background = new PIXI.Graphics();
		this.restartButton.background.beginFill(0x263238, 0.9)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();

		this.restartButton.pseudoBg = new PIXI.Graphics();
		this.restartButton.pseudoBg.beginFill(0x263238, 0)
			.drawRect(-pseudoPaddX,-pseudoPaddY,buttonWidth+2*pseudoPaddX,buttonHeight+2*pseudoPaddY)
		.endFill();
		this.restartButton.pseudoBg.alpha = 0;

		this.restartButton.text = new PIXI.Text("Retry",textOpt2);
		this.restartButton.text.anchor.set(0.5, 0.5);
		this.restartButton.text.position.set(buttonWidth/2+iconPos/2-15, buttonHeight/2);

		this.restartButton.interactive = true;
		this.restartButton.buttonMode = true;
		this.restartButton.on((_isMobile)?"touchend":"mouseup",this.newGame.bind(this));

		textOpt3 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x263238",
			letterSpacing: 1,
			align: 'center',
			padding: 10,
			fontSize: 23,
			wordWrap: true,
			wordWrapWidth: buttonWidth+50
		};

		this.restartButton.footnote = new PIXI.Text("Start a new game",textOpt3);
		this.restartButton.footnote.anchor.set(0.5, 0);
		this.restartButton.footnote.position.set(buttonWidth/2, buttonHeight+15);

		this.restartButton.addChild(this.restartButton.pseudoBg);
		this.restartButton.addChild(this.restartButton.background);
		this.restartButton.addChild(this.restartButton.icon);
		this.restartButton.addChild(this.restartButton.text);
		this.restartButton.addChild(this.restartButton.footnote);

		this.gameoverScreen.addChild(this.restartButton);

			//-Second Chance
		this.reviveButton = new PIXI.Container();

		this.reviveButton.position.set(this.canvasWidth/2+padd,this.restartButton.y);

		this.reviveButton.background = new PIXI.Graphics();
		this.reviveButton.background.beginFill(0x263238, 0.9)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();

		this.reviveButton.pseudoBg = new PIXI.Graphics();
		this.reviveButton.pseudoBg.beginFill(0x263238, 0)
			.drawRect(-pseudoPaddX,-pseudoPaddY,buttonWidth+2*pseudoPaddX,buttonHeight+2*pseudoPaddY)
		.endFill();
		this.reviveButton.pseudoBg.alpha = 0;

		this.reviveButton.icon = this.sprites.icons["ad"];
		this.reviveButton.icon.anchor.set(0.5, 0.5);
		this.reviveButton.icon.scale.set(0.6, 0.6);
		this.reviveButton.icon.position.set(iconPos,buttonHeight/2);
		this.reviveButton.icon.alpha = 1;
		this.reviveButton.icon.tint = 0xcfd8dc;

		this.reviveButton.text = new PIXI.Text("Revive",textOpt2);
		this.reviveButton.text.anchor.set(0.5, 0.5);
		this.reviveButton.text.position.set(buttonWidth/2+iconPos/2, buttonHeight/2);

		this.reviveButton.interactive = true;
		this.reviveButton.buttonMode = true;
		this.reviveButton.on((_isMobile)?"touchend":"mouseup",this.try_revive.bind(this));

		this.reviveButton.overlay = new PIXI.Graphics();
		this.reviveButton.overlay.beginFill(0xb0bec5, 0.75)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();
		this.reviveButton.overlay.visible = false;

		this.reviveButton.footnote = new PIXI.Text("You can only revive once per game",textOpt3);
		this.reviveButton.footnote.anchor.set(0.5, 0);
		this.reviveButton.footnote.position.set(buttonWidth/2, buttonHeight+15);

		this.reviveButton.addChild(this.reviveButton.pseudoBg);
		this.reviveButton.addChild(this.reviveButton.background);
		this.reviveButton.addChild(this.reviveButton.icon);
		this.reviveButton.addChild(this.reviveButton.text);
		this.reviveButton.addChild(this.reviveButton.overlay);
		this.reviveButton.addChild(this.reviveButton.footnote);

		this.gameoverScreen.addChild(this.reviveButton);

			//-Share Button
		this.shareButton = new PIXI.Container();
		this.shareButton.position.set(this.canvasWidth/2+280,(this.gameoverScreen.scoreText.y+this.gameoverScreen.highscoreText.y)/2-20);

		this.shareButton.pseudoBg = new PIXI.Graphics();
		this.shareButton.pseudoBg.beginFill(0x263238, 0)
			.drawCircle(0, 0, 100)
		.endFill();
		this.shareButton.pseudoBg.alpha = 0;

		this.shareButton.icon = this.sprites.icons["post"]; //weird bug where icons with names share and social are prevented from loading. possibly by adblocker
		this.shareButton.icon.anchor.set(0.5, 0.5);
		this.shareButton.icon.scale.set(0.8, 0.8);
		this.shareButton.icon.tint = 0x263238;
		this.shareButton.icon.alpha = 1;

		textOpt3 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x263238",
			letterSpacing: 4,
			align: 'center',
			padding: 10,
			fontSize: 20,
		};

		this.shareButton.text = new PIXI.Text("SHARE",textOpt3);
		this.shareButton.text.anchor.set(0.5, 0.5);
		this.shareButton.text.position.set(this.shareButton.icon.x, this.shareButton.icon.y+60);

		this.shareButton.addChild(this.shareButton.pseudoBg);
		this.shareButton.addChild(this.shareButton.icon);
		this.shareButton.addChild(this.shareButton.text);

		this.shareButton.buttonMode = true;
		this.shareButton.interactive = true;
		this.shareButton.on((_isMobile)?"touchend":"mouseup",this.share_social.bind(this));

		this.gameoverScreen.addChild(this.shareButton);

			//-Tips
		var textOpt4 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x263238",
			letterSpacing: 1,
			align: 'center',
			padding: 10,
			fontSize: 30
		};

		this.gameoverScreen.tipText = new PIXI.Text("Tip: ",textOpt4);

		this.gameoverScreen.tipText.anchor.set(0.5, 0.5);
		this.gameoverScreen.tipText.position.set(this.canvasWidth/2, this.canvasHeight-80);

		this.gameoverScreen.addChild(this.gameoverScreen.tipText);

		//this.gameoverScreen.visible = false;

		/* SHOP MENU */
		this.shop = new PIXI.Container();

		rect = new PIXI.Graphics();
		rect.beginFill(0x263238, 0.98)
			.drawRect(0, 0,this.canvasWidth,this.canvasHeight)
		.endFill();

		this.shop.addChild(rect);

		textOpt = {
			fontFamily: 'TimeBurnerBold',
			fill: "#cfd8dc",
			stroke: "#90a4ae",
			strokeThickness: 10,
			letterSpacing: 10,
			align: 'center',
			padding:10
		};

		//Title
		text = new PIXI.Text("STORE",Object.assign(textOpt,{fontSize:60}));
		text.anchor.set(0.5, 0);
		text.alpha = 0.98;
		text.x = this.canvasWidth/2;
		text.y = 25;

		//this.shop.addChild(text);

		//Coins
		textOpt2 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0xcfd8dc",
			letterSpacing: 5,
			padding:10,
			align: 'center',
			fontSize: 24
		};

		/*
		this.shop.coin_icon = this.sprites.icons["coin"];
		this.shop.coin_icon.alpha = 1;
		this.shop.coin_icon.tint = 0x455a64;
		this.shop.coin_icon.scale.set(0.6, 0.6);
		this.shop.coin_icon.position.set(this.canvasWidth/2-this.coins.toString().length*34*2, 140);
		*/

		this.shop.coin_title = new PIXI.Text("Total Coins:",textOpt2);
		this.shop.coin_title.anchor.set(0.5, 0.5);
		this.shop.coin_title.position.set(this.canvasWidth/2, 58);

		this.shop.coin_text = new PIXI.Text(this.coins,Object.assign(textOpt2,{fontSize:40}));
		this.shop.coin_text.anchor.set(0.5, 0.5);
		this.shop.coin_text.position.set(this.canvasWidth/2, 118);

		this.shop.addChild(this.shop.coin_title);
		this.shop.addChild(this.shop.coin_text);

		//Tabs
		var tab, _nm;

		textOpt3 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x455A64",
			letterSpacing: 5,
			padding:10,
			align: 'center',
			fontSize: 30
		};

		this.shop.tabs = {};

		var tabMarginTop = 190, tabHeight = 80;

		for(i=0;i<this.shopTabNames.length;i++){
			this.shop.tabs[this.shopTabNames[i]] = new PIXI.Container();

			tab = this.shop.tabs[this.shopTabNames[i]];
			tab.name = this.shopTabNames[i];

			tab.alpha = 1;

			tab._height = tabHeight;
			tab._width = (this.canvasWidth/this.shopTabNames.length);

			tab.bg = new PIXI.Graphics();
			tab.bg.beginFill(0xcfd8dc, 0.98)
				.drawRect(0, 0,tab._width,tab._height)
			.endFill();

			tab.text = new PIXI.Text(this.shopTabNames[i].toTitleCase(),textOpt3);
			tab.text.anchor.set(0.5, 0.5);
			tab.text.position.set(tab._width/2, tab._height/2);

			tab.line = new PIXI.Graphics();
			tab.line.lineStyle(1, 0x607d8b)
				.moveTo(0, 0).lineTo(0,tab._height);

			tab.position.set(i*tab._width, tabMarginTop);

			tab.overlay = new PIXI.Graphics();
			tab.overlay.beginFill(0x455a64, 0.45)
				.drawRect(0, 0,tab._width,tab._height)
			.endFill();
			if(i) tab.overlay.visible = true;
			else tab.overlay.visible = false;

			tab.addChild(tab.bg);
			tab.addChild(tab.text);
			if(i) tab.addChild(tab.line);
			tab.addChild(tab.overlay);

			this.shop.tabs[this.shopTabNames[i]] = tab;

			this.shop.addChild(tab);

			tab.interactive = true;
			tab.buttonMode = true;
			tab.on((_isMobile)?"touchend":"mouseup",this.switchShopTab.bind(this,tab.name));
		}

		var content;
		this.shop.tabContent = {};

		for(i=0;i<this.shopTabNames.length;i++){
			this.shop.tabContent[this.shopTabNames[i]] = new PIXI.Container();

			content = this.shop.tabContent[this.shopTabNames[i]];
			content.name = this.shop.tabContent[i];

			content.alpha = 1;

			content.bg = new PIXI.Graphics();
			content.bg.beginFill(0xcfd8dc, 0.98)
				.drawRect(0, 0,this.canvasWidth,this.canvasHeight-tabHeight-tabMarginTop+1)
			.endFill();

			content.position.set(0,tabHeight+tabMarginTop-1);

			content.addChild(content.bg);

			this.shop.tabContent[this.shopTabNames[i]] = content;

			this.shop.addChild(content);
		}

		//Prepare actual content for the upgrades and store
		this.prepareShopContent();

		this.shop.interactive = true;
		this.shop.buttonMode = true;
		this.shop.on((_isMobile)?"touchend":"mouseup",function(){
			this.preventHeroMovement++;
		}.bind(this));

		this.switchShopTab(this.shopTabNames[0]);

		/* PLAY GAMES MENU */
		this.playGamesMenu = new PIXI.Container();

		rect = new PIXI.Graphics();
		rect.beginFill(0x263238, 0.98)
			.drawRect(0, 0,this.canvasWidth,this.canvasHeight)
		.endFill();

		this.playGamesMenu.addChild(rect);

		textOpt = {
			fontFamily: 'TimeBurnerBold',
			fill: "#cfd8dc",
			stroke: "#90a4ae",
			strokeThickness: 10,
			letterSpacing: 10,
			align: 'center',
			padding:10
		};

		//Title
		text = new PIXI.Text("PLAY GAMES",Object.assign(textOpt,{fontSize:60}));
		text.anchor.set(0.5, 0);
		text.alpha = 0.98;
		text.x = this.canvasWidth/2;
		text.y = 25;

		this.playGamesMenu.addChild(text);

		//Welcome
		textOpt2 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0xcfd8dc",
			letterSpacing: 5,
			padding:10,
			align: 'center',
			fontSize: 24
		};

		this.playGamesMenu.profile = new PIXI.Container();
		var profile = this.playGamesMenu.profile;

		profile.position.set(this.canvasWidth/2, 225);

		profile.welcome_text = new PIXI.Text("Welcome,",textOpt2);
		profile.player_text = new PIXI.Text("PLAYER",Object.assign(textOpt2,{fontSize:48}));

		profile.welcome_text.anchor.set(0.5, 0.5);
		profile.player_text.anchor.set(0.5, 0.5);

		profile.welcome_text.y -= 55;

		profile.addChild(profile.welcome_text);
		profile.addChild(profile.player_text);

		this.playGamesMenu.profile = profile;
		this.playGamesMenu.addChild(this.playGamesMenu.profile);

		//Tabs
		this.playGamesMenu.tabs = {
			"leaderboard": new PIXI.Container(),
			"achievements": new PIXI.Container(),
			//"saved_games": new PIXI.Container(),
			"logout": new PIXI.Container()
		};
		var tabsNamesArr = ["Leaderboard","Achievements",/*"Saved Games",*/"Logout"];
		var tab, _nm;

		textOpt3 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x455A64",
			letterSpacing: 5,
			padding:10,
			align: 'center',
			fontSize: 32
		};

		for(i=0;i<tabsNamesArr.length;i++){
			_nm = tabsNamesArr[i].toLowerCase().split(" ").join("_");
			tab = this.playGamesMenu.tabs[_nm];
			tab.name = _nm;

			tab.alpha = 1;

			tab._height = 350;
			tab._width = 350;
			tab._diff = 80;
			tab._marginTop = 340;
			tab._marginLeft = (this.canvasWidth-tabsNamesArr.length*tab._width)/(tabsNamesArr.length+1);

			tab.bg = new PIXI.Graphics();
			tab.bg.beginFill(0xcfd8dc, 0.98)
				.drawRect(0, 0,tab._width-2,tab._height)
			.endFill();

			tab.text = new PIXI.Text(tabsNamesArr[i],textOpt3);
			tab.text.anchor.set(0.5, 0.5);
			tab.text.position.set(tab._width/2, tab._height-60);

			tab.icon = this.sprites.icons[_nm];
			tab.icon.anchor.set(0.5, 0.5);
			tab.icon.scale.set(1.3, 1.3);
			tab.icon.tint = 0x455A64;
			tab.icon.alpha = 1;
			tab.icon.position.set(tab.text.x, tab._height/2-25);

			tab.position.set(tab._marginLeft*(i+1)+tab._width*i, tab._marginTop);

			tab.addChild(tab.bg);
			tab.addChild(tab.text);
			tab.addChild(tab.icon);

			this.playGamesMenu.addChild(tab);

			tab.interactive = true;
			tab.buttonMode = true;
			tab.on((_isMobile)?"touchend":"mouseup",this.pressPlayGamesButton.bind(this,tab.name));
		}

		this.playGamesMenu.interactive = true;
		this.playGamesMenu.buttonMode = true;
		this.playGamesMenu.on((_isMobile)?"touchend":"mouseup",function(){
			this.preventHeroMovement++;
		}.bind(this));

		/* Back button */
		textOpt4 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x90a4ae",
			letterSpacing: 5,
			padding:10,
			align: 'center',
			fontSize: 25
		};

		this.backButton = new PIXI.Container();
		this.backButton.position.set(this.canvasWidth-70,this.canvasHeight-100);

		this.backButton.pseudoBg = new PIXI.Graphics();
		this.backButton.pseudoBg.beginFill(0x263238, 0)
			.drawCircle(0, 18, 90)
		.endFill();
		this.backButton.pseudoBg.alpha = 0;

		this.backButton.icon = this.sprites.icons["back"];
		this.backButton.icon.alpha = 1;
		this.backButton.icon.position.set(0, 0);

		this.backButton.text = new PIXI.Text("BACK",textOpt4);
		this.backButton.text.anchor.set(0.5, 0.5);
		this.backButton.text.position.set(-0.5, 62);

		this.backButton.addChild(this.backButton.pseudoBg);
		this.backButton.addChild(this.backButton.icon);
		this.backButton.addChild(this.backButton.text);

		this.backButton.interactive = true;
		this.backButton.buttonMode = true;
		this.backButton.on((_isMobile)?"touchend":"mouseup", this.closeAllMenus.bind(this));

		this.backButton.visible = false;
	};

	this.allAssetsLoaded = function(){
			var i;

			this.generateOverlays();
			this.ads.init();
			this.purchases.load();

			console.log("All assets loaded.");

			this.sprites.background.alpha = 0;

			//Sheep
			sheep = new PIXI.Sprite(this.animations.sheep_base.frames[1]);
			sheep.anchor.set(0.5, 0.5);
			sheep.scale.set(0.35, 0.35);
			sheep.rotation = -Math.PI/50;
			sheep.position.set(this.canvasWidth/2-190,this.canvasHeight/2-120);

			//Speech bubble
			var speech_bubble = new PIXI.Container();
			speech_bubble.position.set(this.canvasWidth/2,this.canvasHeight*0.66-10);

			//-Bubble
			var bubble = new PIXI.Graphics();
			bubble._width = 750+20;
			bubble._height = 300+30;
			bubble._radius = 40;
			bubble.beginFill(0xcfd8dc)
				.drawRoundedRect(-bubble._width/2,-bubble._height/2,bubble._width,bubble._height,bubble._radius)
				.drawPolygon( new PIXI.Point(-bubble._width/2+255,-bubble._height/2-45) , new PIXI.Point(-125,-bubble._height/2), new PIXI.Point(-95,-bubble._height/2) )
			.endFill();

			//-Text
			var textOpt = {
				fontFamily: 'TimeBurner',
				fill: "#607d8b",
				letterSpacing: 2,
				padding: 10,
				align: 'center',
				fontSize: 38
			};

			var text = new PIXI.Text(
				"Run to the End of the Treadmill. \nAvoid the Spikes. Repeat. \n"+
				((_isMobile)?"Left button":"[RIGHT]")+
				" to RUN\n"+
				((_isMobile)?"Right button":"[SPACE]+RUN")+
				" to SPRINT\n\n- "+
				((_isMobile)?"TAP":"Click/RUN")+
				" to Start! -",
				textOpt
			);
			text.anchor.set(0.5, 0.5);

			speech_bubble.addChild(bubble);
			speech_bubble.addChild(text);

			//Re-position mute buttons
			this.startScreen.buttonsOffset = 70;

			this.muteMusicButton.x += this.startScreen.buttonsOffset;
			this.muteFXButton.x += this.startScreen.buttonsOffset;

			this.loadOptions();

			//Fade In Animation
			this.fadeObjects = [sheep, speech_bubble, this.infoOverlay, this.playGamesMenu, this.shop, this.muteMusicButton, this.muteFXButton, this.infoButton, this.gamesButton, this.webButton, this.shopButton, this.backButton];
				//in order of intended z-index

			for(i=0;i<this.fadeObjects.length;i++){
				this.fadeObjects[i].alpha = 0;
				stage.addChild(this.fadeObjects[i]);
			}

			var _fadeTimeInc = 10; //ms
			this.fadeInTimer = new Date().getTime();

			//Begin fade in via requestAnimationFrame.
			//WARNING: DO NOT USE SET INTERVAL
			//--After animation is complete, user can now "jump" to start the game.
			requestAnimationFrame(this.fadeInAnimation.bind(this,_fadeTimeInc));
	};

	this.fadeInAnimation = function(timeInc){
		/*
		var t = new Date().getTime();
		if(t-this.fadeInTimer>=timeInc){
			this.fadeInTimer = t;
		}
		//*/

		var i;
		var _fadeInc = 0.025;

		for(i=0;i<this.fadeObjects.length;i++){
			if(this.fadeObjects[i] == this.infoOverlay) continue;
			if(this.fadeObjects[i] == this.playGamesMenu) continue;
			if(this.fadeObjects[i] == this.shop) continue;

			this.fadeObjects[i].alpha += _fadeInc;
		}

		renderer.render(stage);

		//Once fade in animation is complete, allow user to "jump" to start game
		if(sheep.alpha>=1){
			for(i=0;i<this.fadeObjects.length;i++){
				if(this.fadeObjects[i] == this.infoOverlay) continue;
				//if(this.fadeObjects[i] == this.playGamesMenu) continue;

				this.fadeObjects[i].alpha = 1;
			}

			this.playGamesMenu.visible = false;
			this.shop.visible = false;

			this.startScreen.interactive = true;
			this.startScreen.buttonMode = true;

			this._runToStartGame = true;

			this.preventHeroMovement = 0;
			//Need to do it like this as .bind() changes the signature of the function
			startGameFn = this.startGame.bind(this);
			renderer.view.addEventListener((_isMobile)?"touchend":"mouseup", startGameFn);

			renderer.render(stage);

			console.log("Ready: Jump to start!");

			this.initPlayGames();

			return;
		}

		requestAnimationFrame(this.fadeInAnimation.bind(this));
	};

	this.startGame = function(){
		var i, j;

		if(this.preventHeroMovement){
			console.log(this.preventHeroMovement);
			this.preventHeroMovement--;
			return;
		}

		if(this._gameStarted) return;

		console.log("Let the games begin!");

		//Remove unnecessary tap/click event listener used for starting the game
		renderer.view.removeEventListener((_isMobile)?"touchend":"mouseup", startGameFn);

		this._runToStartGame = false;
		this._gameStarted = true;

		//Remove start screen items
		stage.removeChild(this.startScreen);

		for(i=0;i<this.fadeObjects.length;i++){
			stage.removeChild(this.fadeObjects[i]);
		}

		//Reinstate buttons and background
		this.sprites.background.alpha = 1;
		this.muteMusicButton.x -= this.startScreen.buttonsOffset;
		this.muteFXButton.x -= this.startScreen.buttonsOffset;

		/* ADDING OBJECTS FOR ACTUAL GAME */
		//--CRITICAL PERFORMANCE BOOST: ADD ALL THE ITEMS REQUIRED FOR THE GAME ONCE.
		//--THEN RESET VARIABLES, COORDINATES ETC IN newGame()

		//BG
		this.sprites.background.scrollingSpeed = 0.5;

		//LOAD SCORES AND OPTIONS
		this.score = 0;

		var textOpt = {
			fontFamily: 'TimeBurnerBold',
			fill: "#cfd8e0",
			stroke: "#b0becf",
			strokeThickness: 10,
			letterSpacing: 10,
			align: 'center'
		};

		//-Score text
		this.scoreText =  new PIXI.Text(this.score.toString(), Object.assign(textOpt, { fontSize: 120 }));

		this.scoreText.alpha = 0.7;
		this.scoreText.anchor.set(1, 0.5);
		this.scoreText.x = this.canvasWidth/2 + 30;
		this.scoreText.y = this.canvasHeight/2;

		stage.addChild(this.scoreText);

		//-Highscore text
		this.highscoreText = new PIXI.Text(this.highscore.toString(), Object.assign(textOpt, { fontSize:40 }));

		this.highscoreText.alpha = 0.7;
		this.highscoreText.anchor.set(0, 0.5);
		this.highscoreText.x = this.canvasWidth/2 + 70;
		this.highscoreText.y = this.canvasHeight/2 + 80;
		stage.addChild(this.highscoreText);

		//-"/"-symbol
		this.overSym = new PIXI.Text("/",Object.assign(textOpt,{fontSize:50}));

		this.overSym.alpha = 0.7;
		this.overSym.anchor.set(0.5, 0.5);
		this.overSym.x = this.canvasWidth/2 + 50;
		this.overSym.y = this.canvasHeight/2 + 50;
		stage.addChild(this.overSym);

		//CREATE OBSTACLE CONTAINER
		this.obstacles = new PIXI.Container();

		stage.addChild(this.obstacles);

		//CREATE POWERUP CONTAINER
		this.powerups = new PIXI.Container();
		stage.addChild(this.powerups);

		//CREATE TREADMILL CONTAINER AND SET SPECS
		this.treadmill = new PIXI.Container();

		//--Treadmill Gear Animation
		this.treadmill.gears = new PIXI.AnimatedSprite(this.animations["treadmill"].frames);

		this.treadmill.gears.animationSpeed = 0.25;
		this.treadmill.gears.loop = true;
		this.treadmill.gears.gotoAndPlay(1);

		this.treadmill.gears.anchor.set(0.5, 0.5);
		var _r = this.treadmill.gears.height/this.treadmill.gears.width;
		this.treadmill.gears.width = this.canvasWidth;
		this.treadmill.gears.height = _r * this.treadmill.gears.width;
		this.treadmill.gears.x = this.canvasWidth/2;
		this.treadmill.gears.y = this.canvasHeight-this.treadmill.gears.height/2;

		this.treadmill.gears.tint = 0x709db4;

		//--Treadmill Flag indicating
		this.treadmill.flag = new PIXI.Sprite(this.sprites.flag.texture);

		this.treadmill.flag.x = this.canvasWidth - this.treadmill.flag.width;
		this.treadmill.flag.y = this.canvasHeight - this.treadmill.flag.height/2 - this.treadmill.gears.height;
		this.treadmill.flag.anchor.set(0.5);

		this.treadmill.speed = this.treadmillMinSpeed;

		stage.addChild(this.treadmill);

		this.treadmill.addChild(this.treadmill.gears);
		this.treadmill.addChild(this.treadmill.flag);

		//HERO INITIALIZE
		this.hero.x = this.heroStartX.min;
		this.hero.y = this.canvasHeight - this.hero.sheep.height/2 - this.treadmill.gears.height;
		this.portalsPassed = 0;

		//--Speed and jump strength
		this.hero.vx = 0;//this.maxSpeed;
		this.hero.ax = 0;
		this.hero.vy = 0;
		this.hero.ay = 0;

		this.hero.running = false;
		this.hero.sprinting = false;

		this.preventHeroMovement = 0;

		//-Hero Shield
		this.heroShield = new PIXI.Graphics();
		this.heroShield.beginFill(0xffecb3, 0.6)
			.drawCircle(0, 0,this.hero.sheep.width/2+30)
		.endFill();
		this.heroShield.position = this.hero.position;

		stage.addChild(this.heroShield);
		stage.addChild(this.hero);

		//CREATE PLAY BUTTONS CONTAINER AND RESPECTIVE BUTTONS INSIDE
		this.playButtons = new PIXI.Container();

		this.playButtons.styles = {
			"bottomMargin": 35,
			"sideMargin": 50,
			"width": 220,
			"color": 0xffd54f, //0xFFA000,
			"disabledTint": 0x9e9e9e,
			"alpha": 0.6,
			"activeOffset": 10,
			"icon": {
				"tint": 0x212121,
				"alpha": 1,
				"scale": new PIXI.Point(1.4, 1.4),
				"anchor": new PIXI.Point(0.5, 0.5),
				"y": 5,
				"rotation": 5/(180/Math.PI) //in radians
			}
		};

		this.playButtons.childButtons = {
			"run":{
				"icon": this.sprites.icons["run"],
				"press": this.heroRun,
				"release": this.heroRun
			},
			"sprint":{
				"icon": this.sprites.icons["sprint"],
				"press": this.heroSprint,
				"release": this.heroSprint
			}
		};

		//this.playButtons.anchor.set(0, 0.5);
		this.playButtons.x = 0;
		this.playButtons.y = this.canvasHeight - this.playButtons.styles.bottomMargin - this.playButtons.styles.width/2;

		//--Button setup and positioning
		var playButton, cnt = 0;
		for(i in this.playButtons.childButtons){
			if(!this.playButtons.childButtons.hasOwnProperty(i)) continue;

			var nm = i.toString();

			this.playButtons[nm] = new PIXI.Container();

			playButton = this.playButtons[nm];

			playButton.x = this.playButtons.styles.sideMargin + this.playButtons.styles.width/2 + cnt*(this.playButtons.styles.sideMargin + this.playButtons.styles.width);
			playButton.y = 0;

			playButton.width = this.playButtons.styles.width;
			playButton.height = this.playButtons.styles.width;

			playButton.alpha = this.playButtons.styles.alpha;

			playButton.name = nm;

			//-Circle
			playButton.circle = new PIXI.Graphics();
			playButton.circle.beginFill(this.playButtons.styles.color)
				.drawCircle(0, 0, this.playButtons.styles.width/2)
			.endFill();

			//-Special Sprint Circle
			if(nm == "sprint"){
				playButton.x = this.canvasWidth - (this.playButtons.styles.sideMargin + this.playButtons.styles.width/2);

				this.sprint.circle = new PIXI.Container();

				this.sprint.circle.thickness = 15;
				this.sprint.circle.bg = new PIXI.Graphics();
				this.sprint.circle.bg.lineStyle(this.sprint.circle.thickness, 0xFFA000)
					.drawCircle(0, 0, (this.playButtons.styles.width + this.sprint.circle.thickness)/2);

				//TODO: Change colors
				this.sprint.circle.bar = new PIXI.Graphics();
				this.sprint.circle.bar.lineStyle(this.sprint.circle.thickness, 0xef6c00)
					.arc(0, 0, (this.playButtons.styles.width + this.sprint.circle.thickness)/2, -Math.PI/2, -Math.PI/2 + (this.sprint.level/50)*Math.PI);

				this.sprint.circle.addChild(this.sprint.circle.bg);
				this.sprint.circle.addChild(this.sprint.circle.bar);

				playButton.addChild(this.sprint.circle);
			}

			//-Icon
			playButton.icon = new PIXI.Sprite(this.playButtons.childButtons[i].icon.texture);
			for(j in this.playButtons.styles.icon){
				var _style = j.toString();
				if(!this.playButtons.styles.icon.hasOwnProperty(j)) continue;

				playButton.icon[_style] = this.playButtons.styles.icon[_style];
			}

			//-Add the graphics and icons and texts into the button container
			playButton.addChild(playButton.circle);
			playButton.addChild(playButton.icon);

			this.playButtons[nm] = playButton;

			this.playButtons.addChild(playButton);

			//-Add Clickability and Event Listeners
			playButton.interactive = true;
			playButton.buttonMode = true;

			playButton.on((_isMobile)?"touchstart":"mousedown", this.playButtonHandler.bind(this, nm));
			playButton.on((_isMobile)?"touchend":"mouseup", this.playButtonHandler.bind(this, nm));
			playButton.on((_isMobile)?"touchendoutside":"mouseupoutside", this.playButtonHandler.bind(this, nm));

			playButton.on("mouseover", this.playButtonHandler.bind(this, nm));
			playButton.on("mouseout", this.playButtonHandler.bind(this, nm));

			cnt++;
		}

		stage.addChild(this.playButtons);

		//ADD OVERLAYS TO STAGE
		//..GRAPHICS FOR PAUSE OVERLAY IS DONE IN INITIALISATION FOR PERFORMANCE
		//..ADDING DONE HERE FOR Z-INDEX
		this.pauseOverlay.alpha = 0;
		stage.addChild(this.pauseOverlay);

		this.gameoverScreen.visible = false;
		stage.addChild(this.gameoverScreen);

		this.infoOverlay.alpha = 0;
		stage.addChild(this.infoOverlay);

		this.playGamesMenu.alpha = 0;
		stage.addChild(this.playGamesMenu);

		this.shop.visible = false;
		stage.addChild(this.shop);

		this.backButton.visible = false;
		stage.addChild(this.backButton);

		//ADD BUTTONS
		//..GRAPHICS FOR BUTTONS IS DONE IN INITIALISATION FOR PERFORMANCE
		//..ADDING DONE HERE FOR Z-INDEX
		stage.addChild(this.pauseButton);
		stage.addChild(this.muteMusicButton);
		stage.addChild(this.muteFXButton);
		stage.addChild(this.infoButton);
		stage.addChild(this.gamesButton);
		stage.addChild(this.webButton);
		stage.addChild(this.shopButton);

		this.totalGamesPlayed = 0;

		//this.ads.showAd("banner");

		this.newGame();
	};

	this.playButtonHandler = function(nm, e){
		var playButton = this.playButtons[nm];

		switch(e.type){
			case "mousedown":
			case "touchstart":
				if(playButton) playButton.y = this.playButtons.styles.activeOffset;
				if(typeof this.playButtons.childButtons[nm]["press"] == "function"){
					this.playButtons.childButtons[nm]["press"].bind(this, e)();
				}
				break;
			case "mouseup":
			case "touchend":
			case "mouseupoutside":
			case "touchendoutside":
				if(playButton) playButton.y = 0;
				if(typeof this.playButtons.childButtons[nm]["release"] == "function"){
					this.playButtons.childButtons[nm]["release"].bind(this, e)();
				}
				break;
			case "mouseover":
				if(playButton) playButton.alpha = Math.min(playButton.alpha + 0.2, 1);
				break;
			case "mouseout":
				if(playButton) playButton.alpha = this.playButtons.styles.alpha;
				break;
			default:
				return;
		}

		return;
	};

	this.newGame = function(){
		renderer.view.focus();

		//RESET VARIABLES AND OBJECT POSITIONS
		//-Score
		this.scoreTimer = new Date().getTime();
		this.score = 0;
		this.scoreText.text = "0";

		this.scoreText.visible = true;
		this.highscoreText.visible = true;
		this.overSym.visible = true;

		//-Gameover Screen
		this.gameoverScreen.visible = false;

		this._revived = false;

		//-Hero
		this.playButtons.visible = true;
		this.treadmill.visible = true;
		this.hero.visible = true;
		this.hero.x = this.heroStartX.min;

		this.hero.running = false;
		this.hero.sprinting = false;
		this.hero.sheep.gotoAndStop(4);

		//--Reset positions of hats and capes
		this.setAccessoriesPositions(1);

		//--Reset speeds and jumpStrength
		this.hero.vx = 0; //this.minSpeed;
		this.hero.ax = 0;
		this.hero.vy = 0;
		this.hero.ay = 0;
		//this.hero.jumpStrength = (this.hero.scale.y>=0.35)?this.heroSpeed:this.heroSpeed_lamb;

		this.treadmill.speed = this.treadmillMinSpeed;
		this.sprint.level = 100;

		/*
		for(var i=0;i<this.sprint.circle.children.length;i++){
			this.sprint.circle.children[i].tint = this.playButtons.styles.disabledTint;
		}
		this.playButtons.sprint.circle.tint = this.playButtons.styles.disabledTint;
		*/
		
		//--Hero's shield
		this.heroShield.position = this.hero.position;
		if(this.startingShield){
			this.collectPowerup("shield");
		}
		else{
			this.heroShield.alpha = 0;

			this.shieldTimer = null;
		}
		this.preventHeroMovement = 0;

		//-Overlays
		this.pauseOverlay.alpha = 0;
		this.infoOverlay.alpha = 0;

		this.playGamesMenu.alpha = 0;
		this.playGamesMenu.visible = false;

		this.shop.visible = false;

		//-Obstacles
		var i;

		this.obstaclesFrozen = false;

		//-Games Played
		this.totalGamesPlayed++;

		//START UPDATE LOOP
		this._paused = false;

			//TIMERS
			this.pauseTime = {
				"global": 0,
				"obstacle": 0,
				"shield": 0,
				"freeze": 0
			};
			this.obstacleTimer = new Date().getTime();

		requestAnimationFrame(this.update.bind(this));
	};

	this.nextLevel = function(){
		//HERO
		//--Reset positions of hero, shield and accessories
		console.log(this.heroStartX);
		this.hero.x = Math.max(this.heroStartX.min - this.heroStartX.inc * this.portalsPassed, this.heroStartX.max);

		this.heroShield.position = this.hero.position;
		this.setAccessoriesPositions(1);

		//--Increase Hero Sprint Level
		this.sprint.level += Math.max(25*Math.pow(0.9, this.portalsPassed), 10);

		this.sprint.level = Math.min(Math.max(this.sprint.level, 0), 100);

		//TREADMILL
		//--Increment Treadmill Speed
		this.treadmill.speed *= this.treadmillIncSpeed;
		this.treadmill.speed = Math.min(this.treadmill.speed, this.treadmillMaxSpeed);
		//TODO: Treadmill animation speed is in proportion with actual speed of treadmill

		//RESET TIMERS
		this.pauseTime["obstacle"] = 0;
		this.obstacleTimer = new Date().getTime();

		//CLEAR OBSTACLES
		var i;
		for(i=this.obstacles.children.length-1;i>=0;i--){
			this.obstacles.removeChild(this.obstacles.children[i]);
		}

		//CLEAR POWERUPS
		for(i=this.powerups.children.length-1;i>=0;i--){
			this.powerups.removeChild(this.powerups.children[i]);
		}

		//INCREMENT SCORE
		this.portalsPassed++;
		this.incScore(this.portalsPassed*this.portalsScore*this.portalsScoreMultiplier);

		//CONTINUE GAME
		requestAnimationFrame(this.update.bind(this));
	};

	this.keyEvent = function(e){
		var i,j;
		for(i in this.controls){
			var keyArr = this.controls[i]["keys"];
			if(!this.controls[i][e.type]) continue;

			for(j=0;j<keyArr.length;j++){
				if(e.keyCode == keyArr[j]){
					this[this.controls[i]["callback"]](e);
					break;
				}
			}
		}
	};

	this.heroRun = function(e){
		if(e.type == "keyup" && this._runToStartGame){
			this._runToStartGame = false;
			this.startGame();
			return;
		}

		if(!this._gameStarted) return;

		if(this._paused) return;

		//this.audio["jump"].play();

		//Toggle Running
		//TODO: QUESTION: Toggle visibility of sprint button?
		switch(e.type){
			case "mousedown":
			case "touchstart":
			case "keydown":
				this.hero.running = true;
				this.hero.sheep.play();

				/*
				for(var i=0;i<this.sprint.circle.children.length;i++){
					this.sprint.circle.children[i].tint = 0xFFFFFF;
				}
				this.playButtons.sprint.circle.tint = 0xFFFFFF;
				//this.playButtons.sprint.visible = true;
				*/
				break;
			case "mouseup":
			case "touchend":
			case "mouseupoutside":
			case "touchendoutside":
			case "keyup":
				this.hero.running = false;
				//this.hero.sprinting = false;
				if(!this.hero.sprinting) this.hero.sheep.gotoAndStop(4);

				/*
				for(var i=0;i<this.sprint.circle.children.length;i++){
					this.sprint.circle.children[i].tint = this.playButtons.styles.disabledTint;
				}
				this.playButtons.sprint.circle.tint = this.playButtons.styles.disabledTint;

				//this.playButtons.sprint.visible = false;
				*/
				break;
			default: return;
		}
	};

	this.heroSprint = function(e){
		if(e.type == "keyup" && this._runToStartGame){
			this._runToStartGame = false;
			this.startGame();
			return;
		}

		switch(e.type){
			case "mousedown":
			case "touchstart":
			case "keydown":
				this.hero.sprinting = true;

				if(!this.hero.running){
					this.hero.sheep.play();
				}
				break;
			case "mouseup":
			case "touchend":
			case "mouseupoutside":
			case "touchendoutside":
			case "keyup":
				this.hero.sprinting = false;

				if(!this.hero.running) this.hero.sheep.gotoAndStop(4);
				break;
			default: return;
		}
	};

	this.update = function(){
		var i;

		if(this._paused || !this._gameStarted) return;

		//BACKGROUND MOVEMENT
		//this.sprites.background.tilePosition.x -= this.sprites.background.scrollingSpeed;

		//HERO MOVEMENT
		var overallSpd = -this.treadmill.speed;

		this.playButtons.visible = true;
		this.treadmill.visible = true;
		this.hero.visible = true;

		if(this.hero.sprinting){
            if(this.sprint.level>0){
                overallSpd += this.heroSpeed * this.sprint.multiplier;
                this.sprint.level -= this.sprint.dec;

				this.hero.sheep.animationSpeed = 0.35;
            }
			else {
				//Achievement
				if(!this.achievements.single.sprint_spent[0].complete || !this.achievements.single.sprint_spent[0].synced)  {
					this.GooglePlayServices.unlockAchievement("sprint_spent");
				}

				overallSpd += this.heroSpeed;
				this.hero.sheep.animationSpeed = 0.15;
			}
        }
		else if(this.hero.running){
			overallSpd += this.heroSpeed;

			this.hero.sheep.animationSpeed = 0.15;
        }
        else{
            this.sprint.level += this.sprint.inc;
        }

        this.sprint.level = Math.max(Math.min(100,this.sprint.level), 0);

		//CIRCULAR SPRINT LEVEL
		this.sprint.circle.bar.clear();
		this.sprint.circle.bar.lineStyle(this.sprint.circle.thickness, 0xef6c00)
			.arc(0, 0, (this.playButtons.styles.width + this.sprint.circle.thickness)/2, -Math.PI/2, -Math.PI/2 + (this.sprint.level/50)*Math.PI);

		this.hero.vx = overallSpd;

		this.hero.vx += this.hero.ax;
		this.hero.vy += this.hero.ay;

		this.hero.y += this.hero.vy;
		this.hero.x += this.hero.vx;

		this.heroShield.position = this.hero.position;

		//OBSTACLE MOVEMENT
		for(i=0;i<this.obstacles.children.length;i++){
			var obs = this.obstacles.children[i];

			if(!this.obstaclesFrozen){
				obs.tint = 0xFFFFFF;
				obs.vy += obs.ay;
				obs.y += obs.vy;
			} else {
				obs.tint = 0xb3e5fc;//0x81d4fa;
			}

			if(obs.y>=this.canvasHeight + obs.height){
				this.obstacles.removeChild(obs);
			}
		};

		//POWERUP MOVEMENT
		for(i=0;i<this.powerups.children.length;i++){
			var pwr = this.powerups.children[i];

			pwr.vy += pwr.ay;
			pwr.y += pwr.vy;

			if(pwr.y>=this.canvasHeight+pwr.height){
				this.powerups.removeChild(pwr);
			}
		};

		//HERO BOUNDS CHECKS
		this.hero.leeway = 10;

		//Check for hero x-direction (left-side) bounds, and gameover if necessary
		if(this.hero.x<=-this.hero.sheep.width/2-this.hero.leeway){
			this.gameover();
			return;
		}

		//Check for y-direction (right-side) bounds, reset with next level
		if(this.hero.x>=(this.canvasWidth-this.hero.sheep.width/2+this.hero.leeway)){
			this.nextLevel();
			return;
		}
		//RENDER
			//Do it here so that hit test doesn't seem to be "off"
		renderer.render(stage);

		//COLLISION CHECKS
			//-Obstacle
		for(i=0;i<this.obstacles.children.length;i++){
			var obs = this.obstacles.children[i];

			if(this.hitTest(this.hero, obs, this.hero.sheep.width * 0.25, this.hero.sheep.height * 0.15)){
				this.obstacles.removeChild(obs);

				if(this.heroShield.alpha){
					this.heroShield.alpha = 0;
					this.shieldTimer = 0;
				}
				else{
					this.gameover();
					return;
				}
			}
		}

		for(i=0;i<this.powerups.children.length;i++){
			var pwr = this.powerups.children[i];

			//Check for hero and powerup hitTest
			if(this.hitTest(this.hero, pwr, 5, 5)){
				this.collectPowerup(this.powerupNames[pwr.type]);
				this.powerups.removeChild(pwr);
			}
		}

		//TIMERS
		var t = new Date().getTime();

		//SCORING
		var timePassed = t - this.scoreTimer - this.pauseTime["global"];
		this.scoreTimer = t;
		this.pauseTime["global"] = 0;

		this.incScore(timePassed/1000*this.scorePerSecond);

		//OBSTACLE SPAWN
		if(t-this.obstacleTimer>=this.obstacleSpawnTime+this.pauseTime["obstacle"]){
			this.spawnObstacle();
		}

		//SHIELD FADE AWAY
		if(this.heroShield.alpha && t-this.shieldTimer>=this.shieldTimeInc+this.pauseTime["shield"]){
			this.shieldTimer = t;
			this.pauseTime["shield"] = 0;

			this.heroShield.alpha = Math.max(0,this.heroShield.alpha-this.shieldFadeInc);
		}

		if(this.obstaclesFrozen && t-this.obstaclesTimer>=this.obstaclesFreezeTime+this.pauseTime["freeze"]){
			this.pauseTime["freeze"] = 0;
			this.obstaclesFrozen = false;
		}

		//UPDATE
		requestAnimationFrame(this.update.bind(this));
	};

	this.incCoins = function(amt,sound){
		if(amt == null) return;
		if(sound == null) sound = false;

		this.coins+=parseInt(amt);

		if(amt>0){
			if(this.hero.sheep && this.hero.sheep.name == "sheep_gold"){
				this.coins+=this.goldenSheepBonus;
			}

			if(this.hero.cape.name == "royal_cape"){
				this.coins = this.coins*(1+this.royalCapeBonus);
			}
		}

		this.coins = parseInt(this.coins);

		//Update coin amount on screen/shop
		if(this.shop && this.shop.coin_text)
			this.shop.coin_text.text = this.coins;

		this.saveOptions("coin");

		if(sound && this.audio["coin"]){
			this.audio["coin"].play();
		}

		if(renderer) renderer.render(stage);
	};

	this.incScore = function(sc){
		this.score += sc;
		this.scoreText.text = Math.floor(this.score);

		//Gradually increase the number of obstacle sections in the game to max of 3
		/*
		switch(this.score){
			case 5:
				this.nObstacleSections = 2;

				this.showObstacleSections();
				this.obstacleTimer = new Date().getTime();

				this.obstacleSectionActive[this.nObstacleSections] = false;
				break;
			case 10:
				this.nObstacleSections = 3;

				this.showObstacleSections();
				this.obstacleTimer = new Date().getTime();

				this.obstacleSectionActive[this.nObstacleSections] = false;
				break;
			default:
				break;
		}
		*/

		this.saveOptions();
		this.highscoreText.text = this.highscore;

		//this.audio["bounce"].play();

		renderer.render(stage);
	};

	this.spawnObstacle = function(){
		if(this.obstaclesFrozen) return;

		//RESET TIMERS
		this.pauseTime["obstacle"] = 0;
		this.obstacleTimer = new Date().getTime();

		//SPAWN POWERUP OR OBSTACLE?
		//Make it mutually exclusive or possible to spawn both (separate speeds/positions ofc)?
		var hasPowerup = (Math.random()<=this.powerupChance); //is it a powerup or obstacle?

		//SET SIZES FOR OBSTACLE OR POWERUP
		//-Need these sizes for calculation of X/Y positions
		var obs = new PIXI.Sprite(this.sprites.spike.texture);

		obs.anchor.set(0.5);
		obs.scale.set(0.2,-0.2);

		this.setObstaclePosition(obs);

		this.obstacles.addChild(obs);

		if(hasPowerup){
			/* --POWERUPS--
			0: Coin
			1: Shield
			2: Freeze
			*/

			//Add powerup
			var type = getRandomInt(0,this.powerupNames.length-1);
			var powerup = new PIXI.Sprite(this.sprites.powerups[this.powerupNames[type]].texture);

			powerup.scale.set(0.3, 0.3);
			powerup.anchor.set(0.5);

			this.setObstaclePosition(powerup);

			//Allow powerup to fall from higher height
			powerup.y -= getRandomFloat(0, powerup.height/2);

			powerup.type = type;
			powerup.typeName = this.powerupNames[type];

			this.powerups.addChild(powerup);
		}
	};

	//-"Algo" to generate positions of the obstacle or powerup. Very Evil.
	this.setObstaclePosition = function(obj){
		var _dir = (Math.random() < 0.3) ? -1 : 1; //choose whether spike is behind or in front of player
		var _range = obj.width*this.obstacleRange; //maximum range away from center of player

		//--Set X positions somewhere around the player
	    var startX = _dir*getRandomFloat(0, _range) + this.hero.x; //make it such that it's near to the player positon (muhaha)
        startX = Math.min(this.canvasWidth - obj.width/2, Math.max(obj.width/2, startX)); //ensure still within range
		var startY = obj.height/2;

		//--Ramp up acceleration as number of portals passed increases
		var _startG = 0.08;
		var _maxG = 0.25;
		var accY = getRandomFloat(_startG, Math.min(_startG + this.portalsPassed * 0.01, _maxG))

		obj.x = startX;
		obj.y = startY;
		obj.vy = 0;
		obj.ay = accY;

		return;
	};

	this.collectPowerup = function(type_name){
		var i;

		/* --POWERUPS--
		0: Coin
		1: Shield
		2: Freeze
		*/

		switch(type_name){
			//COIN
			case 0:
			case "coin":
				this.incCoins(this.coinIncAmt, true);
				break;
			//SHIELD
			case 1:
			case "shield":
				this.heroShield.alpha = 1;
				this.shieldTimer = new Date().getTime();
				this.audio["shield"].play();
				break;
			//FREEZE
			case 2:
			case "freeze":
				this.obstaclesFrozen = true;
				this.obstaclesTimer = new Date().getTime();

				this.audio["freeze"].play();
				break;
			default:
				return;
		}

		//ACHIEVEMENT:
			//-Single:
			if(!this.achievements.single.shield_once[0].complete || !this.achievements.single.shield_once[0].synced)  {
				this.GooglePlayServices.unlockAchievement("shield_once");
			}
			//-Incremental:
			for(i=0;i<this.achievements.incremental.shield.length;i++){
				if(!this.achievements.incremental.shield[i].complete || !this.achievements.incremental.shield[i].synced) {
					this.GooglePlayServices.incrementAchievement("shield", i, 1);
				}
			}
	};

	this.appBlur = function(){
		//Turn off music otherwise it will play in the background
		if(this.audio["main_music"])
			this.audio["main_music"].pause();

		this.togglePause(true);
	};

	this.appFocus = function(){
		//Turn back on music, checking if it was playing originally
		if(!this._musicMuted){
			if(this.audio["main_music"])
				this.audio["main_music"].play();
		}
	};

	this.showShop = function(e){
		if(typeof e == "object"){
			if(e.type=="mouseup" || e.type=="touchend"){
				this.preventHeroMovement++;
			}
		}

		//Toggle shop visibility
		if(this.shop.visible){
			this.closeAllMenus();
		}
		else{
			this.togglePause(true);

			this.closeAllMenus();

			this.shop.visible = true;
			this.switchShopTab(this.shopTabNames[0]);

			this.backButton.icon.tint = 0x455a64;
			this.backButton.text.style.fill = 0x455a64;
			this.backButton.visible = true;
		}

		renderer.render(stage);
	};

	this.switchShopTab = function(name){
		//Upgrades buttons overlays
		switch(name){
			case "upgrades":
				this.updateUpgradesPage();
				break;
			case "accessories":
				this.updateAccessoriesPage();
				break;
			case "coins":
				this.updateCoinsPage();
				break;
			default: return;
		}

		//Tab overlays
		var i;
		for(i=0;i<this.shopTabNames.length;i++){
			this.shop.tabs[this.shopTabNames[i]].overlay.visible = true;
			this.shop.tabContent[this.shopTabNames[i]].visible = false;
		}

		this.shop.tabContent[name].visible = true;
		this.shop.tabs[name].overlay.visible = false;

		renderer.render(stage);
	};

	this.prepareShopContent = function(){
		//Preparation of actual content in the shop
		var i,j;
		var nm, data;

		this.loadOptions();

		/* UPGRADES */
		var totalUpgrades = Object.keys(this.upgrades).length;

		var buttonHeight = 75, buttonWidth = 280;
		var pseudoPaddX = 15, pseudoPaddY = 55; //for making the button hitbox bigger
		var iconPos = 65;

		var contentHeight = this.shop.tabContent["upgrades"].bg.height;
		var height, width;

		var footnoteText = "";

		width = (this.canvasWidth)/Math.min(totalUpgrades, 5);
		height = contentHeight/2;

		var textOpt = {
			fontFamily: 'TimeBurner',
			fill: "#cfd8dc",
			letterSpacing: 5,
			align: 'center',
			padding: 10,
			fontSize: 36
		};

		var textOpt2 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x263238",
			letterSpacing: 1,
			align: 'center',
			padding: 10,
			fontSize: 20,
			lineHeight: 28,
			wordWrap: true,
			wordWrapWidth: buttonWidth+50
		};

		var textOpt3 = {
			fontFamily: 'TimeBurner',
			fill: "0x263238",
			letterSpacing: 5,
			align: 'center',
			padding: 10,
			fontSize: 40
		};

		var textOpt4 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x263238",
			letterSpacing: 1,
			align: 'center',
			padding: 10,
			fontSize: 21,
			wordWrap: true,
			wordWrapWidth: width-60
		};

		var cnt = 0;

		for(i in this.upgrades){
			if(!this.upgrades.hasOwnProperty(i)) continue;

			nm = i.toString();
			data = this.upgrades[i];

			this.upgradesSection[nm] = new PIXI.Container();

			this.upgradesSection[nm].position.set(width*(cnt%5),(cnt<5)?-5:(contentHeight/2-25));

			this.upgradesSection[nm].bg = new PIXI.Graphics();
			this.upgradesSection[nm].bg.lineStyle(1, 0x263238, 0.2)
				.moveTo(0, 20).lineTo(0,contentHeight-20);

				//-Title
			this.upgradesSection[nm].title = new PIXI.Text(data["title"],textOpt3);
			this.upgradesSection[nm].title.anchor.set(0.5, 0.5);
			this.upgradesSection[nm].title.position.set(width/2, 60);

				//-Desc
			this.upgradesSection[nm].desc = new PIXI.Text(data["desc"],textOpt4);
			this.upgradesSection[nm].desc.anchor.set(0.5, 0.5);
			this.upgradesSection[nm].desc.position.set(width/2, 130);

				//-Button
			this.upgradesSection[nm].button = new PIXI.Container();

			this.upgradesSection[nm].button.position.set(width/2-buttonWidth/2, height-buttonHeight-62);

			this.upgradesSection[nm].button.icon = new PIXI.Sprite(this.sprites.icons["coin"].texture);
			this.upgradesSection[nm].button.icon.anchor.set(0.5, 0.5);
			this.upgradesSection[nm].button.icon.scale.set(0.5, 0.5);
			this.upgradesSection[nm].button.icon.position.set(iconPos,buttonHeight/2-2.5);
			this.upgradesSection[nm].button.icon.alpha = 1;
			this.upgradesSection[nm].button.icon.tint = 0xcfd8dc;

			this.upgradesSection[nm].button.background = new PIXI.Graphics();
			this.upgradesSection[nm].button.background.beginFill(0x263238, 0.9)
				.drawRect(0, 0,buttonWidth,buttonHeight)
			.endFill();

			this.upgradesSection[nm].button.pseudoBg = new PIXI.Graphics();
			this.upgradesSection[nm].button.pseudoBg.beginFill(0x263238, 0)
				.drawRect(-pseudoPaddX,-pseudoPaddY,buttonWidth+2*pseudoPaddX,buttonHeight+2*pseudoPaddY)
			.endFill();

			this.upgradesSection[nm].button.text = new PIXI.Text(data["cost"]*(data["increment_count"]+1),textOpt);
			this.upgradesSection[nm].button.text.anchor.set(0.5, 0.5);
			this.upgradesSection[nm].button.text.position.set(buttonWidth/2+iconPos/2-15, buttonHeight/2);

			this.upgradesSection[nm].button.interactive = true;
			this.upgradesSection[nm].button.buttonMode = true;
			this.upgradesSection[nm].button.on((_isMobile)?"touchend":"mouseup",this.performUpgrade.bind(this,nm));

			this.upgradesSection[nm].button.footnote = new PIXI.Text(footnoteText,textOpt2);
			this.upgradesSection[nm].button.footnote.anchor.set(0.5, 0);
			this.upgradesSection[nm].button.footnote.position.set(buttonWidth/2, buttonHeight+10);

			this.upgradesSection[nm].button.overlay = new PIXI.Graphics();
			this.upgradesSection[nm].button.overlay.beginFill(0xb0bec5, 0.75)
				.drawRect(0, 0,buttonWidth,buttonHeight)
			.endFill();
			this.upgradesSection[nm].button.overlay.visible = false;

			this.upgradesSection[nm].button.addChild(this.upgradesSection[nm].button.pseudoBg);
			this.upgradesSection[nm].button.addChild(this.upgradesSection[nm].button.background);
			this.upgradesSection[nm].button.addChild(this.upgradesSection[nm].button.icon);
			this.upgradesSection[nm].button.addChild(this.upgradesSection[nm].button.text);
			this.upgradesSection[nm].button.addChild(this.upgradesSection[nm].button.footnote);
			this.upgradesSection[nm].button.addChild(this.upgradesSection[nm].button.overlay);

			if(cnt) this.upgradesSection[nm].addChild(this.upgradesSection[nm].bg);
			this.upgradesSection[nm].addChild(this.upgradesSection[nm].title);
			this.upgradesSection[nm].addChild(this.upgradesSection[nm].desc);
			this.upgradesSection[nm].addChild(this.upgradesSection[nm].button);

			this.shop.tabContent["upgrades"].addChild(this.upgradesSection[nm]);

			cnt++;
		}

		this.updateUpgradesPage();

		/* ACCESSORIES */
		/* For accessories, there are multiple pages, so there are 2 columns of "left" and "right" buttons
		 * As a result, only 4 columns can fit inside the content page.
		*/

		var totalAccessories = Object.keys(this.accessories).length;
		var totalPages = Math.ceil(totalAccessories/4);

		var contentHeight = this.shop.tabContent["accessories"].bg.height;

			//-Navigation Arrows
			var navArrowWidth = 150;
			var navArrowHeight = contentHeight;
		this.shop.navArrows = new PIXI.Container();

		this.shop.navArrows.pageIndicator = new PIXI.Text("PAGE\n1 / 1",textOpt3);
		this.shop.navArrows.pageIndicator.anchor.set(0.5, 0);
		this.shop.navArrows.pageIndicator.position.set(navArrowWidth/2, 25);
		this.shop.navArrows.addChild(this.shop.navArrows.pageIndicator);

		this.shop.navArrows.left = new PIXI.Container();
		this.shop.navArrows.left.name = "left";

		this.shop.navArrows.left.position.set(0, 0);
		this.shop.navArrows.left.bg = new PIXI.Graphics();
		this.shop.navArrows.left.bg.beginFill(0x90a4ae, 0.5)
			.drawRect(0, 0,navArrowWidth,navArrowHeight)
		.endFill();

		this.shop.navArrows.left.icon = this.sprites.icons.left_arrow;
		this.shop.navArrows.left.icon.alpha = 0.6;
		this.shop.navArrows.left.icon.scale.set(1.1, 1.1);
		this.shop.navArrows.left.icon.tint = 0x546e7a;
		this.shop.navArrows.left.icon.position.set(navArrowWidth/2,navArrowHeight/2);

		this.shop.navArrows.left.addChild(this.shop.navArrows.left.bg);
		this.shop.navArrows.left.addChild(this.shop.navArrows.left.icon);

		this.shop.navArrows.left.on((_isMobile)?"touchend":"mouseup",this.skinPagesNav.bind(this,"prev"));
		this.shop.navArrows.left.buttonMode = true;
		this.shop.navArrows.left.interactive = true;

		this.shop.navArrows.addChild(this.shop.navArrows.left);

		this.shop.navArrows.right = new PIXI.Container();
		this.shop.navArrows.right.name = "right";

		this.shop.navArrows.right.position.set(this.canvasWidth-navArrowWidth, 0);
		this.shop.navArrows.right.bg = new PIXI.Graphics();
		this.shop.navArrows.right.bg.beginFill(0x90a4ae, 0.5)
			.drawRect(0, 0,navArrowWidth,navArrowHeight)
		.endFill();

		this.shop.navArrows.right.icon = this.sprites.icons.right_arrow;
		this.shop.navArrows.right.icon.alpha = 0.6;
		this.shop.navArrows.right.icon.scale.set(1.1, 1.1);
		this.shop.navArrows.right.icon.tint = 0x546e7a;
		this.shop.navArrows.right.icon.position.set(navArrowWidth/2,navArrowHeight/2);

		this.shop.navArrows.right.addChild(this.shop.navArrows.right.bg);
		this.shop.navArrows.right.addChild(this.shop.navArrows.right.icon);

		this.shop.navArrows.right.on((_isMobile)?"touchend":"mouseup",this.skinPagesNav.bind(this,"next"));
		this.shop.navArrows.right.buttonMode = true;
		this.shop.navArrows.right.interactive = true;

		this.shop.navArrows.addChild(this.shop.navArrows.right);

		this.shop.tabContent["accessories"].addChild(this.shop.navArrows);

			//-Skins for sale
		width = (this.canvasWidth-2*navArrowWidth)/4;
		height = contentHeight;
		//height = contentHeight/Math.ceil(totalUpgrades/5);
		cnt = 0;

		this.skinsPages = {
			"currPage":0,
			"totalPages": totalPages,
			"containers": []
		};

		for(i=0;i<this.skinsPages.totalPages;i++){
			var c = new PIXI.Container();
			this.skinsPages.containers.push(c);
			this.shop.tabContent["accessories"].addChild(this.skinsPages.containers[i]);
		}

		var pageNo = 0;

		textOpt4 = {
			fontFamily: 'TimeBurnerBold',
			fill: "0x263238",
			letterSpacing: 1,
			align: 'center',
			padding: 10,
			fontSize: 21,
			wordWrap: true,
			wordWrapWidth: width-80
		};

		for(j=0;j<this.accessoriesNames.length;j++){
			i = this.accessoriesNames[j].toString();

			pageNo = Math.floor(cnt/4);

			nm = i.toString();
			data = this.accessories[nm];

			this.skinsSection[nm] = new PIXI.Container();

			this.skinsSection[nm].position.set(navArrowWidth+width*(cnt%4), 0);//((cnt%8)<4)?-5:(contentHeight/2-27));

			this.skinsSection[nm].bg = new PIXI.Graphics();
			this.skinsSection[nm].bg.lineStyle(1, 0x263238, 0.2)
				.moveTo(0, 20).lineTo(0,contentHeight-20);

				//-Title
			this.skinsSection[nm].title = new PIXI.Text(data["title"],textOpt3);
			this.skinsSection[nm].title.anchor.set(0.5, 0);
			this.skinsSection[nm].title.position.set(width/2, 45);

				//-Preview Image
			this.skinsSection[nm].img = new PIXI.Sprite();
			this.skinsSection[nm].img.anchor.set(0.5, 0.5);
			this.skinsSection[nm].img.position.set(width/2, 200);

			switch(data["type"]){
				case "skin":
					if(this.animations[nm]){
						this.skinsSection[nm].img.texture = this.animations[nm].frames[0];
						this.skinsSection[nm].img.scale.set(0.45, 0.45);
					}
					else if(nm=="little_lamb"){
						this.skinsSection[nm].img.texture = this.animations["sheep_base"].frames[0];
						this.skinsSection[nm].img.scale.set(0.28, 0.28);
					}
					break;
				case "hat":
				case "cape":
					if(this.sprites.hats[nm]){
						this.skinsSection[nm].img.texture = this.sprites.hats[nm].texture;
					}
					else if(this.sprites.capes[nm]){
						this.skinsSection[nm].img.scale.set(0.5, 0.5);
						this.skinsSection[nm].img.texture = this.sprites.capes[nm].texture;
					}
					else if(nm=="no_hat" || nm=="no_cape"){

					}
					break;
			}

				//-Desc
			this.skinsSection[nm].desc = new PIXI.Text(data["desc"],textOpt4);
			this.skinsSection[nm].desc.anchor.set(0.5, 0);
			this.skinsSection[nm].desc.position.set(width/2, 320);

				//-Button
			this.skinsSection[nm].button = new PIXI.Container();

			this.skinsSection[nm].button.position.set(width/2-buttonWidth/2, height-buttonHeight-90);

			this.skinsSection[nm].button.icon = new PIXI.Sprite(this.sprites.icons[data["currency"].toString()].texture);
			this.skinsSection[nm].button.icon.anchor.set(0.5, 0.5);
			this.skinsSection[nm].button.icon.scale.set(0.5, 0.5);
			this.skinsSection[nm].button.icon.position.set(iconPos,buttonHeight/2-2.5);
			this.skinsSection[nm].button.icon.alpha = 1;
			this.skinsSection[nm].button.icon.tint = 0xcfd8dc;

			this.skinsSection[nm].button.background = new PIXI.Graphics();
			this.skinsSection[nm].button.background.beginFill(0x263238, 0.9)
				.drawRect(0, 0,buttonWidth,buttonHeight)
			.endFill();

			this.skinsSection[nm].button.pseudoBg = new PIXI.Graphics();
			this.skinsSection[nm].button.pseudoBg.beginFill(0x263238, 0)
				.drawRect(-pseudoPaddX,-pseudoPaddY,buttonWidth+2*pseudoPaddX,buttonHeight+2*pseudoPaddY)
			.endFill();

			this.skinsSection[nm].button.text = new PIXI.Text(data["cost"],textOpt);
			this.skinsSection[nm].button.text.anchor.set(0.5, 0.5);
			this.skinsSection[nm].button.text.position.set(buttonWidth/2+iconPos/2-15, buttonHeight/2);

			this.skinsSection[nm].button.interactive = true;
			this.skinsSection[nm].button.buttonMode = true;
			this.skinsSection[nm].button.on((_isMobile)?"touchend":"mouseup",this.setAccessory.bind(this, nm, data["type"]));

			this.skinsSection[nm].button.footnote = new PIXI.Text("",textOpt2);
			this.skinsSection[nm].button.footnote.anchor.set(0.5, 0);
			this.skinsSection[nm].button.footnote.position.set(buttonWidth/2, buttonHeight+10);

			this.skinsSection[nm].button.overlay = new PIXI.Graphics();
			this.skinsSection[nm].button.overlay.beginFill(0xb0bec5, 0.75)
				.drawRect(0, 0,buttonWidth,buttonHeight)
			.endFill();
			this.skinsSection[nm].button.overlay.visible = false;

			this.skinsSection[nm].button.addChild(this.skinsSection[nm].button.pseudoBg);
			this.skinsSection[nm].button.addChild(this.skinsSection[nm].button.background);
			this.skinsSection[nm].button.addChild(this.skinsSection[nm].button.icon);
			this.skinsSection[nm].button.addChild(this.skinsSection[nm].button.text);
			this.skinsSection[nm].button.addChild(this.skinsSection[nm].button.footnote);
			this.skinsSection[nm].button.addChild(this.skinsSection[nm].button.overlay);

			if(cnt) this.skinsSection[nm].addChild(this.skinsSection[nm].bg);
			this.skinsSection[nm].addChild(this.skinsSection[nm].title);
			this.skinsSection[nm].addChild(this.skinsSection[nm].img);
			this.skinsSection[nm].addChild(this.skinsSection[nm].desc);
			this.skinsSection[nm].addChild(this.skinsSection[nm].button);

			this.skinsPages.containers[pageNo].addChild(this.skinsSection[nm]);

			cnt++;
		}

		//First page by default
		this.skinPagesNav(0);
		//Update buttons
		this.updateAccessoriesPage();

		/* COINS */
		buttonHeight = 105, buttonWidth = 335;
		pseudoPaddX = 80, pseudoPaddY = 120; //for making the hitbox bigger
		iconPos = 65;
		textOpt2 = {
			fontFamily: 'TimeBurner',
			fill: "#cfd8dc",
			letterSpacing: 5,
			align: 'center',
			padding: 10,
			fontSize: 30
		};

		//-Coin Ad Button
		this.coinAdButton = new PIXI.Container();

		this.coinAdButton.position.set(this.canvasWidth*2/3-buttonWidth/2,height/2+30);

		this.coinAdButton.background = new PIXI.Graphics();
		this.coinAdButton.background.beginFill(0x263238, 0.9)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();

		this.coinAdButton.pseudoBg = new PIXI.Graphics();
		this.coinAdButton.pseudoBg.beginFill(0x263238, 0)
			.drawRect(-pseudoPaddX,-pseudoPaddY,buttonWidth+2*pseudoPaddX,buttonHeight+2*pseudoPaddY)
		.endFill();
		this.coinAdButton.pseudoBg.alpha = 0;

		this.coinAdButton.icon = new PIXI.Sprite(this.sprites.icons["ad"].texture);
		this.coinAdButton.icon.anchor.set(0.5, 0.5);
		this.coinAdButton.icon.scale.set(0.6, 0.6);
		this.coinAdButton.icon.position.set(iconPos,buttonHeight/2);
		this.coinAdButton.icon.alpha = 1;
		this.coinAdButton.icon.tint = 0xcfd8dc;

		this.coinAdButton.text = new PIXI.Text("Watch ads",textOpt2);
		this.coinAdButton.text.anchor.set(0.5, 0.5);
		this.coinAdButton.text.position.set(buttonWidth/2+iconPos/2, buttonHeight/2);

		this.coinAdButton.interactive = true;
		this.coinAdButton.buttonMode = true;
		this.coinAdButton.on((_isMobile)?"touchend":"mouseup",this.ads.showAd.bind(this.ads,"rewardvideo","coins", 10*getRandomInt(1, 15)));

		this.coinAdButton.overlay = new PIXI.Graphics();
		this.coinAdButton.overlay.beginFill(0xb0bec5, 0.75)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();
		this.coinAdButton.overlay.visible = false;

		this.coinAdButton.footnote = new PIXI.Text("Watch ads to earn between 10-150 coins!",textOpt4);
		this.coinAdButton.footnote.anchor.set(0.5, 0);
		this.coinAdButton.footnote.position.set(buttonWidth/2, buttonHeight+15);

		this.coinAdButton.addChild(this.coinAdButton.pseudoBg);
		this.coinAdButton.addChild(this.coinAdButton.background);
		this.coinAdButton.addChild(this.coinAdButton.icon);
		this.coinAdButton.addChild(this.coinAdButton.text);
		this.coinAdButton.addChild(this.coinAdButton.overlay);
		this.coinAdButton.addChild(this.coinAdButton.footnote);

		this.shop.tabContent["coins"].addChild(this.coinAdButton);

		//-Coin Buy Button
		this.coinBuyButton = new PIXI.Container();

		this.coinBuyButton.position.set(this.canvasWidth*1/3-buttonWidth/2,this.coinAdButton.y);

		this.coinBuyButton.background = new PIXI.Graphics();
		this.coinBuyButton.background.beginFill(0x263238, 0.9)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();

		this.coinBuyButton.pseudoBg = new PIXI.Graphics();
		this.coinBuyButton.pseudoBg.beginFill(0x263238, 0)
			.drawRect(-pseudoPaddX,-pseudoPaddY,buttonWidth+2*pseudoPaddX,buttonHeight+2*pseudoPaddY)
		.endFill();
		this.coinBuyButton.pseudoBg.alpha = 0;

		this.coinBuyButton.icon = new PIXI.Sprite(this.sprites.icons["coin"].texture);
		this.coinBuyButton.icon.anchor.set(0.5, 0.5);
		this.coinBuyButton.icon.scale.set(0.6, 0.6);
		this.coinBuyButton.icon.position.set(iconPos,buttonHeight/2);
		this.coinBuyButton.icon.alpha = 1;
		this.coinBuyButton.icon.tint = 0xcfd8dc;

		this.coinBuyButton.text = new PIXI.Text("Buy coins",textOpt2);
		this.coinBuyButton.text.anchor.set(0.5, 0.5);
		this.coinBuyButton.text.position.set(buttonWidth/2+iconPos/2, buttonHeight/2);

		this.coinBuyButton.interactive = true;
		this.coinBuyButton.buttonMode = true;
		this.coinBuyButton.on((_isMobile)?"touchend":"mouseup",this.purchases.buy.bind(this.purchases,"coins500"));

		this.coinBuyButton.overlay = new PIXI.Graphics();
		this.coinBuyButton.overlay.beginFill(0xb0bec5, 0.75)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();
		this.coinBuyButton.overlay.visible = false;

		this.coinBuyButton.footnote = new PIXI.Text("Buy 500 coins for $0.99",textOpt4);
		this.coinBuyButton.footnote.anchor.set(0.5, 0);
		this.coinBuyButton.footnote.position.set(buttonWidth/2, buttonHeight+15);

		this.coinBuyButton.addChild(this.coinBuyButton.pseudoBg);
		this.coinBuyButton.addChild(this.coinBuyButton.background);
		this.coinBuyButton.addChild(this.coinBuyButton.icon);
		this.coinBuyButton.addChild(this.coinBuyButton.text);
		this.coinBuyButton.addChild(this.coinBuyButton.overlay);
		this.coinBuyButton.addChild(this.coinBuyButton.footnote);

		this.shop.tabContent["coins"].addChild(this.coinBuyButton);

		//-Restore Purchases Button
		pseudoPaddX = 100, pseudoPaddY = 55, buttonWidth = 500;

		this.restorePurchasesButton = new PIXI.Container();

		this.restorePurchasesButton.position.set(this.canvasWidth/2-buttonWidth/2,height*0.15);

		this.restorePurchasesButton.background = new PIXI.Graphics();
		this.restorePurchasesButton.background.beginFill(0x263238, 0.9)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();

		this.restorePurchasesButton.pseudoBg = new PIXI.Graphics();
		this.restorePurchasesButton.pseudoBg.beginFill(0x263238, 0)
			.drawRect(-pseudoPaddX,-pseudoPaddY,buttonWidth+2*pseudoPaddX,buttonHeight+2*pseudoPaddY)
		.endFill();

		this.restorePurchasesButton.icon = this.sprites.icons["restore"];
		this.restorePurchasesButton.icon.anchor.set(0.5, 0.5);
		this.restorePurchasesButton.icon.scale.set(0.6, 0.6);
		this.restorePurchasesButton.icon.position.set(iconPos,buttonHeight/2);
		this.restorePurchasesButton.icon.alpha = 1;
		this.restorePurchasesButton.icon.tint = 0xcfd8dc;

		this.restorePurchasesButton.text = new PIXI.Text("Restore Purchases",textOpt2);
		this.restorePurchasesButton.text.anchor.set(0.5, 0.5);
		this.restorePurchasesButton.text.position.set(buttonWidth/2+iconPos/2, buttonHeight/2);

		this.restorePurchasesButton.interactive = true;
		this.restorePurchasesButton.buttonMode = true;
		this.restorePurchasesButton.on((_isMobile)?"touchend":"mouseup",this.purchases.restore.bind(this.purchases));

		this.restorePurchasesButton.overlay = new PIXI.Graphics();
		this.restorePurchasesButton.overlay.beginFill(0xb0bec5, 0.75)
			.drawRect(0, 0,buttonWidth,buttonHeight)
		.endFill();
		this.restorePurchasesButton.overlay.visible = false;

		textOpt4 = Object.assign(textOpt4, {"wordWrapWidth": buttonWidth-10});
		this.restorePurchasesButton.footnote = new PIXI.Text("",textOpt4);
		this.restorePurchasesButton.footnote.anchor.set(0.5, 0);
		this.restorePurchasesButton.footnote.position.set(buttonWidth/2, buttonHeight+15);

		this.restorePurchasesButton.addChild(this.restorePurchasesButton.pseudoBg);
		this.restorePurchasesButton.addChild(this.restorePurchasesButton.background);
		this.restorePurchasesButton.addChild(this.restorePurchasesButton.icon);
		this.restorePurchasesButton.addChild(this.restorePurchasesButton.text);
		this.restorePurchasesButton.addChild(this.restorePurchasesButton.overlay);
		this.restorePurchasesButton.addChild(this.restorePurchasesButton.footnote);

		this.shop.tabContent["coins"].addChild(this.restorePurchasesButton);

		this.updateCoinsPage();

		this.saveOptions();
	};

	this.performUpgrade = function(nm, e){
		if(typeof e == "object"){
			if(e.type=="mouseup" || e.type=="touchend"){
				//this.preventHeroMovement++;
			}
		}

		var avail = this.checkUpgradeAvailability(nm);
		if(!avail) return;

		var i;
		var data = this.upgrades[nm];
		var trueCost = parseInt(data["cost"]*(data["increment_count"]+1));

		this.incCoins(-trueCost,false);
		this[nm] += data["increment_value"];
		this.upgrades[nm].value = this[nm];
		this.upgrades[nm].increment_count++;

		console.log(data["title"]+" upgrade complete.");

		this.updateUpgradesPage();

		this.saveOptions("upgrades");

		//ACHIEVEMENT:
			//-Single (Enhanced):
			if(!this.achievements.single.enhanced_once[0].complete || !this.achievements.single.enhanced_once[0].synced)  {		  this.GooglePlayServices.unlockAchievement("enhanced_once");
			}
			//-Incremental:
			for(i=0;i<this.achievements.incremental.enhanced.length;i++){
				if(!this.achievements.incremental.enhanced[i].complete || !this.achievements.incremental.enhanced[i].synced) {
					this.GooglePlayServices.incrementAchievement("enhanced", i, 1);
				}
			}

		this.saveOptions("achievements");
	};

	this.updateUpgradesPage = function(){
		var nm, data, trueCost, i;

		for(i in this.upgrades){
			if(!this.upgrades.hasOwnProperty(i)) continue;

			nm = i.toString();
			data = this.upgrades[i];

			//Cost
			trueCost = parseInt(data["cost"]*(data["increment_count"]+1));
			this.upgradesSection[nm].button.text.text = trueCost;

			//Footnote Text
			var footnoteText = "Current "+data["type"]+": ";
			switch(data["type"]){
				case "one-off":
					footnoteText = (data["increment_count"]==data["max_increments"])?"Activated":"Activate";
					break;
				case "value":
					footnoteText += parseInt(this[nm]);
					if(data["increment_count"]<data["max_increments"]){
						footnoteText += "\nUpgrade to: ";
						footnoteText += parseInt(this[nm]+data["increment_value"]);
					} else{
						footnoteText += " (MAX)";
					}
					break;
				case "chance":
					footnoteText += parseInt(100*this[nm])+"%";
					if(data["increment_count"]<data["max_increments"]){
						footnoteText += "\nUpgrade to: ";
						footnoteText += parseInt(100*(this[nm]+data["increment_value"]))+"%";
					} else{
						footnoteText += " (MAX)";
					}
					break;
				case "time":
					if(nm=="shieldTimeInc"){
						footnoteText += parseFloat(this[nm]/100)+"s";
						if(data["increment_count"]<data["max_increments"]){
							footnoteText += "\nUpgrade to: ";
							footnoteText += parseFloat((this[nm]+data["increment_value"])/100)+"s";
						} else{
							footnoteText += " (MAX)";
						}
					}
					else{
						footnoteText += parseFloat(this[nm]/1000)+"s";
						if(data["increment_count"]<data["max_increments"]){
							footnoteText += "\nUpgrade to: ";
							footnoteText += parseFloat((this[nm]+data["increment_value"])/1000)+"s";
						} else{
							footnoteText += " (MAX)";
						}

					}
					break;
				default: break;
			}

			this.upgradesSection[nm].button.footnote.text = footnoteText;
		}

		this.checkUpgradeAvailability();

		this.shop.coin_text.text = this.coins;

		renderer.render(stage);
	};

	this.checkUpgradeAvailability = function(specific_nm){
		var needCheck = (specific_nm != null);
		var ret = true;
		var i, nm, data;

		for(i in this.upgrades){
			if(!this.upgrades.hasOwnProperty(i)) continue;

			nm = i.toString();
			data = this.upgrades[i];

			this.upgradesSection[nm].button.overlay.visible = true;
			this.upgradesSection[nm].button.buttonMode = false;
			this.upgradesSection[nm].button.interactive = false;

			if(data["increment_count"]>=data["max_increments"]){
				data["increment_count"] = data["max_increments"];

				//-Single (Max-out):
				if(this.achievements.single.max_upgrade!=null){
					if(!this.achievements.single.max_upgrade[0].complete || !this.achievements.single.max_upgrade[0].synced) {
						this.GooglePlayServices.unlockAchievement( "max_upgrade");
					}
				}

				if(needCheck && nm == specific_nm){
					ret = false;
				}
				continue;
			}

			var trueCost = parseInt(data["cost"]*(data["increment_count"]+1));

			if(trueCost>this.coins){
				//Too expensive
				if(needCheck && nm == specific_nm){
					ret = false;
				}
				continue;
			}

			this.upgradesSection[nm].button.overlay.visible = false;
			this.upgradesSection[nm].button.buttonMode = true;
			this.upgradesSection[nm].button.interactive = true;
		}

		renderer.render(stage);

		return ret;
	};

	this.updateCoinsPage = function(){
		//Check for whether ads can be shown, purchases can be made
		this.ads.updateButtons();
		this.purchases.updateButtons();

		//Update coin amount
		this.shop.coin_text.text = this.coins;
	};

	this.setAllAccessories = function(){
		if(window.localStorage && window.localStorage.getItem("accessories")!=null){
			this.accessories = JSON.parse(localStorage["accessories"]);

			if(this.accessories.hasOwnProperty("sheep_running")){ //weird issue with sheep_running
				this.accessories["sheep_base"] = this.accessories["sheep_running"];
				delete this.accessories["sheep_running"];
				this.saveOptions("accessories");
			}
		}

		var i, nm;
		for(i=0;i<this.accessoriesNames.length;i++){
			//if(!this.accessories.hasOwnProperty(i)) continue;
			nm = this.accessoriesNames[i];

			if(this.accessories[nm].activated){
				this.setAccessory(nm, this.accessories[nm].type);
			}
		}

		renderer.render(stage);
	};

	this.setAccessory = function(accessory, type){
		if(accessory == null) accessory = "sheep_base";
		if(type == null) return;

		var data, currFrame, scaleDir;
		if(this.accessories[accessory]){
			data = this.accessories[accessory];

			if(!data.purchased){
				if(data.currency == "coin"){
					if(data.cost>this.coins){
						return;
					}

					this.incCoins(-data.cost);
					data.purchased = true;
				}
				else if(data.currency == "dollar"){
					this.purchases.buy(accessory.toString());
					return;
				}
			}

			this.deactivateAccessories(type);
		}
		else return;

		switch(type){
			case "skin":
			case "body":
				if(this.hero.sheep == null || typeof this.hero.sheep == "undefined"){
					//Initializing of the sheep

					this.hero.sheep = new PIXI.AnimatedSprite(this.animations[((accessory=="little_lamb" || accessory == "sheep_running")?"sheep_base":accessory)].frames);
					this.hero.sheep.animationSpeed = 0.15;
					this.hero.sheep.loop = true;
					this.hero.sheep.anchor.set(0.5);

					if(accessory == "little_lamb"){
						this.hero.sheep.scale.set(0.25, 0.25);
						this.heroSpeed = this.heroSpeed_lamb;
					} else{
						this.hero.sheep.scale.set(0.35, 0.35);
						this.heroSpeed = this.heroSpeed;
					}
				}
				else{
					currFrame = this.hero.sheep.currentFrame;
					this.hero.sheep.texture = this.animations[((accessory=="little_lamb" || accessory == "sheep_running")?"sheep_base":accessory)];
					this.hero.sheep.gotoAndPlay(currFrame);

					scaleDir = (this.hero.sheep.scale.x<0)?-1:1;

					if(accessory == "little_lamb"){
						this.hero.sheep.scale.set(0.25*scaleDir, 0.25);
						this.heroSpeed = this.heroSpeed_lamb;
					} else{
						this.hero.sheep.scale.set(0.35*scaleDir, 0.35);
						this.heroSpeed = this.heroSpeed;
					}
				}

				this.hero.sheep.name = accessory;
				data.activated = true;
				break;
			case "necklace":
			case "cape":
				if(this.hero.cape == null || typeof this.hero.cape == "undefined"){
					this.hero.cape = new PIXI.Sprite(((accessory=="no_cape")?PIXI.Texture.EMPTY:this.sprites.capes[accessory].texture));

					this.hero.cape.displacement = -0.75;
					this.hero.cape.angular_displacement = 0;

					this.hero.cape.anchor.set(0.5, 0.5);
				}
				else if(accessory=="no_cape"){
					this.hero.cape.texture = PIXI.Texture.EMPTY;
				}
				else{
					this.hero.cape.texture = this.sprites.capes[accessory].texture;
				}

				this.hero.cape.name = accessory;
				data.activated = true;
				break;
			case "hat":
			case "cap":
			case "headdress":
				if(this.hero.hat == null || typeof this.hero.hat == "undefined"){
					this.hero.hat = new PIXI.Sprite(((accessory=="no_hat")?PIXI.Texture.EMPTY:this.sprites.hats[accessory].texture));

					this.hero.hat.displacement = -0.275;
					this.hero.hat.angular_displacement = -0.05;

					this.hero.hat.anchor.set(0.5, 0.5);
				}
				else if(accessory=="no_hat"){
					this.hero.hat.texture = PIXI.Texture.EMPTY;
				}
				else{
					this.hero.hat.texture = this.sprites.hats[accessory].texture;
				}

				this.hero.hat.name = accessory;
				data.activated = true;
				break;
			default:
				return;
		}

		this.setAccessoriesPositions();
		this.updateAccessoriesPage();
	};

	this.setAccessoriesPositions = function(dir){
		if(dir == null) dir = 1; //Hero is always facing right

		//Hats
		if(this.hero.hat){
			this.hero.hat.scale.x = this.hero.sheep.scale.x*0.7;
			this.hero.hat.scale.y = this.hero.sheep.scale.y*0.7;

			this.hero.hat.x = dir*(this.hero.sheep.width/2+this.hero.sheep.width*this.hero.hat.displacement);
			this.hero.hat.y = -this.hero.sheep.height/2;

			this.hero.hat.rotation = dir*this.hero.hat.angular_displacement;

			this.hero.hat.rotation = this.hero.hat.angular_displacement;
		}

		//Capes
		if(this.hero.cape){
			this.hero.cape.scale.x = this.hero.sheep.scale.x*0.7;
			this.hero.cape.scale.y = this.hero.sheep.scale.y*0.7;

			this.hero.cape.x = dir*(this.hero.sheep.width/2+this.hero.sheep.width*this.hero.cape.displacement);
			this.hero.cape.y = -this.hero.sheep.height*0.19;

			this.hero.cape.rotation = dir*this.hero.cape.angular_displacement;

			this.hero.cape.rotation = this.hero.cape.angular_displacement;
		}

		if(renderer) renderer.render(stage);
	};

	this.deactivateAccessories = function(type){
		var i, data;

		switch(type){
			case "skin":
			case "body":
				type = "skin";
				break;
			case "cape":
			case "necklace":
				type = "cape";
				break;
			case "hat":
			case "cap":
			case "headdress":
				type = "hat";
				break;
			default:
				return;
		}

		for(i in this.accessories){
			if(!this.accessories.hasOwnProperty(i)) continue;

			data = this.accessories[i];
			if(data.type == type || type=="all"){
				data.activated = false;
			}
		}
	};

	this.updateAccessoriesPage = function(){
		var i, nm, data, btn;

		for(i in this.accessories){
			if(!this.accessories.hasOwnProperty(i)) continue;

			nm = i.toString();
			data = this.accessories[i];

			if(this.skinsSection[nm] == null || this.skinsSection[nm] == "undefined") return;
			btn = this.skinsSection[nm].button;

			btn.overlay.visible = true;
			btn.buttonMode = false;
			btn.interactive = false;

			if(data["purchased"]){
				if(data["activated"]){
					btn.text.text = "In Use";
					btn.icon.visible = true;
					btn.icon.texture = this.sprites.icons["tick"].texture;
					continue;
				}
				else{
					btn.text.text = "Use";
					btn.icon.visible = true;
					btn.icon.texture = this.sprites.icons["shirt"].texture;
				}
			}
			else if(data["cost"]>this.coins){
				//Too expensive
				continue;
			}

			btn.overlay.visible = false;
			btn.buttonMode = true;
			btn.interactive = true;
		}

		this.purchases.updateButtons();

		this.saveOptions("accessories");
		renderer.render(stage);
	};

	this.skinPagesNav = function(page){
		var i;

		if(page == null){
			page = 0;
		}

		if(page == "next"){
			page = Math.min(this.skinsPages.totalPages-1,this.skinsPages.currPage+1);
		}
		else if(page == "prev" || page == "previous"){
			page = Math.max(0,this.skinsPages.currPage-1);
		}

		//Make all page containers invisible first
		for(i=0;i<this.skinsPages.containers.length;i++){
			this.skinsPages.containers[i].visible = false;
		}

		//Then make the page container that you want to navigate to visible.
		this.skinsPages.containers[page].visible = true;

		this.skinsPages.currPage = page;

		//Show on the page indicator
		this.shop.navArrows.pageIndicator.text = "PAGE\n"+(this.skinsPages.currPage+1)+" / "+this.skinsPages.totalPages;

		renderer.render(stage);
	};

	this.showInfo = function(e){
		if(typeof e == "object"){
			if(e.type=="mouseup" || e.type=="touchend"){
				this.preventHeroMovement++;
			}
		}

		this.GooglePlayServices.unlockAchievement("curiosity");

		//Toggle the display of the info page, along with the pausing
		if(this.infoOverlay.alpha){
			this.closeAllMenus();

			this.togglePause(false);
		}
		else{
			this.closeAllMenus();

			this.infoOverlay.alpha = 1;

			this.infoOverlay.buttonMode = true;
			this.infoOverlay.interactive = true;

			this.backButton.visible = true;

			this.togglePause(true);
		}

		//Render the stage to show the info screen
		renderer.render(stage);
	};

	this.initPlayGames = function(e){
		console.log("Initializing Google Play Games...");

		var i,j;

		this.loadOptions();

		if(typeof window.plugins == "undefined"){
			this.gamesButton.alpha = 0.4;
			renderer.render(stage);
			return;
		}

		window.plugins.playGamesServices.auth(function(){
			console.log("Google Play login success!");
			this.isLoggedIn = true;

			//Fetch and save player data
			this.GooglePlayServices.fetchPlayerData();

			//Syncing Locally-stored and Cloud-stored scores from old leaderboard
			var oldHS = 0;

			window.plugins.playGamesServices.getPlayerScore({
				"leaderboardId":"CgkI8sq82fwOEAIQAg" //old leaderboard ID
			}, function(result){
				var sc = parseInt(result.playerScore);
				oldHS = Math.min(sc, 20);
			}.bind(Game));

			//Syncing Locally-stored and Cloud-stored scores
			window.plugins.playGamesServices.getPlayerScore({
				"leaderboardId":this.leaderboardID.toString()
			}, function(result){
				var sc = parseInt(result.playerScore);
				console.log("Retrieved score: "+sc);

				if(this.highscore > sc || oldHS > sc){
					//Send the locally-stored highscore since it's the highest
					this.GooglePlayServices.sendScore(Math.max(this.highscore,oldHS));
				}
				else if(this.highscore < sc){
					//Locally store the Google Play highscore since it's the highest
					this.highscore = sc;
					this.highscoreText.text = sc;

					this.saveOptions();
					renderer.render(stage);
				}
				else{
					//SCORES IN SYNC
				}
			}.bind(Game), function(){
				//Score has never been submitted before
				//Send the locally-stored highscore since it's the highest
				if(this.highscore){
					this.GooglePlayServices.sendScore(this.highscore);
				}
			}.bind(Game));

			//ACHIEVEMENT: CLEARLY ADDICTED
			if(this.achievements.incremental.die[4].complete){
				this.GooglePlayServices.incrementAchievement("addicted", 0, 1);
			}
			if(this.achievements.incremental.score_times[4].complete){
				this.GooglePlayServices.incrementAchievement("addicted", 0, 1);
			}
			if(this.achievements.incremental.shield[2].complete){
				this.GooglePlayServices.incrementAchievement("addicted", 0, 1);
			}

			//Sync locally-stored and Google Play achievements
			var unsyncedSteps;
			for(i in this.achievements.single){
				if(!this.achievements.single.hasOwnProperty(i)) continue;

				for(j=0;j<this.achievements.single[i].length;j++){
					if(this.achievements.single[i][j].complete && !this.achievements.single[i][j].synced){
						this.GooglePlayServices.unlockAchievement(i.toString(),j);
					}
				}

			}

			for(i in this.achievements.incremental){
				if(!this.achievements.incremental.hasOwnProperty(i)) continue;

				for(j=0;j<this.achievements.incremental[i].length;j++){
					unsyncedSteps = parseInt(this.achievements.incremental[i][j].completedSteps)-parseInt(this.achievements.incremental[i][j].completedSteps_synced);
					if(unsyncedSteps>0){
						this.GooglePlayServices.incrementAchievement(i.toString(),j,unsyncedSteps,true);
					}
				}
			}

		}.bind(Game),function(){
			//alert("Google Play login failure: "+((this.isOnline)?"Press the Play Games button to try again!":"Check your connection and try again!"));

			this.isLoggedIn = false;
		}.bind(Game));

		//GPlay.init();
		if(renderer && stage) renderer.render(stage);
	};

	this.pressPlayGamesButton = function(button_name){

		if(typeof button_name != "string") return;

		if(this.isLoggedIn){
			if(button_name == "leaderboard"){
				this.GooglePlayServices.showLeaderboard(this.leaderboardID.toString());
				//window.plugins.playGamesServices.showAllLeaderboards();
			}
			else if(button_name == "achievements"){
				this.GooglePlayServices.showAchievements();
			}
			else if(button_name == "logout"){
				//if(!confirm("Are you sure you want to sign out?")) return;

				if(!this.isOnline){
					alert("Connection Error: Cannot sign out of Google Play...");
					return;
				}

				window.plugins.playGamesServices.signOut(function(){
					alert(this.GooglePlayServices.player.name+" has signed out successfully");

					this.isLoggedIn = false;

					this.GooglePlayServices.player = {
						"id":"",
						"name":"UNKNOWN",
						"title":"-",
						"iconURL":""
					};

					//Close the play games menu
					this.closeAllMenus();

					renderer.render(stage);
				}.bind(Game),function(){
					alert(this.GooglePlayServices.player.name+" failed to sign out successfully!");
				});
			}
		}
	};

	this.showPlayGamesMenu = function(e){

		if(typeof event == "object"){
			if(e.type=="mouseup" || e.type=="touchend"){
				this.preventHeroMovement++;
			}
		}

		if((typeof window.plugins != "undefined") && !this.isLoggedIn){
			this.initPlayGames();
		}

		//Toggle the display of the info page, along with the pausing
		if(!this.playGamesMenu.visible){
			if(!this.isOnline) return;
			if(typeof window.plugins == "undefined"){
				this.togglePause(true);

				if(confirm("Google Play Games is only supported in the Mobile App! Click 'OK' to be redirected to the Google Play Store. Cancel otherwise.")){
					this.gotoURL("https://play.google.com/store/apps/details?id=io.samleo8.SisyphusSheep");
				}

				return;
			}

			this.closeAllMenus();

			//Make menu appear, and pause game
			this.playGamesMenu.alpha = 1;
			this.playGamesMenu.visible = true;

			this.playGamesMenu.profile.player_text.text = this.GooglePlayServices.player.name;

			this.backButton.visible = true;

			this.togglePause(true);
		}
		else{
			this.closeAllMenus();
		}

		//Render the stage to show the info screen
		renderer.render(stage);
	};

	this.toggleMuteMain = function(forcedVal){
		if(typeof forcedVal == "object"){
			if(forcedVal.type=="mouseup" || forcedVal.type=="touchend"){
				this.preventHeroMovement++;
			}
		}

		if(typeof forcedVal == "boolean"){
			if(this._musicMuted == forcedVal) return;

			this._musicMuted = !forcedVal;
		}

		if(this._musicMuted){
			this.muteMusicButton.getChildByName("music_off").alpha=0;
			this.muteMusicButton.getChildByName("music_on").alpha=1;
			renderer.render(stage);

			if(this.audio["main_music"]) this.audio["main_music"].play();

			this._musicMuted = false;
		}
		else{
			this.muteMusicButton.getChildByName("music_off").alpha=1;
			this.muteMusicButton.getChildByName("music_on").alpha=0;
			renderer.render(stage);

			if(this.audio["main_music"]) this.audio["main_music"].pause();

			this._musicMuted = true;
		}

		this.saveOptions("muteMain");
		console.log("BG Music "+((this._musicMuted)?"Muted":"Playing"));
	};

	this.toggleMuteFX = function(forcedVal){
		var i,nm;

		if(typeof forcedVal == "object"){
			if(forcedVal.type == "mouseup" || forcedVal.type == "touchend"){
				this.preventHeroMovement++;
			}
		}

		if(typeof forcedVal == "boolean"){
			if(this._FXMuted == forcedVal) return;

			this._FXMuted = !forcedVal;
		}

		if(this._FXMuted){
			this.muteFXButton.getChildByName("fx_off").alpha=0;
			this.muteFXButton.getChildByName("fx_on").alpha=1;
			renderer.render(stage);

			for(i=0;i<this.audioLib.length;i++){
				nm = this.audioLib[i];
				if(nm == "main_music" || this.audio[nm]==null || typeof this.audio[nm] == "undefined") continue;

				this.audio[nm].volume = this.audio[nm].defaultVolume;
			}

			this._FXMuted = false;
		}
		else{
			this.muteFXButton.getChildByName("fx_off").alpha=1;
			this.muteFXButton.getChildByName("fx_on").alpha=0;
			renderer.render(stage);

			for(i=0;i<this.audioLib.length;i++){
				nm = this.audioLib[i];
				if(nm == "main_music" || this.audio[nm]==null || typeof this.audio[nm] == "undefined") continue;

				this.audio[nm].volume = 0;
			}

			this._FXMuted = true;
		}

		this.saveOptions("muteFX");
		console.log("BG Music "+((this._FXMuted)?"Muted":"Playing"));
	};

	this.togglePause = function(forcedVal, event){
		var i, e;

		if(!this._gameStarted) return;

		if(typeof event == "object" || typeof forcedVal == "object"){
			e = (typeof event == "object")?event:forcedVal; //sometimes `forcedVal` is the `event`
			if(e.type=="mouseup" || e.type=="touchend"){
				this.preventHeroMovement++;
			}
		}

		if(this.gameoverScreen.visible){
			return;
		}

		if(typeof forcedVal == "boolean"){
			if(this._paused == forcedVal) return;

			this._paused = !forcedVal;
		}

		if(this._paused){
			this.infoOverlay.alpha = 0;
			this.infoOverlay.buttonMode = false;
			this.infoOverlay.interactive = false;

			this.pauseOverlay.alpha = 0;
			this.pauseOverlay.interactive = false;
			this.pauseOverlay.buttonMode = false;

			this.playGamesMenu.alpha = 0;
			this.playGamesMenu.visible = false;

			this.shop.visible = false;

			this.pauseButton.getChildByName("pause").alpha=1;
			this.pauseButton.getChildByName("play").alpha=0;

			for(i in this.pauseTime){
				if(!this.pauseTime.hasOwnProperty(i)) continue;

				this.pauseTime[i] += (new Date().getTime())-this.pauseTimer;
			}
			this._paused = false;

			requestAnimationFrame(this.update.bind(this));
		}
		else{
			this.pauseOverlay.alpha = 1;
			this.pauseOverlay.interactive = true;
			this.pauseOverlay.buttonMode = true;

			this.pauseButton.getChildByName("pause").alpha=0;
			this.pauseButton.getChildByName("play").alpha=1;

			renderer.render(stage);

			this.pauseTimer = new Date().getTime();
			this._paused = true;
		}

		console.log("Game "+((this._paused)?"Paused":"Resumed"));
	};

	this.gameover = function(){
		//Only allow revive if the guy didn't die by falling off screen
		if(this.hero.x >= this.hero.sheep.width/2 - this.hero.leeway){
			if( (this.noDeathChance || this.hero.cape.name == "royal_cape") && Math.random()<(this.noDeathChance+this.whiteCapeBonus) ){
				//Just continue game
				requestAnimationFrame(this.update.bind(this));

				return;
			}
		}

		var i;

		renderer.render(stage);

		this._paused = true;
		this.audio["die"].play();

		//Crown Special Bonus
		if(this.hero.hat.name == "crown"){
			this.score *= (1+this.crownBonus);
		}

		//Need to make sure score is an integer!
		this.score = Math.floor(this.score);
		this.saveOptions();

		//SEND HIGHSCORE IF PLAY GAMES AVAILABLE
		if(this.isLoggedIn){
			var sc = this.score;
			this.GooglePlayServices.sendScore(sc);
		}

		//ACHIEVEMENT: DIE/DIE_ADDICTED
		for(i=0;i<this.achievements.incremental.die.length;i++){
			if(!this.achievements.incremental.die[i].complete || !this.achievements.incremental.die[i].synced){
				this.GooglePlayServices.incrementAchievement("die", i, 1);
			}
		}

		console.log("GAME OVER!\nScore: "+this.score+"\nHighscore: "+this.highscore+"\n");

		//ACHIEVEMENT: SCORE/SCORE_TIMES
		for(i=0;i<this.achievements.single.score.length;i++){
			if(this.score>=this.achievements.single.score[i].value){
				this.GooglePlayServices.unlockAchievement("score", i);
			}
		}

		for(i=0;i<this.achievements.incremental.score_times.length;i++){
			if(this.score>=150){
				this.GooglePlayServices.incrementAchievement("score_times", i);
			}
		}

		//CLEAR OBSTACLES
		for(i=this.obstacles.children.length-1;i>=0;i--){
			this.obstacles.removeChild(this.obstacles.children[i]);
		}

		//CLEAR POWERUPS
		for(i=this.powerups.children.length-1;i>=0;i--){
			this.powerups.removeChild(this.powerups.children[i]);
		}

		//ADS
		if(this.score>=100){
			this.incCoins(Math.floor(1.1*this.score), true);
			this.ads.showAd("rewardvideo","coins", 10*getRandomInt(5, 20));
		}
		else if(this.totalGamesPlayed>=5){
			this.ads.showAd("interstitial");
			this.totalGamesPlayed = 0;
		}

		//HIDE HERO, TREADMILL AND BUTTONS
		this.treadmill.visible = false;
		this.playButtons.visible = false;
		this.hero.visible = false;
		this.heroShield.alpha = 0;

		//STOP HERO FROM RUNNING
		this.hero.running = false;
		this.hero.sprinting = false;
		this.hero.sheep.gotoAndStop(4);

		//HIDE SCORE
		this.scoreText.visible = false;
		this.highscoreText.visible = false;
		this.overSym.visible = false;

		//SHOW GAMEOVER MENU
		this.gameoverScreen.visible = true;
		this.gameoverScreen.scoreText.text = "Score: "+this.score;
		this.gameoverScreen.highscoreText.text = "Highscore: "+this.highscore;

			//-Display Tips
			this.gameoverScreen.tipText.text = "Tip: "+this.tips[getRandomInt(0,this.tips.length-1)];

			this.ads.updateButtons();

		renderer.render(stage);

		//RESTART GAME
		//this.newGame();
	};

	this.closeAllMenus = function(e){
		if(typeof e == "object"){
			if(e.type=="mouseup" || e.type=="touchend"){
				this.preventHeroMovement++;
			}
		}

		this.infoOverlay.buttonMode = false;
		this.infoOverlay.interactive = false;
		this.infoOverlay.alpha = 0;

		this.playGamesMenu.alpha = 0;
		this.playGamesMenu.visible = false;

		this.shop.visible = false;

		this.backButton.icon.tint = 0x90a4ae;
		this.backButton.text.style.fill = 0x90a4ae;
		this.backButton.visible = false;

		renderer.render(stage);
	};

	this.try_revive = function(){
		//Check to see if player can watch an ad to revive himself
		this.ads.updateButtons();

		if(typeof admob == "undefined" || admob==null){
			console.log("Ads only available for mobile app.");
		}
		else if(!this.isOnline || !this.ads.types.rewardvideo.loaded){
			console.log("Ad is loading, please be patient...");
			return;
		}

		if(this._revived){
			alert("You can only revive once per game! Restarting game instead!");
			this.newGame();
			return;
		}

		this.ads.showAd("rewardvideo","revive");
	};

	this.revive = function(){
		if(this._revived){
			console.log("You can only revive once per game!");
			this.newGame();
			return;
		}

		this.preventHeroMovement = 0;

		this.scoreText.visible = true;
		this.highscoreText.visible = true;
		this.overSym.visible = true;

		this.gameoverScreen.visible = false;

		//Reset Hero Position
		this.playButtons.visible = true;
		this.treadmill.visible = true;
		this.hero.visible = true;
		this.hero.x = this.heroStartX.min;

		this.heroShield.position = this.hero.position;
		if(this.startingShield){
			this.collectPowerup("shield");
		}
		else{
			this.heroShield.alpha = 0;
		}

		this.preventHeroMovement = 0;

		//Hide all overlays
		this.pauseOverlay.alpha = 0;
		this.infoOverlay.alpha = 0;
		this.playGamesMenu.alpha = 0;
		this.playGamesMenu.visible = false;
		this.shop.visible = false;

		//Reset obstacles activity
		this.obstaclesFrozen = false;

		//Reset Timers
		this.pauseTime = {
			"global": 0,
			"obstacle": 0,
			"shield": 0,
			"freeze": 0
		};
		this.obstacleTimer = new Date().getTime();
		this.shieldTimer = null;

		//Pause the game so as to make user click to continue instead of abruptly reviving
		this._revived = true;

		this._paused = false;
		this.togglePause(true);
	};

	this.share_social = function(){
		var options = {
		  message: 'Can you beat my score of '+this.score+' on Sisyphus Sheep?', // not supported on some apps (Facebook, Instagram)
		  subject: 'Sisyphus Sheep Highscore', // fi. for email
		  url: 'https://play.google.com/store/apps/details?id=io.samleo8.SisyphusSheep'
		  //chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
		};

		if(typeof window.plugins != "undefined" && window.plugins != null){
			window.plugins.socialsharing.shareWithOptions(options,
			function(result){

			},
			function(err){
				console.log(err);
			});
		}
		else{
			if(confirm("For now, you can only share your scores on the Android app. Click 'OK' to download it now!")){
				this.gotoURL("https://play.google.com/store/apps/details?id=io.samleo8.SisyphusSheep");
			}

		}
	};

	this.loadOptions = function(){
		//window.localStorage.clear();

		if(window.localStorage){
			if(window.localStorage.getItem("muteFX") != null){
				this.highscore = window.localStorage["highscore"];

				this.toggleMuteFX(parseBoolean(window.localStorage["muteFX"]));
				this.toggleMuteMain(parseBoolean(window.localStorage["muteMain"]));
			}
			else{
				this.highscore = 0;
				this.toggleMuteFX(parseBoolean(this.defOptions["muteFX"]));
				this.toggleMuteMain(parseBoolean(this.defOptions["muteMain"]));
			}

			if(window.localStorage.getItem("achievements") != null){
				this.achievements = JSON.parse(window.localStorage["achievements"]);
			}

			if(window.localStorage.getItem("coins") != null){
				this.coins = parseInt(window.localStorage["coins"]);
				//this.coins = Math.max(this.coins, 200);
				this.incCoins(0,false);
			}

			if(window.localStorage.getItem("accessories") != null){
				this.accessories = JSON.parse(window.localStorage["accessories"]);
				if(this.accessories.hasOwnProperty("sheep_running")){ //weird issue with sheep_running
					this.accessories["sheep_base"] = this.accessories["sheep_running"];
					delete this.accessories["sheep_running"];
					this.saveOptions("accessories");
				}
			}

			if(window.localStorage["upgrades"] != null){
				this.upgrades = JSON.parse(window.localStorage["upgrades"]);

				var i, nm;
				for(i in this.upgrades){
					if(!this.upgrades.hasOwnProperty(i)) continue;

					nm = i.toString();
					this[nm] = this.upgrades[nm].value;
				}
			}
			else{
				this.saveOptions("upgrades");
				var i, nm;
				for(i in this.upgrades){
					if(!this.upgrades.hasOwnProperty(i)) continue;

					nm = i.toString();
					this[nm] = this.upgrades[nm].value;
				}
			}

			if(!window.localStorage.getItem("coins_reward1") || !parseBoolean(window.localStorage["coins_reward1"]) ){
				window.localStorage["coins_reward1"] = true;
				this.incCoins(1000);
			}
		}
		else{
			console.log("WARNING: Browser does not support localStorage! Highscores, achievements and options will not be saved.");
			return false;
		}
	};

	this.saveOptions = function(opt){
		if(opt==null){
			opt = "all";
		}

		if(window.localStorage){
			if(opt=="all" || opt=="score" || opt=="highscore"){
				this.highscore = Math.max(Math.floor(this.score), this.highscore);
				window.localStorage["highscore"] = this.highscore;
			}

			if(opt=="all" || opt=="muteFX")
				window.localStorage["muteFX"] = this._FXMuted;

			if(opt=="all" || opt=="muteMain")
				window.localStorage["muteMain"] = this._musicMuted;

			if(opt=="all" || opt=="achievements" || opt=="achievement")
				window.localStorage["achievements"] = JSON.stringify(this.achievements);

			if(opt=="all" || opt=="coins" || opt=="coin")
				window.localStorage["coins"] = this.coins;

			if(opt=="all" || opt=="upgrades" || opt=="upgrade")
				window.localStorage["upgrades"] = JSON.stringify(this.upgrades);

			if(opt=="all" || opt=="accessories" || opt=="accessory")
				window.localStorage["accessories"] = JSON.stringify(this.accessories);
		}
		else{
			console.log("WARNING: Browser does not support localStorage! Highscores, achievements and options will not be saved.");
			return false;
		}
	};

	this.GooglePlayServices = {
		//REMEMBER: "this" does NOT refer to the game object; it refers to the GooglePlayServices object.
		"player":{
			"id":"",
			"name":"UNKNOWN",
			"title":"-",
			"iconURL":""
		},
		"fetchPlayerData": function(){
			var _self = this;
			window.plugins.playGamesServices.showPlayer( function(data){
				this.player.name = data['displayName'];
				this.player.id = data['playerId'];
				this.player.title = data['title'];
				this.player.iconURL = data['hiResIconImageUrl'];

				//Once done, update the menu
				Game.playGamesMenu.profile.player_text.text = data['displayName'];
				renderer.render(stage);
			}.bind(_self));
		},
		"sendScore": function(score, leaderboardID){
				if(typeof score == "undefined" || score == null) return;

				if(typeof leaderboardID == "undefined" || leaderboardID == null){
					leaderboardID = Game.leaderboardID.toString();
				}

				var data = {
					"score": parseInt(score),
					"leaderboardId": leaderboardID
				};

				window.plugins.playGamesServices.submitScoreNow(data,function(){
					console.log("Score of "+data.score+" submitted to Google Play leaderboard  "+data.leaderboardId+"!");
				}.bind(Game),function(){
					console.log("Failure to submit score of "+data.score+" to Google Play"+((Game.isOnline)?"!":": Check your connection and try again!"));
				});
		},
		"showLeaderboard": function(id){
			if(typeof id == "undefined" || id == null || id.toString().toUpperCase()=="ALL"){				window.plugins.playGamesServices.showAllLeaderboards();
			}
			else{
				var data = {
					"leaderboardId": id
				}
				window.plugins.playGamesServices.showLeaderboard(data);
			}
		},
		"unlockAchievement": function(achievementName, num){
			if(typeof achievementName == "undefined" || achievementName == null){
				return;
			}
			if(typeof num == "undefined" || num == null){
				num = 0;
			}

			var achData = Game.achievements.single[achievementName][num];
			var achievementID = achData.id;

			//Set achievement as complete
			achData["complete"] = true;

			Game.saveOptions("achievements");

			if(!window.plugins || !Game.isLoggedIn) return;

			var data = {
				"achievementId": achievementID.toString()
			}

			window.plugins.playGamesServices.unlockAchievement(data, function(){
				console.log("Achievement Unlocked: "+achData["name"]);
				achData["synced"] = true;

				//alert("Giving you "+achData["points"]+" coins for unlocking achievement: "+achData["name"]);
				Game.incCoins(parseInt(achData["points"]), false);

				Game.saveOptions("achievements");
			}, function(){
				console.log("Failed to sync achievement");
				achData["synced"] = false;
				Game.saveOptions("achievements");
			});
		},
		"incrementAchievement": function(achievementName, num, steps, syncing){
			if(typeof achievementName == "undefined" || achievementName == null){
				return;
			}
			if(typeof num == "undefined" || num == null){
				num = 0;
			}
			if(typeof steps == "undefined" || steps == null){
				steps = 1;
			}
			if(typeof syncing == "undefined" || syncing == null){
				syncing = false;
			}

			var achData = Game.achievements.incremental[achievementName][num];
			var achievementID = achData.id;

			//Increment achievement steps; set as complete if necessary
			if(!syncing){
				achData["completedSteps"] = Math.min(achData["completedSteps"]+steps,achData["totalSteps"]);
				achData["completed"] = (achData["completedSteps"] == achData["totalSteps"]);
			}

			Game.saveOptions("achievements");

			if(!window.plugins || !Game.isLoggedIn) return;

			var data = {
					"achievementId": achievementID.toString(),
					"numSteps": steps
			};

			window.plugins.playGamesServices.incrementAchievement(data, function(){
				console.log("Achievement "+achData["name"]+" incremented by "+steps+" steps");
				achData["completedSteps_synced"] = Math.min(achData["completedSteps_synced"]+steps,achData["totalSteps"]);
				achData["synced"] = (achData["completedSteps_synced"] == achData["totalSteps"]);

				Game.saveOptions("achievements");

				if(achData["completed"] && achData["synced"]){
					Game.incCoins(parseInt(achData["points"]),false);
					//alert("Giving you "+achData["points"]+" coins for unlocking achievement: "+achData["name"]);
				}
			}, function(){
				console.log("Failed to sync achievement");
			});
		},
		"showAchievements": function(){
			window.plugins.playGamesServices.showAchievements();
		}
	};

	this.hitTest = function(obj1, obj2, leewayX, leewayY, setAnchor){
		if(typeof obj1.anchor!="undefined" && typeof obj2.anchor!="undefined" && setAnchor){
			//Ensure both objects anchor points are centered
			obj1.anchor.set(0.5); obj2.anchor.set(0.5);
		}

		if(Math.abs(obj1.x-obj2.x)<=(obj1.width+obj2.width-leewayX)/2 && Math.abs(obj1.y-obj2.y)<=(obj1.height+obj2.height-leewayY)/2){
			//obj1.anchor = an1; obj2.anchor = an2;
			return true;
		}
		else{
			//obj1.anchor = an1; obj2.anchor = an2;
			return false;
		}
	};

	this.resizeCanvas = function(){
		//if(this._gameStarted) alert("Resizing Canvas...");

		// Determine which screen dimension is most constrained
		var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

		this.ratio = Math.min(
			w/this.canvasWidth,
			h/this.canvasHeight
		);

		// Scale the view appropriately to fill that dimension
		stage.scale.x =	this.ratio;
		stage.scale.y = this.ratio;

		// Update the renderer dimensions
		//this.canvasWidth *= this.ratio;
		//this.canvasHeight *= this.ratio;

		renderer.resize(
			Math.ceil(this.canvasWidth * this.ratio),
			Math.ceil(this.canvasHeight * this.ratio)
		);

		renderer.render(stage);
	};

	this.gotoURL = function(url,e){
		if(typeof e == "object"){
			if(e.type=="mouseup" || e.type=="touchend"){
				this.preventHeroMovement++;
			}
		}

		if(url == "https://samleo8.github.io/games/"){
			this.GooglePlayServices.unlockAchievement("support");
		}

		if(isApp()){
			if(device.platform.toUpperCase() === 'ANDROID') {
				navigator.app.loadUrl(url, { openExternal: true });
			}
			else if (device.platform.toUpperCase() === 'IOS') {
				window.open(url, '_system');
			}
		}
		else{
			window.open(url, '_blank');
		}
	};
};
