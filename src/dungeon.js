// ==========================
// BUILDING OUT THE DUNGEON
// ==========================

const buildDungeon = (
	cHeight,
	cWidth,
	columns,
	rows,
	tHeight,
	tWidth,
	[pExitX, pExitY]
) => {
    // console.log(COORDINATES)
    // clear board of previous paint...if any
    ctx.clearRect(0, 0, cWidth, cHeight);
    start.length = 0;
    const [sX, sY] = inverseCoords([pExitX, pExitY]);
    start.push(sX, sY)
    // SET UP COORDINATE PLANE
	columns.forEach((vX, x, col) => {
        const newX = x;
		x = x * tWidth;
		COORDINATES[x] = {};
        
        rows.forEach((vY, y, row) => {
            const start = sX == x && sY == y;
            const newY = y;
            y = y * tHeight;
            const cellChance = Math.random();
            const newStartIsHere = sX === x && sY === y;

            COORDINATES[x][y] = {
                hasBeenSeen: 0,
                inSight: 0,
                quadrant:
                    // TOP RIGHT
                    x >= xyMax/2 && y <= xyMax/2 ? 1 :
                    // TOP LEFT
                    x <= xyMax/2 && y <= xyMax/2 ? 2 :
                    // BOTTOM LEFT
                    x <= xyMax/2 && y >= xyMax/2 ? 3 :
                    // BOTTOM RIGHT
                    4,
                corner:
                    x == 0 && y == 0 ? 1 :
                    x == 0 && y == xyMax ? 1 :
                    x == xyMax && y == xyMax ? 1 :
                    x == xyMax && y == 0 ? 1 : 0
            };

            if(newX == 0 || newY == 0 || y == xyMax || x == xyMax){
                COORDINATES[x][y].walkable = sX == x && sY == y ? 1 : 0;
                start ? COORDINATES[x][y].start = 1 : COORDINATES[x][y].border = 1;
                
            } else if(x < xyMax && y < xyMax){
                COORDINATES[x][y].walkable =
                cellChance <= WALKABLE_TILE_CHANCE || newStartIsHere ? 1 : 0;
                COORDINATES[x][y].walkable ? walkableTiles++ : COORDINATES[x][y].occupied = 1;
            } else if(COORDINATES[x][y].corner){
                COORDINATES[x][y].walkable = 0;
            }
        });
    });
        
        exit = generateRandomEndpoint([sX, sY], tHeight);
        COORDINATES[exit[0]][exit[1]].walkable = 1;
        COORDINATES[exit[0]][exit[1]].exit = 1;


        // checks to make sure the dungeon can be completed.
        // if not build another one until you get one that can be
    if (!checker([sX, sY])) return (
        buildDungeon(cHeight, cWidth, columns, rows, tHeight, tWidth, [pExitX,pExitY])
    );
  
    generatePlayer([sX, sY], COORDINATES, tHeight);
    generateEnemies(lvl, xyMax, COORDINATES);

    _dungeon.innerHTML = dungeon++;
};


// STEPS TO REPRODUCE ABOVE TO PRODUCE CANVAS ELEMENT WITH TILES\
// 1. initiate the canvas element with a width & a height.
// 2. set up coordinate plane relative to canvas element size considering the # number of rows & colummns
