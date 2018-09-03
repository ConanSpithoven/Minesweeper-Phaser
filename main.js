//currently set to canvas instead of auto because chrome is having issues with WEBGL on its current version
var game = new Phaser.Game(208, 208, Phaser.CANVAS, 'mineSweeper', { preload: preload, create: create, render: render });

var SQUARE_SIZE = 16;
var BOARD_COLS;
var BOARD_ROWS;

var squares;
var BombsToProcess = 0;
var SafeSquares = 0;
var TotalSquares = 0;
var bombSquare;

var button9x9;
var button11x11;
var button13x13;

var GameOver = "";
var Victory = "";

function preload() {

    game.load.spritesheet("SQUARES", "square16x16.png", SQUARE_SIZE, SQUARE_SIZE, 13);
    game.load.image("button9x9", "button9x9.png");
    game.load.image("button11x11", "button11x11.png");
    game.load.image("button13x13", "button13x13.png");

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setMinMax(214, 214, 838, 838);
}

function create() {

    // create the buttons for grid options
    button9x9 = game.add.button(game.world.centerX-16, game.world.centerY - 50, 'button9x9', NineGrid, this);
    button11x11 = game.add.button(game.world.centerX-16, game.world.centerY, 'button11x11', ElevenGrid, this);
    button13x13 = game.add.button(game.world.centerX-16, game.world.centerY + 50, 'button13x13', ThirteenGrid, this);

}

function NineGrid(){
    //set the gridsize to 9x9
    BOARD_ROWS = 9;
    BOARD_COLS = 9;

    //create the board and bombs
    spawnBoard();
    spawnBombs();
    //repeat for each button
    button9x9.pendingDestroy = true;
    button11x11.pendingDestroy = true;
    button13x13.pendingDestroy = true;
}
function ElevenGrid(){
    //set the gridsize to 11x11
    BOARD_ROWS = 11;
    BOARD_COLS = 11;

    //create the board and bombs
    spawnBoard();
    spawnBombs();
    //repeat for each button
    button9x9.pendingDestroy = true;
    button11x11.pendingDestroy = true;
    button13x13.pendingDestroy = true;
}
function ThirteenGrid(){
    //set the gridsize to 13x13
    BOARD_ROWS = 13;
    BOARD_COLS = 13;

    //create the board and bombs
    spawnBoard();
    spawnBombs();
    //repeat for each button
    button9x9.pendingDestroy = true;
    button11x11.pendingDestroy = true;
    button13x13.pendingDestroy = true;
}

// fill the screen with as many squares as possible
function spawnBoard() {
    
    TotalSquares = Math.floor(BOARD_COLS * BOARD_ROWS);
    //calculated boardsize

    squares = game.add.group();

    for (var i = 0; i < BOARD_COLS; i++)
    {
        for (var j = 0; j < BOARD_ROWS; j++)
        {
            var square = squares.create(i * SQUARE_SIZE, j * SQUARE_SIZE, "SQUARES");
            square.name = 'square' + i.toString() + 'x' + j.toString();
            square.inputEnabled = true;
            square.events.onInputDown.add(confirmSquare, this);
            square.frame = 0;
            square.origframe = 0;
            setSquarePos(square, i, j);
            SafeSquares += 1;
        }  
    }
}

function spawnBombs(){
    //select several squares randomly from the squares array and change them to bombs
    //there are board_cols * board_rows squares in the field, take a anywhere from 10% to 33% and turn these into bombs
    //select random percentage between 10% and 33% 
    var percentage = game.rnd.integerInRange(3, 10);
    //get random amount
    BombsToProcess = Math.floor(TotalSquares / percentage);
    //{select corresponding amount of coords}
    //{get the corresponding square and set its frame to bomb(unclicked)}
    while (BombsToProcess > 0){
        var bombX = game.rnd.integerInRange(0, BOARD_ROWS -1);
        var bombY = game.rnd.integerInRange(0, BOARD_COLS -1);
        bombSquare = getSquare(bombX, bombY);
        if (getSquareType(bombSquare) != 1){
            bombSquare.frame = 1;
            bombSquare.origframe = 1;
            BombsToProcess -= 1;
            SafeSquares -= 1;
       }
    }
}

function confirmSquare(square, pointer) {
    if ((square.frame === 0 || square.frame === 1 || square.frame === 12) && square.inputEnabled === true)
    {
        console.log("square was not yet clicked");
        if(pointer.rightButton.isDown){
            markSquare(square);
        }  else {
            if(getSquareType(square) === 1){
                console.log("square is a bomb");
                square.frame = 2;
                GameEnd(false);
            } else if (getSquareType(square) === 0){
                console.log("square is not a bomb");
                console.log(square);
                var surroundingBombs = checkBombs(square);
                console.log("there are " + surroundingBombs + " bombs around this square");
                clearSquare(square, surroundingBombs);        
            }
        }
    }
}

// flag a square
function markSquare(square){
    console.log("marking square");
    console.log(square.frame);
    if(square.frame !== 12){
        square.frame = 12;
        console.log("square is marked");
    } else if (square.frame === 12){
        square.frame = square.origframe;
    }
}

// find a square on the board according to its position on the board
function getSquare(posX, posY) {

    return squares.iterate("id", calcSquareId(posX, posY), Phaser.Group.RETURN_CHILD);

}

function clearSquare(square, surroundingBombs){
    if(SafeSquares > 0){
        console.log("clearing this square");
        console.log(surroundingBombs);
        square.frame = (surroundingBombs + 3);
        square.inputEnabled = false;
        console.log("lowering safe square count");
        SafeSquares -= 1;
        console.log(SafeSquares);
        if(SafeSquares <= 0){
            console.log("no safe squares left, ending in victory");
            GameEnd(true);
        }
        if(surroundingBombs === 0){
            console.log("this square has no bombs around it, checking and clearing adjacent squares");
            checkBombsInSurroundings(square);  
        }
    }
}

function setSquarePos(square, posX, posY){
    square.posX = posX;
    square.posY = posY;
    square.id = calcSquareId(posX, posY);
}

// the square id is used by getSquare() to find specific squares in the group
// each position on the board has a unique id
function calcSquareId(posX, posY) {

    return posX + posY * BOARD_COLS;

}

// the frame determines what type of square it is:
//0 = unclicked 1 = bomb(unclicked) 2 = bomb 3 = no bombs around 4 = 1 bomb around etc... 12 = flagged
function getSquareType(square) {

    return square.frame;

}

// check if there is a bomb in the given direction
function countSurroundingBombs(startSquare, dirX, dirY) {
    var curX = startSquare.posX + dirX;
    var curY = startSquare.posY + dirY;
    var count = 0;

    if (curX >= 0 && curY >= 0 && curX < BOARD_COLS && curY < BOARD_ROWS && getSquareType(getSquare(curX, curY)) === 1)
    {
        console.log("a bomb was found, adding to the count");
        count++;
    }
    return count;

}

// count how many bombs are around the selected square
function checkBombs(square) {
    console.log("checking surroundings for bombs");
    var checkUp = countSurroundingBombs(square, 0, -1);
    var checkUpLeft = countSurroundingBombs(square, -1, -1);
    var checkUpRight = countSurroundingBombs(square, 1, -1);
    var checkDown = countSurroundingBombs(square, 0, 1);
    var checkDownLeft = countSurroundingBombs(square, -1, 1);
    var checkDownRight = countSurroundingBombs(square, 1, 1);
    var checkLeft = countSurroundingBombs(square, -1, 0);
    var checkRight = countSurroundingBombs(square, 1, 0);

    var checkHoriz = checkLeft + checkRight;
    var checkVert = checkUp + checkDown;
    var checkDiag = checkUpLeft + checkUpRight + checkDownLeft + checkDownRight ;
    var Total = checkHoriz + checkVert + checkDiag;

    console.log("total of " + Total + " bombs found");

    return Total;
}

//check if any of the surrounding squares also have no bombs around them
function checkBombsInSurroundings(square){
    console.log("checking for bombs around the original square");
    
    if(square.posX >= 0 && square.posY-1 >= 0 && square.posX < BOARD_COLS && square.posY-1 < BOARD_ROWS){
        var top = getSquare(square.posX, (square.posY - 1));
        if(top.frame === 0){
            console.log("top");
            var topbombs = checkBombs(top);
            clearSquare(top, topbombs);
        }
    }
    
    if(square.posX+1 >= 0 && square.posY >= 0 && square.posX+1 < BOARD_COLS && square.posY < BOARD_ROWS){
        var right = getSquare((square.posX + 1), square.posY);
        if(right.frame === 0){
            console.log("right");
            var rightbombs = checkBombs(right);
            clearSquare(right, rightbombs);
        }
    }

    if(square.posX >= 0 && square.posY+1 >= 0 && square.posX < BOARD_COLS && square.posY+1 < BOARD_ROWS){
        var bottom = getSquare(square.posX, (square.posY + 1));
        if(bottom.frame === 0){
            console.log("bottom");
        var bottombombs = checkBombs(bottom);
        clearSquare(bottom, bottombombs);
        }
    }
    
    if(square.posX-1 >= 0 && square.posY >= 0 && square.posX-1 < BOARD_COLS && square.posY < BOARD_ROWS){
        var left = getSquare((square.posX - 1), square.posY);
        if(left.frame === 0){
            console.log("left");
            var leftbombs = checkBombs(left);
            clearSquare(left, leftbombs);
        }
    }

    if(square.posX-1 >= 0 && square.posY-1 >= 0 && square.posX-1 < BOARD_COLS && square.posY-1 < BOARD_ROWS){
        var topleft = getSquare((square.posX - 1), (square.posY - 1));
        if(topleft.frame === 0){
            console.log("topleft");
            var topleftbombs = checkBombs(topleft);
            clearSquare(topleft, topleftbombs);
        }
    }
    if(square.posX+1 >= 0 && square.posY-1 >= 0 && square.posX+1 < BOARD_COLS && square.posY-1 < BOARD_ROWS){
        var topright = getSquare((square.posX + 1), (square.posY - 1));
        if(topright.frame === 0){
            console.log("topright");
            var toprightbombs = checkBombs(topright);
            clearSquare(topright, toprightbombs);
        }

    }
    if(square.posX+1 >= 0 && square.posY+1 >= 0 && square.posX+1 < BOARD_COLS && square.posY+1 < BOARD_ROWS){
        var bottomright = getSquare((square.posX + 1), (square.posY + 1));
        if(bottomright.frame === 0){
            console.log("bottomright");
            var bottomrightbombs = checkBombs(bottomright);
            clearSquare(bottomright, bottomrightbombs);
        }
    }
    if(square.posX-1 >= 0 && square.posY+1 >= 0 && square.posX-1 < BOARD_COLS && square.posY+1 < BOARD_ROWS){
        var bottomleft = getSquare((square.posX - 1), (square.posY + 1));
        if(bottomleft.frame === 0){
            console.log("bottomleft");
            var bottomleftbombs = checkBombs(bottomleft);
            clearSquare(bottomleft, bottomleftbombs);
        }
    }
}

function GameEnd(succes){
    if(succes){
    Victory = "YOU WIN!";
    } else if (!succes){
    GameOver = "YOU LOSE!";
    }
}

function render() {

    //remember to reset this after the button is clicked
    game.debug.text(GameOver, game.world.centerX, game.world.centerY, 'rgb(255,0,0)');
    game.debug.text(Victory, game.world.centerX, game.world.centerY, 'rgb(0,255,0)');
}