import type { PlayerId, RuneClient } from "rune-sdk"
import type { GameState, MAZE, NPC, Position } from "./types"
import { renderToString } from "react-dom/server"

const GRID_SIZE = 20 // 15x15 grid for the maze
const PLAYER_SPEED = 1 // How far a player can move in one action
const Npc_possible_dir= [
  ["up","right","down"],
  ["up","right","down"],
  ["left","right","down"],
  ["left","up","down"],
  ["left","right","down"],
  ["left","up","right","down"],
  ["right","down","left","up"],
  ["down","right","up","left"],
  ["right","left","down"],
  ["left","up","right","down"],
  ["right","down","up"]
]

const mazes_configs: MAZE[] =[
  {
    name: "m1", 
    possibleEscapePoints: [
      {x:0, y: 0}, {x: 12, y:0}
    ], 
    possibleRedPoints:
    [
      {x: 1,y:1}
    ],
    possibleBluePoints:
    [
      {x: 18, y: 18}
    ],
    mazeMapArray: m1
  }
]

interface MovePayload {
  direction: "up" | "down" | "left" | "right"
}

type GameActions = {
  move: (payload: MovePayload) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const m1 : number[][]=
[
[0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1],
[0,1,0,0,0,0,0,0,1,1,1,1,1,2,0,0,0,0,0,0],
[1,1,0,1,1,1,1,2,0,0,0,0,0,0,0,1,1,0,1,1],
[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1],
[0,0,2,0,0,0,0,0,1,1,1,1,1,0,0,1,1,0,0,0],
[1,1,0,1,1,1,1,0,1,1,0,0,0,0,0,0,0,2,1,1],
[1,1,0,1,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1],
[1,0,0,0,2,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1],
[1,0,1,1,0,1,1,0,0,0,2,0,0,0,1,1,1,0,0,0],
[1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1,1,0],
[1,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1,1,0,1,0],
[1,0,1,1,0,1,1,0,0,0,0,0,0,0,1,1,1,0,1,0],
[0,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,0,0],
[1,0,0,0,2,0,0,0,1,1,0,1,1,0,1,1,1,1,1,1],
[1,0,1,1,0,1,1,0,1,1,0,0,0,2,0,0,2,0,0,0],
[1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0],
[1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0],
[0,2,0,0,0,0,0,2,0,0,0,1,1,0,1,1,0,0,0,0],
[1,0,1,1,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,0],
[1,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,1,1,0],
[1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1]
]


function InitializeMaze(): number{
  return Math.floor(Math.random()*mazes_configs.length)
}

function initEscapePoint(index: number): Position{
  return mazes_configs[index]
  .possibleEscapePoints[
    Math.floor(Math.random() *
    mazes_configs[index].possibleEscapePoints.length)
  ]
}

const current_maze: number = InitializeMaze()


function generateDummyNpc() : NPC {
  var newNpc: NPC = {
    name : "dummy",
    pos : {x: -1, y: -1},
    dialogue : "hello",
    redPassedByDirection: "",
    bluePassedByDirection: "",
    lastContactedRed: false, // last frame contact or not
    lastContactedBlue: false,
    isRedPassed: false,
    isBluePassed : false,
    sayTruth: Math.random()>= .5,
    sayLie: Math.random()>=.5,
    sayBluff: Math.random()>=.5
  }
  return newNpc
}

// npc positions
function generateNPCs() : NPC[]{
  var resnpcs: NPC[] = []

  for (let i=0; i < GRID_SIZE+1; i++){
    for (let j =0; j < GRID_SIZE; j++){
      if (m1[i][j] == 2){
        var newNpc = {
        name : "unknown",
        pos : {x: j, y: i},
        dialogue : "hello",
        redPassedByDirection: "",
        bluePassedByDirection: "",
        lastContactedRed: false, // last frame contact or not
        lastContactedBlue: false,
        isRedPassed: false,
        isBluePassed : false,
        sayTruth: true,
        sayLie: false,
        sayBluff: false
    }
    resnpcs.push(newNpc)
        
      }
    }
  }

  return resnpcs
}

// Generate a simple maze with some random walls
function generateMaze(size: number): boolean[][] {
  const maze: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false))

  //hardcoded maze1
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (m1[y][x] == 1) {
        maze[y][x] = true
      }
    }
  }

 

  // Ensure start and end positions are clear
  maze[1][1] = false // Red ball start
  maze[size - 2][size - 2] = false // Blue ball start
  maze[0][10] = false // Blue ball escape point

  return maze
}

function isValidMove(pos: Position, maze: boolean[][]): boolean {
  return (
    pos.x >= 0 &&
    pos.x < maze[0].length &&
    pos.y >= 0 &&
    pos.y < maze.length &&
    !maze[pos.y][pos.x]
  )
}

function getRandomDir(dirs: string[], exclude: string): string{
  var temp = structuredClone(dirs)
  var temp1 = temp.filter(t=> t!== exclude)
  var res = temp1[Math.floor(Math.random()*temp1.length)]
  return res
}

function getOppositeDir(dir: string, npcId: number): string{
    return getRandomDir(Npc_possible_dir[npcId], dir)
}

function getDialogue(npc: NPC,
    redPlayer: boolean,
    bluePlayer: boolean,
    npc_id: number
  ): string{
  if(redPlayer){
    if(npc.isBluePassed){
      if(npc.sayTruth){
        return "Yes, BLUE passed from here towards " + npc.bluePassedByDirection
      }
      else if (npc.sayLie){
        return "Yes, BLUE passed from here towards " + getOppositeDir(npc.bluePassedByDirection, npc_id)
      }
      else if (npc.sayBluff){
        return "Can't say, but i think either "+ getOppositeDir(npc.bluePassedByDirection, npc_id) + " or " + npc.bluePassedByDirection
      }
    }
    else{
    return "Can't say, if seen anyone passing here"
   }
  }

  else if(bluePlayer){
   if(npc.isRedPassed){
      if(npc.sayTruth){
        return "Yes, RED passed from here towards " + npc.redPassedByDirection
      }
      else if (npc.sayLie){
        return "Yes, RED passed from here towards " + getOppositeDir(npc.redPassedByDirection, npc_id)
      }
      else if (npc.sayBluff){
        return "Can't say, but i think either "+ getOppositeDir(npc.redPassedByDirection, npc_id) + " or " + npc.redPassedByDirection
      }
    }else{
    return "Can't say, if seen anyone passing here"
   }
  }
 return ""
}

function isEscapePoint(pos: Position, escape_pos: Position): boolean {
  return pos.x === escape_pos.x && pos.y === escape_pos.y
}

function getNewPosition(
  pos: Position,
  direction: MovePayload["direction"]
): Position {
  const newPos = { ...pos }
  switch (direction) {
    case "up":
      newPos.y -= PLAYER_SPEED
      break
    case "down":
      newPos.y += PLAYER_SPEED
      break
    case "left":
      newPos.x -= PLAYER_SPEED
      break
    case "right":
      newPos.x += PLAYER_SPEED
      break
  }
  return newPos
}

function isCaught(redPos: Position, bluePos: Position): boolean {
  return redPos.x === bluePos.x && redPos.y === bluePos.y
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds): GameState => {
    // Initialize game state
    return {
      redBall: { x: 1, y: 1 },
      blueBall: { x: GRID_SIZE - 2, y: GRID_SIZE - 2 },
      maze: generateMaze(GRID_SIZE),
      npcs: generateNPCs(),
      lastNpc: -1,
      redIntelInfo : "",
      blueIntelInfo:"",
      gameOver: false,
      winner: null,
      playerRoles: {
        red: allPlayerIds[0],
        blue: allPlayerIds[1],
      },
      gridSize: GRID_SIZE,
      currentMaze : mazes_configs[current_maze],
      escapePoint: initEscapePoint(current_maze)
    }
  },
  actions: {
    move: (payload, { game, playerId }) => {
      // Determine which ball to move based on the player's role
      const isRedPlayer = playerId === game.playerRoles.red
      const isBluePlayer = playerId === game.playerRoles.blue

      if (!isRedPlayer && !isBluePlayer) {
        throw Rune.invalidAction()
      }

      const currentPos = isRedPlayer ? game.redBall : game.blueBall
      const newPos = getNewPosition(currentPos, payload.direction)

      // Check if the move is valid
      if (!isValidMove(newPos, game.maze)) {
        throw Rune.invalidAction()
      }

      // Update position
      if (isRedPlayer) {
        game.redBall = newPos
      } else {
        game.blueBall = newPos
      }

      //check for last npc
    if (game.lastNpc !== -1 && game.npcs[game.lastNpc].lastContactedRed && isRedPlayer){
      var t = game.lastNpc
      if (newPos.x > game.npcs[t].pos.x){
        game.npcs[t].redPassedByDirection = "right"
      }
      else if (newPos.x < game.npcs[t].pos.x){
        game.npcs[t].redPassedByDirection = "left"
      }
      else if (newPos.y > game.npcs[t].pos.y){
        game.npcs[t].redPassedByDirection = "down"
      }
      else if (newPos.y < game.npcs[t].pos.y){
        game.npcs[t].redPassedByDirection = "up"
      }
      game.npcs[t].lastContactedRed = false
      game.lastNpc = -1
    }

    if (game.lastNpc !== -1 && game.npcs[game.lastNpc].lastContactedBlue && isBluePlayer){
     var t = game.lastNpc
      if (newPos.x > game.npcs[t].pos.x){
        game.npcs[t].bluePassedByDirection = "right"
     }
      else if (newPos.x < game.npcs[t].pos.x){
        game.npcs[t].bluePassedByDirection = "left"
     }
       else if (newPos.y > game.npcs[t].pos.y){
        game.npcs[t].bluePassedByDirection = "down"
     }
       else if (newPos.y < game.npcs[t].pos.y){
        game.npcs[t].bluePassedByDirection = "up"
      }
    game.npcs[t].lastContactedBlue = false
    game.lastNpc = -1                                                                                     
    }
      // check npcs
      let rr = ""
      let br = ""
      game.npcs.forEach((npc,index) =>{
        if (npc.pos.x === newPos.x && npc.pos.y === newPos.y){
          game.lastNpc = index
          if (isRedPlayer){
            
            npc.isRedPassed = true
            npc.lastContactedRed = true
            rr = npc.name + " says '" + getDialogue(npc, isRedPlayer, isBluePlayer, index) + "'"
            game.redIntelInfo = rr
          }
          if (isBluePlayer){
            
            npc.isBluePassed = true
            npc.lastContactedBlue = true
            br = npc.name + " says '"+ getDialogue(npc, isRedPlayer, isBluePlayer, index) + "'" 
            game.blueIntelInfo = br
          } 
      }
    })
      
        if (isBluePlayer){game.blueIntelInfo= br}
        if(isRedPlayer){game.redIntelInfo = rr}
      




      // Check win conditions
      if (isCaught(game.redBall, game.blueBall)) {
        game.gameOver = true
        game.winner = game.playerRoles.red
        Rune.gameOver({
          players: {
            [game.playerRoles.red]: "WON",
            [game.playerRoles.blue]: "LOST",
          },
        })
      } else if (isEscapePoint(game.blueBall, game.escapePoint)) {
        game.gameOver = true
        game.winner = game.playerRoles.blue
        Rune.gameOver({
          players: {
            [game.playerRoles.red]: "LOST",
            [game.playerRoles.blue]: "WON",
          },
        })
      }
    },
  },
})
