import type { PlayerId, RuneClient } from "rune-sdk"
import type { GameState, NPC, Position } from "./types"

const GRID_SIZE = 20 // 15x15 grid for the maze
const PLAYER_SPEED = 1 // How far a player can move in one action
const MAX_NPCS = 10

interface MovePayload {
  direction: "up" | "down" | "left" | "right"
}

type GameActions = {
  move: (payload: MovePayload) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const m1 =
[[0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1],
[0,1,0,0,0,0,0,0,1,1,1,1,1,2,0,0,0,0,0,0],
[1,1,0,1,1,1,1,2,0,0,0,0,0,0,0,1,1,0,1,1],
[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1],
[0,0,2,0,0,0,0,0,1,1,1,1,1,0,0,1,1,0,0,0],
[1,1,0,1,1,1,1,null,1,1,0,0,0,0,0,0,0,2,1,1],
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
[0,0,0,0,0,0,0,2,0,0,0,1,1,0,1,1,0,0,0,0],
[1,0,1,1,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,0],
[1,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,1,1,0]]

// npc positions
function generateNPCs() : NPC[]{
  var resnpcs: NPC[] = []

  for (let i=0; i < GRID_SIZE; i++){
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

  // Add some random walls (30% chance of wall)
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
  maze[0][0] = false // Blue ball escape point

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

function isEscapePoint(pos: Position): boolean {
  return pos.x === 0 && pos.y === 0
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
      intelInfo : "",
      gameOver: false,
      winner: null,
      playerRoles: {
        red: allPlayerIds[0],
        blue: allPlayerIds[1],
      },
      gridSize: GRID_SIZE,
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

      // check npcs
      var r = ""
      game.npcs.forEach((npc) =>{
        if (npc.pos.x === newPos.x && npc.pos.y === newPos.y){
          game.lastNpc = npc
          if (isRedPlayer){
            npc.isRedPassed = true
            npc.lastContactedRed = true
            if (npc.isBluePassed){
              if (npc.sayTruth){

              }
              if(npc.sayLie){

              }
              if (npc.sayBluff){

              }
            }
            r = npc.name + " says '"+ npc.dialogue  +"'"
          } 
          if (isBluePlayer){
            npc.isBluePassed = true
            npc.lastContactedBlue = true
            if (npc.isRedPassed){
              if (npc.sayTruth){

              }
              if (npc.sayLie){

              }
              else if (npc.sayBluff){

              }
              r = npc.name + " says '"+ npc.dialogue + "'"
            }
          }
        }
        else{
          game.intelInfo = r
        }
      }
    )

    if (game.lastNpc.lastContactedRed && isRedPlayer){
      if (newPos.x > game.lastNpc.pos.x){
        game.lastNpc.redPassedByDirection = "right"
      }
      else if (newPos.x < game.lastNpc.pos.x){
        game.lastNpc.redPassedByDirection = "left"
      }
      else if (newPos.y > game.lastNpc.pos.y){
        game.lastNpc.redPassedByDirection = "down"
      }
      else if (newPos.y < game.lastNpc.pos.y){
        game.lastNpc.redPassedByDirection = "up"
      }
      lastNpc.lastContactedRed = false
    }

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
      } else if (isEscapePoint(game.blueBall)) {
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
