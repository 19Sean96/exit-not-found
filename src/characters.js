const weapons = [
	["Brass knuckles", "Fists"],
	[""],
	["Pistol", "Rifle", "Sniper"],
];
const enemyType = ["Skeleton 💀", "Vampire 🧛", "Wizard 🧙", "Demon 👹"];

// melee
// range
//magic
// const weapons = ['melee','range','magic']

// playable character constructor
const Character = function (name, clas) {
	const C = this;
	// 0 = melee, 1 = magic, 2 = ranged
	C.class = clas;
	C.name = name;
	C.xp = 0;
	C.nextLvl = 100;
	C.lvl = 1;
    C.hp = !clas ? 100 : clas == 1 ? 50 : 75;
    C.maxHp = C.hp;
	C.attackStrength = !clas || clas == 1 ? rng() + 3 : rng(3) + 1;
	C.def = !clas ? rng() + 2 : clas == 1 ? rng(2) + 1 : rng(3) + 1;
	C.crit = {
		mult: 1.5,
		chance: 10
	};
	C.agility = !clas ? rng() + 2 : clas == 1 ? rng(2) + 1 : rng(5) + 3;

	C.actionsPerTurn = !clas ? rng() + 4 : clas == 1 ? rng(2) + 3 : rng() + 4;
	C.actionsLeft = C.actionsPerTurn;
    C.attackSpeed = ~~(C.attackStrength / 2) || 1;

    C.fov = !clas ? rng(2) + 1 : rng(3) + 2
    C.fov = Math.ceil(Math.sqrt(C.fov * C.fov + C.fov * C.fov));

	C.accuracy = !C.class
    ? 65 + rng(26)
    : C.class == 1
    ? 60 + rng(41)
    : 75 + rng(6);
	C.items = [];
	C.awaitingUser = false;
	C.checkIfNextLvl = function () {
		C.nextLvl - C.xp <= 0 && C.lvlUp();
	};
	C.lvlUp = function () {
		C.nextLvl += C.nextLvl + Math.pow(C.lvl, 3);
		C.lvl++;
		C.awaitingUser = true;
		// _playerLvl.textContent = C.lvl;
		// _expToNextLvl.textContent = player.nextLvl;
        _lvlUp.classList.remove("invisible");
        C.maxHp *= 1.1;
        // _healthpointsMax.innerHTML = C.maxHp;
		zzfxP(levelUpSound[rng(levelUpSound.length -1)]);		
		window.removeEventListener('onkeypress', handleKeyPress)
	};
	C.weapons = weapons[C.class];
	C.addStat = function (stat) {
		if (stat == 0) {
            const lvlAtk = Math.ceil(C.attackStrength * 1.2);
			createChatMessage('player', C.name, `I increased my attack strength by ${lvlAtk - C.attackStrength}!`);
            C.attackStrength = lvlAtk;
			// _playerAttackStrength.innerHTML = C.attackStrength;
		} else if (stat == 1) {
            const lvlAgl = Math.ceil(C.agility * 1.1)
			createChatMessage('player', C.name, `I increased my agility by ${lvlAgl - C.agility}!`);
			C.agility = lvlAgl;
			// _playerAgility.innerHTML = C.agility;
		} else if (stat == 2) {
            const lvlDef = Math.ceil(C.def * 1.15)
			createChatMessage('player', C.name, `I increased my defense by ${lvlDef - C.def}!`);
			C.def = lvlDef;
			// _playerDefense.innerHTML = C.def;
		} else if (stat == 3) {
            const lvlActions = Math.ceil(C.actionsPerTurn * 1.1)
			createChatMessage('player', C.name, `I increased my actions per turn by ${lvlActions - C.actionsPerTurn}!`);
			C.actionsPerTurn = lvlActions;
			C.actionsLeft = lvlActions;
			// _actionsTotal.innerHTML = C.actionsPerTurn;
            // _actionsLeft.innerHTML = C.actionsPerTurn;
		}

		_lvlUp.classList.add("invisible");
		C.awaitingUser = false;
		window.addEventListener('keypress', handleKeyPress)
	};
    C.coords = playerCoord;
	C.highlighted = 0;
	
	// C.hiliteFOV = function () {
	// 	const [cX,cY] = getCenterOfCoords(C);
	// 	ctx.fillStyle = colors.fovHighlight
    //     ctx.beginPath();
    //     ctx.arc(cX,cY,C.fov * TILE_HEIGHT, 0, Math.PI * 2);
    //     // ctx.clip()
	// 	// ctx.closePath();
    //     ctx.fill();
	// }

	C.hiliteMoveArea = function () {
        const checkerCoord = [C.coords];
        for (let i = 0; i < C.actionsLeft; i++) {
            checkerCoord.forEach(([cX,cY]) => {
                const potentialHighlights = [
                    [cX, cY - TILE_HEIGHT],
                    [cX + TILE_HEIGHT, cY],
                    [cX, cY + TILE_HEIGHT],
                    [cX - TILE_HEIGHT, cY],
                ];
                
                potentialHighlights.filter(([x, y]) => 
                    COORDINATES[x]?.[y]?.walkable &&
                    !COORDINATES[x]?.[y]?.occupied &&
                    !COORDINATES[x]?.[y]?.highlighted &&
                    !COORDINATES[x]?.[y]?.exit &&
                    (COORDINATES[x]?.[y]?.hasBeenSeen || inRange([x,y],C.coords, C.fov))
                ).forEach(([x,y]) =>{
                    if(x == C.coords[0] && y == C.coords[1]) return;
					COORDINATES[x][y].highlighted = 1;
                    checkerCoord.push([x, y])
                });
            })
        }
        
        checkerCoord.forEach(([x,y], notStart) => {
            if(notStart){
                ctx.clearRect(x,y,TILE_HEIGHT,TILE_HEIGHT)
                ctx.fillStyle = colors.walkHighlight;
                ctx.fillRect(x, y, TILE_HEIGHT, TILE_HEIGHT);
            }
        })
    };
	C.attackEnemy = async function (enemy) {
        const noEnergy = [
            "I'm tired....",
            "Can I take a moment rest first?",
            "If you want me to do something...I need more actions!"
        ]

        if(C.attackSpeed > C.actionsLeft) return noEnergy[rng(noEnergy.length)];

		const willHit = (C.accuracy - enemy.agility) >= rng(100) && C.attackStrength > enemy.def + enemy.block
        C.actionsLeft -= C.attackSpeed;
		
		const mult = rng(100) <= C.crit.chance ? Math.ceil(C.crit.mult * C.attackStrength) : C.attackStrength;
		if (willHit) {
			enemy.hp -= mult - enemy.def - enemy.block
			zzfxP(playerAttackSounds[player.class][rng(playerAttackSounds[player.class].length -1)])
		} else {
			if (mult <= enemy.block + enemy.def) zzfxP(blockSound[rng(blockSound.length -1)])
			else zzfxP(missedSound[rng(missedSound.length -1)])
		}
        
        if(enemy.hp < 1){
            const [x,y] = enemy.coords;
            COORDINATES[x][y].occupied = 0;
            enemies.splice(enemyIndex,1);
            C.xp += enemy.xp;

            _cursorModal.classList.add('invisible')
            if(!enemies.length) C.actionsLeft = C.actionsPerTurn;
            C.checkIfNextLvl();
        }

        showHoveredDetails(enemy)
        
        if(C.actionsLeft == 0){
            while(C.awaitingUser){
                const waiting = await checkIfWaiting();
                if(waiting) continue;
            }
            enemyTurn(exit)
        }

        paintCanvas();
        C.hiliteMoveArea();

        return mult <= enemy.block + enemy.def ?
            `${enemy.name} blocked your attack!` :
            willHit && enemy.hp < 1 ?
            `I defeated the ${enemy.name} by dealing ${mult - enemy.def - enemy.block} damage!` :
            willHit ? `I hit the ${enemy.name} for ${mult - enemy.def - enemy.block}!` :
			`I missed the ${enemy.name}!`;
	};

	C.inRange = [];
	C.checkFOV = function () {
        C.inRange = []
		enemies.forEach((enemy) => {
			if (inRange(C.coords, enemy.coords, C.fov)) {
                enemy.hasBeenSpotted = 1;
                C.inRange.push(enemy);
			}
        });
	};

	C.block = 0;
	C.resetActions = function () {
        C.actionsLeft = C.actionsPerTurn;
        C.block = 0;
	};
	C.defStance = async function () {
        if(enemies.length){
            C.block = ~~(C.actionsLeft/2);
            C.actionsLeft = 0;
            while(C.awaitingUser){
                const waiting = await checkIfWaiting();
                if(waiting) continue;
            }
            paintCanvas();
            return enemyTurn();
        }
        // add code to put text in actions window
        return 
	};
};

// enemy constructor
// difficulty === portion of totalEnemyPower
const Enemy = function (coords, enemyPower) {
	const E = this;
	const newClass = rng(100);
	E.coords = coords;
	// 0 = melee, 1 = magic, 2 = ranged
	E.class = newClass < 60 ? 0 : newClass < 85 ? 2 : 1;
	E.name = enemyType[rng(3)];
    E.hp = Math.floor(Math.sqrt(enemyPower)) + ~~(enemyPower / 10);
    E.agility = !E.class ? rng() + 2 : E.class == 1 ? rng(2) + 1 : rng(5) + 3;

	E.attackStrength =
		!E.class || E.class == 1
			? Math.ceil(enemyPower / (rng(11) + 10))
            : ~~(enemyPower / (rng(11) + 20));
    E.attackSpeed = ~~(E.attackStrength/2) - 1 > 0 ? ~~(E.attackStrength/2) - 1 : 1;
	E.accuracy = !E.class
		? 65 + rng(26)
		: E.class == 1
		? 60 + rng(41)
		: 75 + rng(6);
	E.def = !E.class ? ~~(enemyPower / (rng(21) + 40)) : 0;
	E.fov = !E.class ? rng(2) + 2 : rng() + 4;
    E.speed = E.class == 0 ? 6 : E.class == 1 ? 3 : 4;
    E.speedLeft = E.speed;
    E.playerSpotted = 0;
    E.hasBeenSpotted;
    E.xp = ~~(enemyPower / 5);
    E.crit = {
		mult: 2,
		chance: 60
    };

	E.atkChar = function (resolve, i, wasHit) {
        const [eX, eY] = E.coords;
        const toHit = rng(100);
        const blindHitMsg = [
            `uhhhhh....why am I bleeding?!`,
            `ouch....what was that?`,
            `is someone there...stop throwing stuff at me!!`,
            `ok....I can't even see you.`,
            `oh voice of the cave, please stop hurting me.`
        ]

		const willHit =
            E.accuracy - player.agility >= toHit && player.def + player.block < E.attackStrength;
        const mult = rng(100) <= E.crit.chance ? E.attackStrength * E.crit.mult : E.attackStrength;
        willHit && (player.hp -= mult - ~~player.def - player.block);
        E.speedLeft -= E.attackSpeed;
        const hit = mult - player.block - player.def;
        
        const attack = player.def + player.block >= mult ? `${player.name} blocked ${E.name}'s attack!` :
        willHit && E.attackStrength != mult ? `hehehehehe....get crit'd. you just got hit for ${hit}` :
        willHit ? `just hit you for ${hit}!` :
		`I missed!`
		
		if (willHit) {
			zzfxP(enemyAttackSounds[E.class][rng(enemyAttackSounds[E.class].length -1)]);		
		} else if (player.def + player.block >= E.attackStrength && E.accuracy - player.agility >= toHit) {
			zzfxP(blockSound[rng(blockSound.length -1)]);
		} else if (E.accuracy - player.agility < toHit) {
			zzfxP(missedSound[rng(missedSound.length -1)]);
		}

        if(player.inRange.some(({coords: [x,y]}) => eX == x && eY == y)){
			wasHit && willHit && wasHit(1)
            createChatMessage('enemy', `#${i} - ${E.name}`, attack);
        } else if(willHit && !inRange([eX,eY], player.coords, player.fov)) {
            wasHit && willHit && wasHit(1)
            createChatMessage('player', player.name, `${blindHitMsg[rng(blindHitMsg.length)]}  (-${hit} hp)`);
        }

        resolve();
        
        // GAME OVER SCENARIO FOR PLAYER
        if(player.hp < 1){
            clearTimeout(moveTimer);
            return gameOver();
        }
	};

	E.handleTurn = function (resolve, i) {
		const [x, y] = E.coords;

        const isExit = ([a, b]) => exit[0] == a && exit[1] == b;
        const canSee = E.checkFOV();
        const canAttack = E.speedLeft - E.attackSpeed >= 0;

        if(canSee && canAttack){
            return setTimeout(() => E.atkChar(resolve, i), 2000)
        }
        
        if(canSee && rng(100) <= 75){
            return setTimeout(() => E.defStance(resolve, i), 1400)
        }

		const surroundings = [
			{
				pos: "top",
				coord: [x, y - TILE_WIDTH],
				available: COORDINATES[x]?.[y - TILE_WIDTH]?.walkable,
				occupied: COORDINATES[x]?.[y - TILE_WIDTH]?.occupied,
				checkIfExit: isExit([x, y - TILE_WIDTH]),
			},
			{
				pos: "right",
				coord: [x + TILE_WIDTH, y],
				available: COORDINATES[x + TILE_WIDTH]?.[y]?.walkable,
				occupied: COORDINATES[x + TILE_WIDTH]?.[y]?.occupied,
				checkIfExit: isExit([x + TILE_WIDTH, y]),
			},
			{
				pos: "bottom",
				coord: [x, y + TILE_WIDTH],
				available: COORDINATES[x]?.[y + TILE_WIDTH]?.walkable,
				occupied: COORDINATES[x]?.[y + TILE_WIDTH]?.occupied,
				checkIfExit: isExit([x, y + TILE_WIDTH]),
			},
			{
				pos: "left",
				coord: [x - TILE_WIDTH, y],
				available: COORDINATES[x - TILE_WIDTH]?.[y]?.walkable,
				occupied: COORDINATES[x]?.[y - TILE_WIDTH]?.occupied,
				checkIfExit: isExit([x - TILE_WIDTH, y]),
			},
		];

		let availableSurroundings = surroundings.filter(
			(c) => c.available && !c.checkIfExit && !c.occupied
		);

        player.checkFOV();

        E.speedLeft--;

        if (E.playerSpotted) {
            const [subX, subY] = [player.coords[0] - x, player.coords[1] - y];
            const moves = availableSurroundings.filter((c) => {
                if (c.pos == "left") return subX < 0;
                if (c.pos == "right") return subX > 0;
                if (c.pos == "top") return subY < 0;
                if (c.pos == "bottom") return subY > 0;
            });

            if(moves.length){
                availableSurroundings = moves;
            }
        }

        const newCoords = rng(availableSurroundings.length);
        COORDINATES[x][y].occupied = 0;

        E.coords =
            availableSurroundings.length > 0
                ? availableSurroundings[newCoords].coord
                : E.coords;
        const {coords: [newX, newY]} = E;
        COORDINATES[newX][newY].occupied = 1;
        setTimeout(() => {paintCanvas();zzfxP(eMove[rng(eMove.length -1)]);resolve()}, 300)
        
    };
    E.block = 0;
    E.defStance = function(resolve,i){
        const msg = [
            name => `betcha can't hurt me now ${name}`,
            name => `hey ${name}...check out this shield`,
            name => `no way you're gonna break this defense ${name}`
        ];

        E.block = E.speedLeft;
        E.speedLeft = 0;
        if(inRange(E.coords, player.coords, player.fov)){
            createChatMessage('enemy', `#${i} - ${E.name}`, msg[rng(msg.length)](player.name))
        }
        resolve()
    }
	E.checkFOV = function () {
		if (inRange(E.coords,player.coords,E.fov)) {
            E.playerSpotted = 1;
            return 1;
		} else if(!inRange(E.coords, player.coords,E.fov + E.fov)){
            E.playerSpotted = 0;
        }
    };
    E.resetActions = function(){
        E.speedLeft = E.speed;
        E.block = 0;
    }
};

//========================= PLAYER ======================
// EXPERIENCE DETAILS
// experience to next level = prevousLevelExperience + level^3 (to 1: 100, to 2: 203, to 3: 311, to 4: 438, to 5: 602,etc.)
// EXPERIENCE GAIN:
// completing 10 levelS = level up with minimum needed to get to next "player level" to compensate for *RARE* occassion when player does NOT encounter anymies those 10 levels
// destroying an enemy = enemyPower / 5

// HP
// MELEE: LVL1: 100, LVL2: 110, LVL3: 121, LVL4: 133
// RANGED: LVL1: 50, LVL2: 55, LVL3: 61, LVL4: 68
// MAGIC: LVL1: 75, LVL2: 83, LVL3: 92, LVL4: 102

// ATTACK STRENGTH
// MELEE/MAGIC: 3-6 AP (initial)
// RANGED: 1-3

// DEFENSE
// melee: [2,5]
// ranged: [1,3]
// magic: [1,2]

// SPEED
// attacking speed: |SPEED - ATTACK STRENGTH|

// AGILITY
// (agility roll - DND) MODIFIER TO ENEMY'S "ACCURACY"
// decides whether player can esxape enemy attack
// dodge
// melee ((MID AGILITY)) AGILITY = [2,5]
// range ((HIGH AGILITY)) AGILITY = [3,7]
// magic ((LOW AGILITY)) AGILITY = [1,2]

// CHANCE TO HIT WOULD BE "ENEMY_ACC - AGILITY"

// FOV
// MELEE: [2,3]
// RANGE: [4,7]
// MAGIC: [4,7]

//========================= ENEMY ======================

// HP
// LEVEL1-5:
// 1 ENEMY: 10 + 10 = 20
// 2 ENEMIES: 7 + 5 = 12 * 2 = 24
// LEVEL6-10:
// 1 ENEMY: 12 + 15 = 27
// 2 ENEMIES: 8 + 7 = 15 * 2 = 30
// 3 ENEMIES: 7 + 5 = 12 * 3 = 36

// ATTACK STRENGTH
// LEVEL1-5
// MELEE/MAGIC:
// 1 enemy: [5,10]
// 2 enemy: [3,5]
// RANGED:
// 1 enemy: [4,5]
// 2 enemies: [2,3]
// LEVEL6-10
// MELEE/MAGIC:
// 1 enemy: [8,15]
// 2 enemy: [4,8]
// 3 enemy: [3,5]
// RANGED:
// 1 enemy: [5,8]
// 2 enemies: [3,4]
// 3 enemies: [2,3]

// DEFENSE
// LEVEL1-5
// MELEE:
// 1 enemy: [1,2]
// 2 enemy: [0,1]
// MAGE/RANGED:
// 1 enemy: 0
// 2 enemies: 0
// LEVEL6-10
// MELEE:
// 1 enemy: [2,3]
// 2 enemy: [1,1]
// 3 enemy: [0,1]
// MAGE/RANGED:
// 1 enemy: 0
// 2 enemies: 0
// 3 enemies: 0
// FOV
// MELEE: [2,3]
// RANGE: [4,7]
// MAGIC: [4,7]

// ACCURACY
// MELEE: [65%-90%]
// RANGED: [75-80%]
// MAGE: [60-100%]

// SPEED
// MELEE: 6
// MAGE: 3
// RANGE: 4

// EXPERIENCE ON DESTRUCTION

// ==================
// IMPLEMENTATION
// ==================

// 0. add UI for player creation & additional options for user during game (attack, use item, etc.)

// DESKTOP ONLY (min-width: 1280px)

//* landing page (optional)
//! player create page

/* 4 components for game
		* 1. canvas
		* 2. player stats
		? 3. player actions
		* 4. enemy stats
	*/
///////////////////////////////////

//! add modal for stat update

////////////// CHECK. DONE ////////////////
// 1. get the player funct done with auto level up every 10 levels (before taking into account enemy interactions)
// implement formulas for calculating data
// add experience = to room # on room completion
// level up every 10 levels with experience total
// UPGRADE 1 STAT
////////////// CHECK. DONE ////////////////

// 2. assign enemy characteristics for each generated enemy (still no player/enemy interaction)
//* 1. split power between amount of random number of enemies
//* 2. Each generated enemy gets pushed into global Array
//* 3. Loop over enemy array to set init coords(find index of enemy)
//* 4. Save current coords in enemy constructor for access later(onclick for stats)
//* 5. Loop over enemy array to do movements/attacks for each enemy after player turn(find index of enemy)

// 3. get enemies to follow player once player enters Field of Vision (fov)
// set ENTERED_VISION (per enemy) to TRUE - then the enemy will move toward player
//* 1. Get difference on both axis and divide each by tile size then add together for distance
//* 2. If in FOV, prefer attack over moving
// 3. If player has been spotted by certain enemies always move toward player instead of random movement

// 3a. If player has been spotted by certain enemies always move toward player instead of random movement
// 1. check player coords and subtract from enemy coords on each axis. difference will show what direction to move
// 2. if more than one way to go choose randomly
// 3. if stuck pick a direction that enemy can move in until we can start moving back to player

// 4. add turn "speed" funct (how many moves/attacks player can make before an enemy makes a move/attacks)
//* 1. every move or attack we need to subtract speed
//* 2. will need current speed property on user and enemy

// 5. add funct for player to attack enemy
// 6. add funct for enemy to attack player
// 1. when attack is chosen, subtract player attack from enemy hp and add enemy defense
// 2. potential animation on enemy and/or enemy stat block

// 7. add allowable move area to hightlight canvas on player turn
    // 1. store current coords on player
    // 2. loop however many times total speed is and for each direction subtract/add tiles
    // 3. use these coords for highlighting area around player to show where they can move
    // 4. make user confirm before before setting coords of new position
    // 5. if user can make the move with the amount of speed left store new current on player
    // 6. if user can't make the move give a notification and leave player in current position


    /*
        get all possible moves in each direction from start position coords and push into array
        
    */