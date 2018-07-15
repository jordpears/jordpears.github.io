upperBorder = 0.1*window.innerHeight;
lowerBorder = 0.2*window.innerHeight; //minimum borders for game
sideBorder = 0.05*window.innerWidth;

darkboard = document.getElementById('darkboard'); //background squares
lightboard = document.getElementById('lightboard');

function Chessboard(){
  this.gameState = ["cb","hb","bb","qb","kb","bb","hb","cb",
                  "p1b","p1b","p1b","p1b","p1b","p1b","p1b","p1b",
                  "","","","","","","","",
                  "","","","","","","","",
                  "","","","","","","","",
                  "","","","","","","","",
                  "p1w","p1w","p1w","p1w","p1w","p1w","p1w","p1w",
                  "cw","hw","bw","qw","kw","bw","hw","cw"];
  this.boardPositions = [];
  this.pieceClicked = -1; //no piece clicked
  this.inCheck = false;
  this.color = "w";
  this.enemyColor = "";
  this.kingMoved = false;

  this.setupBoardPositions = function() {
    var across = 0;
    for(i = 0;i<8*8;i++){
      var pos = [pieceSize*across,pieceSize*Math.floor(i/8)];
      across += 1;
      if(across == 8){
        across = 0;
      }
      this.boardPositions.push(pos);
    }
  }

  this.drawState = function() {
    //print the board first
    var across = 0;
    var alternate = true;
    for(i = 0;i<8*8;i++){
      if(alternate){
          ctx.drawImage(lightboard,pieceSize*across,pieceSize*Math.floor(i/8),pieceSize,pieceSize);
          if(across != 7){
            alternate = false;
          }
      }
      else{
        ctx.drawImage(darkboard,pieceSize*across,pieceSize*Math.floor(i/8),pieceSize,pieceSize);
        if(across != 7){
          alternate = true;
        }
      }
      across += 1;
      if(across == 8){
        across = 0;
      }
    }
    //now print pieces
    var across = 0;
    var alternate = true;
    for(i = 0;i<8*8;i++){
      if(this.gameState[i] != ""){
        ctx.drawImage(document.getElementById(this.gameState[i]),pieceSize*across,pieceSize*Math.floor(i/8),pieceSize,pieceSize);
      }
      across += 1;
      if(across == 8){
        across = 0;
      }
    }
  }

  this.clicked = function(mouseX,mouseY){
    var xFound,yFound = false;
    for(i = 0;i<this.boardPositions.length;i++){
      if(mouseX < this.boardPositions[i][0] + pieceSize && mouseX > this.boardPositions[i][0] && !xFound){
        var xPos = i;
        xFound = true;
      }
      if(mouseY < this.boardPositions[i][1] + pieceSize && mouseY > this.boardPositions[i][1] && !yFound){
        var yPos = Math.floor(i/8);
        yFound = true;
      }
    }
    var arrayLocation = yPos*8+xPos;
    if(this.pieceClicked == -1){
      if(this.gameState[arrayLocation] != "" && this.gameState[arrayLocation].slice(this.gameState[arrayLocation].length-1,this.gameState[arrayLocation].length) == this.color){ //check not blank or enemy piece for selection
          this.pieceClicked = arrayLocation;
          ctx.beginPath();
          ctx.lineWidth="3";
          ctx.strokeStyle="red";
          ctx.rect(pieceSize*xPos,pieceSize*yPos,pieceSize,pieceSize);
          ctx.stroke();
          xPosOld = xPos;
          yPosOld = yPos;
      }
    }
    else{
      if(arrayLocation == this.pieceClicked){
        this.pieceClicked = -1;
        this.drawState();
      }
      else {
      this.movePiece(arrayLocation,xPos,yPos,xPosOld,yPosOld);
      }
    }
  }

  this.movePiece = function(moveTo,xPos,yPos,xPosOld,yPosOld){ //verify move
    var abort = false;
    var pieceAtMoveTo = this.gameState[moveTo];
    var pieceToMove = this.gameState[this.pieceClicked];
    var castling = false;
    distanceMovedX = xPosOld - xPos;
    distanceMovedY = yPosOld - yPos;

    //piece verification
    if(pieceToMove.slice(pieceToMove.length-1,pieceToMove.length) == pieceAtMoveTo.slice(pieceAtMoveTo.length-1,pieceAtMoveTo.length)) { //if moving to spot with same color piece.
      if(!this.kingMoved && pieceAtMoveTo.slice(0, -1) == "c" && pieceToMove.slice(0,-1) == "k" && this.gameState[this.pieceClicked+1] == "" && this.gameState[this.pieceClicked+2] == "" && !this.checkChecker() && !this.inCheck) { //im castling!
        var failed = false;
        castling = true;
        if(moveTo>this.pieceClicked){ //castle right
          //check not passing check.
          this.gameState[this.pieceClicked+1] = this.gameState[this.pieceClicked];
          this.gameState[this.pieceClicked] = "";
          if(this.checkChecker()){
            failed = true;
          }
          this.gameState[this.pieceClicked] = pieceToMove;
          this.gameState[this.pieceClicked+1] = "";
          //check not putting into check
          this.gameState[this.pieceClicked+2] = this.gameState[this.pieceClicked];
          this.gameState[this.pieceClicked] = "";
          if(this.checkChecker()){
            failed = true;
          }
          this.gameState[this.pieceClicked] = pieceToMove;
          this.gameState[this.pieceClicked+2] = "";
          if(!failed){
            this.gameState[63] = "";
            this.gameState[61] = "c"+this.color;
            moveTo -= 1;
          }
          else{
            abort = true;
            castling = false;
          }
        }
        else{
          this.gameState[this.pieceClicked-1] = this.gameState[this.pieceClicked];
          this.gameState[this.pieceClicked] = "";
          if(this.checkChecker()){
            failed = true;
          }
          this.gameState[this.pieceClicked] = pieceToMove;
          this.gameState[this.pieceClicked-1] = "";
          //check not putting into check
          this.gameState[this.pieceClicked-2] = this.gameState[this.pieceClicked];
          this.gameState[this.pieceClicked] = "";
          if(this.checkChecker()){
            failed = true;
          }
          this.gameState[this.pieceClicked] = pieceToMove;
          this.gameState[this.pieceClicked-2] = "";
          if(!failed){
            this.gameState[56] = "";
            this.gameState[59] = "c"+this.color;
            moveTo += 2;
          }
          else{
            abort = true;
            castling = false;
          }
        }
      }
      else
      {
        abort = true;
      }
    }
    switch(pieceToMove.slice(0, -1)){

      case "p1":
        if(pieceAtMoveTo != ""){
          if(distanceMovedY <= 1 && distanceMovedY > 0 && Math.abs(distanceMovedX) == 1){
            pieceToMove = this.gameState[this.pieceClicked].slice(0,1) + this.gameState[this.pieceClicked].slice(2);
            break;
          }
        }
        if(distanceMovedY <= 2 && distanceMovedY > 0 && distanceMovedX == 0){
          pieceToMove = this.gameState[this.pieceClicked].slice(0,1) + this.gameState[this.pieceClicked].slice(2);
          break;
        }
        abort = true;
      case "p":
        if(pieceAtMoveTo != ""){
          if(distanceMovedY <= 1 && distanceMovedY > 0 && Math.abs(distanceMovedX) == 1){
            break;
          }
        }
        if(distanceMovedY <= 1 && distanceMovedY > 0 && distanceMovedX == 0 && pieceAtMoveTo == ""){
          break;
        }
        abort = true;
      case "c":
        if((Math.abs(distanceMovedX) > 0 && distanceMovedY == 0) || (Math.abs(distanceMovedY) > 0 && distanceMovedX == 0)){
          break;
        }
        abort = true;
      case "h":
        if((Math.abs(distanceMovedX) == 1 && Math.abs(distanceMovedY) == 2) || (Math.abs(distanceMovedX) == 2 && Math.abs(distanceMovedY) == 1)){
          break;
        }
        abort = true;
      case "b":
        if(Math.abs(distanceMovedX) == Math.abs(distanceMovedY)){
          break;
        }
        abort = true;
      case "q":
        if(Math.abs(distanceMovedX) == Math.abs(distanceMovedY) || ((Math.abs(distanceMovedX) > 0 && distanceMovedY == 0) || (Math.abs(distanceMovedY) > 0 && distanceMovedX == 0))){
          break;
        }
        abort = true;
      case "k":
        if((Math.abs(distanceMovedX) <= 1 && Math.abs(distanceMovedY) <= 1 ) || castling){
          this.kingMoved = true;
          break;
        }
        abort = true;
    }

    //check for collision
    var piecePath = this.determinePiecePath(pieceToMove.slice(0, -1),xPos,yPos,xPosOld,yPosOld);
    for(var i = 0;i<piecePath.length;i++){
      if(this.gameState[this.getBoardArrayPos(piecePath[i])] != ""){
        abort = true;
      }
    }

    //check if move makes check
    this.gameState[moveTo] = this.gameState[this.pieceClicked];
    this.gameState[this.pieceClicked] = "";
    if(this.checkChecker()){
      abort = true;
    }
    this.gameState[moveTo] = pieceAtMoveTo;
    this.gameState[this.pieceClicked] = pieceToMove;

    if(!abort) {
      this.gameState[moveTo] = pieceToMove;
      this.gameState[this.pieceClicked] = "";
      this.pieceClicked = -1;
      this.drawState();
    }
    else{
      this.pieceClicked = -1;
      this.drawState();
    }
  }

  this.checkChecker = function(){ //generate a probe that explores diagonally/vertially/horizontally to find threatening pieces to find check.
    var probe = [];
    checked = false;
    var directions = ["up","down","left","right","upleft","downleft","upright","downright"]; //all directions of threat.
    for(var i = 0;i<directions.length;i++){ //check for castle/bishop/queen threat
      probe = this.getXYfromArrayPos(this.gameState.indexOf("k"+this.color)); //get position of the king to begin the probing process
      var directionToCheck = directions[i];
      var collided = false;
      while(!collided){
        switch(directionToCheck){
          case "up":
            probe[1] -= 1;
            if(this.gameState[this.getBoardArrayPos(probe)] == "q"+this.enemyColor || this.gameState[this.getBoardArrayPos(probe)] == "c"+this.enemyColor){
              checked = true;
              console.log("Check from " + directionToCheck);
            }
            break;
          case "down":
            probe[1] += 1;
            if(this.gameState[this.getBoardArrayPos(probe)] == "q"+this.enemyColor || this.gameState[this.getBoardArrayPos(probe)] == "c"+this.enemyColor){
              checked = true;
              console.log("Check from " + directionToCheck);
            }
            break;
          case "left":
            probe[0] -= 1;
            if(this.gameState[this.getBoardArrayPos(probe)] == "q"+this.enemyColor || this.gameState[this.getBoardArrayPos(probe)] == "c"+this.enemyColor){
              checked = true;
              console.log("Check from " + directionToCheck);
            }
            break;
          case "right":
            probe[0] += 1;
            if(this.gameState[this.getBoardArrayPos(probe)] == "q"+this.enemyColor || this.gameState[this.getBoardArrayPos(probe)] == "c"+this.enemyColor){
              checked = true;
              console.log("Check from " + directionToCheck);
            }
            break;
          case "upleft":
            probe[0] -= 1;
            probe[1] -= 1;
            if(this.gameState[this.getBoardArrayPos(probe)] == "q"+this.enemyColor || this.gameState[this.getBoardArrayPos(probe)] == "b"+this.enemyColor){
              checked = true;
              console.log("Check from " + directionToCheck);
            }
            break;
          case "downleft":
            probe[0] -= 1;
            probe[1] += 1;
            if(this.gameState[this.getBoardArrayPos(probe)] == "q"+this.enemyColor || this.gameState[this.getBoardArrayPos(probe)] == "b"+this.enemyColor){
              checked = true;
              console.log("Check from " + directionToCheck);
            }
            break;
          case "upright":
            probe[0] += 1;
            probe[1] -= 1;
            if(this.gameState[this.getBoardArrayPos(probe)] == "q"+this.enemyColor || this.gameState[this.getBoardArrayPos(probe)] == "b"+this.enemyColor){
              checked = true;
              console.log("Check from " + directionToCheck);
            }
            break;
          case "downright":
            probe[0] += 1;
            probe[1] += 1;
            if(this.gameState[this.getBoardArrayPos(probe)] == "q"+this.enemyColor || this.gameState[this.getBoardArrayPos(probe)] == "b"+this.enemyColor){
              checked = true;
              console.log("Check from " + directionToCheck);
            }
            break;
        }
        if(probe[0] >= 1 && probe[0] < 7 && probe[1] >= 1 && probe[1] < 7){
          if(!(this.gameState[this.getBoardArrayPos(probe)] == "" || this.gameState[this.getBoardArrayPos(probe)].slice(0,1) == "k")){
            collided = true;
          }
        }
        else{
          collided = true;
        }
      }
    }
    //check for pawn threat
    probe = this.getXYfromArrayPos(this.gameState.indexOf("k"+this.color));
    if(this.gameState[this.getBoardArrayPosOffset(probe,-1,-1)] == "p"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,-1,+1)] == "p"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,-1,-1)] == "p1"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,-1,+1)] == "p1"+this.enemyColor){
      checked = true;
      console.log("pawn");
    }
    //check for knight threat
    if(this.gameState[this.getBoardArrayPosOffset(probe,-1,-2)] == "h"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,-1,+2)] == "h"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,+1,-2)] == "h"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,+1,+2)] == "h"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,-2,-1)] == "h"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,-2,+1)] == "h"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,+2,-1)] == "h"+this.enemyColor ||
    this.gameState[this.getBoardArrayPosOffset(probe,+2,+1)] == "h"+this.enemyColor){
      checked = true;
      console.log("knight");
    }
    return checked;
  }

  this.determinePiecePath = function(piece,xPos,yPos,xPosOld,yPosOld){ //determine all positions a piece will pass to get to its final position. --excluding knights due to jump and kings due to 1step.
    var positionsPassed = [];
    switch(piece){
      case "p1":
        for(var i = yPosOld-1;i>yPos;i--){
          positionsPassed.push([xPos,i]);
        }
        break;
      case "c":
        for(var i = yPosOld-1;i>yPos;i--){ //up
          positionsPassed.push([xPos,i]);
        }
        for(var i = yPosOld+1;i<yPos;i++){ //down
          positionsPassed.push([xPos,i]);
        }
        for(var i = xPosOld-1;i>xPos;i--){ //left
          positionsPassed.push([i,yPos]);
        }
        for(var i = xPosOld+1;i<xPos;i++){ //right
          positionsPassed.push([i,yPos]);
        }
        break;
      case "b":
      var loops = 0;
      if(xPos > xPosOld){ //going right
        for(var i = yPosOld-1;i>yPos;i--){ //up & right
          loops -= 1;
          positionsPassed.push([xPosOld-loops,i]);
        }
        for(var i = yPosOld+1;i<yPos;i++){ //down & right
          loops -= 1;
          positionsPassed.push([xPosOld-loops,i]);
        }
      }
      else{ //going left
        for(var i = yPosOld-1;i>yPos;i--){ //up & left
          loops += 1;
          positionsPassed.push([xPosOld-loops,i]);
        }
        for(var i = yPosOld+1;i<yPos;i++){ //down & left
          loops += 1;
          positionsPassed.push([xPosOld-loops,i]);
        }
      }
      break;
      case "q":
      if(yPosOld == yPos || xPosOld == xPos){ //castle style movement
        for(var i = yPosOld-1;i>yPos;i--){ //up
          positionsPassed.push([xPos,i]);
        }
        for(var i = yPosOld+1;i<yPos;i++){ //down
          positionsPassed.push([xPos,i]);
        }
        for(var i = xPosOld-1;i>xPos;i--){ //left
          positionsPassed.push([i,yPos]);
        }
        for(var i = xPosOld+1;i<xPos;i++){ //right
          positionsPassed.push([i,yPos]);
        }
      }
      else{ //bishop style movement
        var loops = 0;
        if(xPos > xPosOld){ //going right
          for(var i = yPosOld-1;i>yPos;i--){ //up & right
            loops -= 1;
            positionsPassed.push([xPosOld-loops,i]);
          }
          for(var i = yPosOld+1;i<yPos;i++){ //down & right
            loops -= 1;
            positionsPassed.push([xPosOld-loops,i]);
          }
        }
        else{ //going left
          for(var i = yPosOld-1;i>yPos;i--){ //up & left
            loops += 1;
            positionsPassed.push([xPosOld-loops,i]);
          }
          for(var i = yPosOld+1;i<yPos;i++){ //down & left
            loops += 1;
            positionsPassed.push([xPosOld-loops,i]);
          }
        }
      }
      break;
    }
    return positionsPassed;
  }

  this.getBoardArrayPos = function(xyPosition){
    return xyPosition[1]*8+xyPosition[0];
  } //converts [x,y] into array index.

  this.getBoardArrayPosOffset = function(xyPosition,xOffset,yOffset){
    if(xyPosition[0]+xOffset < 0 || xyPosition[0]+xOffset > 7){
        xOffset = 0;
    }
    if(xyPosition[1]+yOffset < 0 || xyPosition[1]+yOffset > 7){
        yOffset = 0;
    }
    return (xyPosition[1]-yOffset)*8+(xyPosition[0]+xOffset);
  }//get array pos but can deal with offsets.

  this.getXYfromArrayPos = function(ArrayPos){
    var x = 0;
    var y = 0;
    for(var i = 0;i<=64;i+=8){
      if(ArrayPos-i<8){
        y = Math.floor(i/8);
        x = ArrayPos-i;
        return [x,y];
      }
    }
  }//convert array pos back into [x,y]
  //"contructor"
  this.setupBoardPositions();
  if(this.color == "b"){
    this.gameState.reverse();
    this.enemyColor = "w";
  }
  else{
    this.enemyColor = "b";
  }

}

window.onload = function() {

  var pieceSizeWidth = (window.innerWidth-sideBorder*2)/8.0;
  var pieceSizeHeight = (window.innerHeight-lowerBorder-upperBorder)/8.0;
  pieceSize = Math.min(pieceSizeWidth,pieceSizeHeight);
  sideBorder = (window.innerWidth - pieceSize*8)/2;

  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  ctx.canvas.width  = pieceSize*8;
  ctx.canvas.height = pieceSize*8;
  canvas.style.top = upperBorder + "px";
  canvas.style.left = sideBorder + "px";
  canvas.style.width = pieceSize*8 + "px";
  canvas.style.height = pieceSize*8 + "px";

  canvas.addEventListener("click",function(event){onClick(event);}); //set up click event listener

  board = new Chessboard();
  board.drawState();
}

function onClick(event){
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  mouseX = event.clientX - rect.left - root.scrollLeft;
  mouseY = event.clientY - rect.top - root.scrollTop ;
  board.clicked(mouseX,mouseY);

}
