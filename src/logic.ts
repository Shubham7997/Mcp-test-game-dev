import type { RuneClient } from "rune-sdk"
import type { GameState, MAZE, NPC, Position } from "./types"

const GRID_SIZE = 20 // 15x15 grid for the maze
const PLAYER_SPEED = 1 // How far a player can move in one action
const m1_Npc_possible_dir: string[][] = [
  ["up", "right", "down"],
  ["up", "right", "down"],
  ["left", "right", "down"],
  ["left", "up", "down"],
  ["left", "right", "down"],
  ["left", "up", "right", "down"],
  ["right", "down", "left", "up"],
  ["down", "right", "up", "left"],
  ["right", "left", "down"],
  ["left", "up", "right", "down"],
  ["right", "down", "up"],
  [],
]

const m1: number[][] = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
  [0, 0, 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
  [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0],
  [1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0],
  [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0],
  [1, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
  [0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

const m2: number[][] = [
  [1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
  [0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1],
  [0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1],
  [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 1, 2, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0],
  [0, 0, 2, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 0, 1, 0],
  [1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

const m2_npc_possible_dirs: string[][] = [
  ["up", "right", "down"],
  ["down", "up", "left", "right"],
  ["left", "right", "down", "up"],
  ["down", "left", "right"],
  ["up", "right"],
  ["left", "right"],
  ["down", "left", "right"],
  ["up", "left", "right", "down"],
  [],
]

const mazes_configs: MAZE[] = [
  {
    name: "m1",
    possibleEscapePoints: [
      { x: 0, y: 0 },
      { x: 14, y: 0 },
      { x: 0, y: 12 },
      { x: 17, y: 7 },
      { x: 9, y: 9 },
    ],
    possibleRedPoints: [
      { x: 1, y: 1 },
      { x: 1, y: 7 },
      { x: 10, y: 5 },
    ],
    possibleBluePoints: [
      { x: 18, y: 18 },
      { x: 19, y: 12 },
      { x: 10, y: 19 },
    ],
    mazeMapArray: m1,
    npcPossibleDirs: m1_Npc_possible_dir,
  },
  {
    name: "m2",
    possibleEscapePoints: [
      { x: 11, y: 0 },
      { x: 0, y: 8 },
      { x: 12, y: 6 },
      { x: 19, y: 9 },
      { x: 11, y: 15 },
    ],
    possibleRedPoints: [
      { x: 1, y: 1 },
      { x: 6, y: 5 },
      { x: 18, y: 1 },
    ],
    possibleBluePoints: [
      { x: 18, y: 18 },
      { x: 7, y: 10 },
      { x: 4, y: 14 },
    ],
    mazeMapArray: m2,
    npcPossibleDirs: m2_npc_possible_dirs,
  },
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

function InitializeMaze(): number {
  return Math.floor(Math.random() * mazes_configs.length)
}

function initEscapePoint(index: number): Position {
  return mazes_configs[index].possibleEscapePoints[
    Math.floor(Math.random() * mazes_configs[index].possibleEscapePoints.length)
  ]
}

function initRedPoint(index: number): Position {
  return mazes_configs[index].possibleRedPoints[
    Math.floor(Math.random() * mazes_configs[index].possibleRedPoints.length)
  ]
}

function initBluePoint(index: number): Position {
  return mazes_configs[index].possibleBluePoints[
    Math.floor(Math.random() * mazes_configs[index].possibleBluePoints.length)
  ]
}

// npc positions
function generateNPCs(index: number): NPC[] {
  const resnpcs: NPC[] = []

  for (let i = 0; i < GRID_SIZE + 1; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (mazes_configs[index].mazeMapArray[i][j] == 2) {
        const m = 1 + (Math.floor(Math.random() * 99) % 3)
        const newNpc = {
          name: "unknown",
          pos: { x: j, y: i },
          dialogue: "hello",
          redPassedByDirection: "",
          bluePassedByDirection: "",
          lastContactedRed: false, // last frame contact or not
          lastContactedBlue: false,
          isRedPassed: false,
          isBluePassed: false,
          sayTruth: m === 1,
          sayLie: m === 2,
          sayBluff: m === 3,
        }
        resnpcs.push(newNpc)
      }
    }
  }

  return resnpcs
}

// Generate a simple maze with some random walls
function generateMaze(
  size: number,
  index: number,
  selectedRedPoint: Position,
  selectedBluePoint: Position,
  selectedEscape: Position
): boolean[][] {
  const maze: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false))

  //hardcoded maze1
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (mazes_configs[index].mazeMapArray[y][x] == 1) {
        maze[y][x] = true
      }
    }
  }

  // Ensure start and end positions are clear
  maze[selectedRedPoint.y][selectedRedPoint.x] = false // Red ball start
  maze[selectedBluePoint.y][selectedBluePoint.x] = false // Blue ball start
  maze[selectedEscape.y][selectedEscape.x] = false // Blue ball escape point

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

function getRandomDir(dirs: string[], exclude: string): string {
  const temp: string[] = JSON.parse(JSON.stringify(dirs))
  const temp1 = temp.filter((t) => t !== exclude)
  const res = temp1[Math.floor(Math.random() * temp1.length)]
  return res
}

function getOppositeDir(dir: string, npcId: number, index: number): string {
  return getRandomDir(
    mazes_configs[index].npcPossibleDirs[npcId],
    dir
  ).toUpperCase()
}

function getDialogue(
  npc: NPC,
  redPlayer: boolean,
  bluePlayer: boolean,
  npc_id: number,
  index: number
): string {
  if (redPlayer) {
    if (npc.isBluePassed) {
      if (npc.sayTruth) {
        return (
          "Yes, BLUE passed from here towards " +
          npc.bluePassedByDirection.toUpperCase()
        )
      } else if (npc.sayLie) {
        return (
          "Yes, BLUE passed from here towards " +
          getOppositeDir(npc.bluePassedByDirection, npc_id, index)
        )
      } else if (npc.sayBluff) {
        return (
          "Can't say, but i think BLUE went either towards " +
          getOppositeDir(npc.bluePassedByDirection, npc_id, index) +
          " or " +
          npc.bluePassedByDirection.toUpperCase()
        )
      }
    } else {
      if (npc.sayTruth) {
        return "No, didn't seen anyone passing or may be missed it"
      } else if (npc.sayLie) {
        return (
          "Yes, BLUE passed from here towards " +
          getOppositeDir("", npc_id, index)
        )
      } else if (npc.sayBluff) {
        return (
          "Can't say, but i think BLUE went towards " +
          getOppositeDir("", npc_id, index)
        )
      }
    }
  } else if (bluePlayer) {
    if (npc.isRedPassed) {
      if (npc.sayTruth) {
        return (
          "Yes, RED passed from here towards " +
          npc.redPassedByDirection.toUpperCase()
        )
      } else if (npc.sayLie) {
        return (
          "Yes, RED passed from here towards " +
          getOppositeDir(npc.redPassedByDirection, npc_id, index)
        )
      } else if (npc.sayBluff) {
        return (
          "Can't say, but i think RED went either towards " +
          getOppositeDir(npc.redPassedByDirection, npc_id, index) +
          " or " +
          npc.redPassedByDirection.toUpperCase()
        )
      }
    } else {
      if (npc.sayTruth) {
        return "No, didn't seen anyone passing or may be missed it"
      } else if (npc.sayLie) {
        return (
          "Yes, RED passed from here towards " +
          getOppositeDir("", npc_id, index)
        )
      } else if (npc.sayBluff) {
        return (
          "Can't say, but i think RED went towards " +
          getOppositeDir("", npc_id, index)
        )
      }
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
    const current_maze: number = InitializeMaze()
    const selectedEscape: Position = initEscapePoint(current_maze)
    const selectedRedPoint: Position = initRedPoint(current_maze)
    const selectedBluePoint: Position = initBluePoint(current_maze)
    return {
      redBall: { x: selectedRedPoint.x, y: selectedRedPoint.y },
      blueBall: { x: selectedBluePoint.x, y: selectedBluePoint.y },
      maze: generateMaze(
        GRID_SIZE,
        current_maze,
        selectedRedPoint,
        selectedBluePoint,
        selectedEscape
      ),
      npcs: generateNPCs(current_maze),
      lastNpc: -1,
      redIntelInfo: "",
      blueIntelInfo: "",
      gameOver: false,
      winner: null,
      playerRoles: {
        red: allPlayerIds[0],
        blue: allPlayerIds[1],
      },
      gridSize: GRID_SIZE,
      currentMaze: current_maze,
      escapePoint: selectedEscape,
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
      if (
        game.lastNpc !== -1 &&
        game.npcs[game.lastNpc].lastContactedRed &&
        isRedPlayer
      ) {
        const t = game.lastNpc
        if (newPos.x > game.npcs[t].pos.x) {
          game.npcs[t].redPassedByDirection = "right"
        } else if (newPos.x < game.npcs[t].pos.x) {
          game.npcs[t].redPassedByDirection = "left"
        } else if (newPos.y > game.npcs[t].pos.y) {
          game.npcs[t].redPassedByDirection = "down"
        } else if (newPos.y < game.npcs[t].pos.y) {
          game.npcs[t].redPassedByDirection = "up"
        }
        game.npcs[t].lastContactedRed = false
        game.lastNpc = -1
      }

      if (
        game.lastNpc !== -1 &&
        game.npcs[game.lastNpc].lastContactedBlue &&
        isBluePlayer
      ) {
        const t = game.lastNpc
        if (newPos.x > game.npcs[t].pos.x) {
          game.npcs[t].bluePassedByDirection = "right"
        } else if (newPos.x < game.npcs[t].pos.x) {
          game.npcs[t].bluePassedByDirection = "left"
        } else if (newPos.y > game.npcs[t].pos.y) {
          game.npcs[t].bluePassedByDirection = "down"
        } else if (newPos.y < game.npcs[t].pos.y) {
          game.npcs[t].bluePassedByDirection = "up"
        }
        game.npcs[t].lastContactedBlue = false
        game.lastNpc = -1
      }
      // check npcs
      let rr = ""
      let br = ""
      game.npcs.forEach((npc, index) => {
        if (npc.pos.x === newPos.x && npc.pos.y === newPos.y) {
          game.lastNpc = index
          if (isRedPlayer) {
            npc.isRedPassed = true
            npc.lastContactedRed = true
            rr =
              npc.name +
              " says '" +
              getDialogue(
                npc,
                isRedPlayer,
                isBluePlayer,
                index,
                game.currentMaze
              ) +
              "'"
            game.redIntelInfo = rr
          }
          if (isBluePlayer) {
            npc.isBluePassed = true
            npc.lastContactedBlue = true
            br =
              npc.name +
              " says '" +
              getDialogue(
                npc,
                isRedPlayer,
                isBluePlayer,
                index,
                game.currentMaze
              ) +
              "'"
            game.blueIntelInfo = br
          }
        }
      })

      if (isBluePlayer) {
        game.blueIntelInfo = br
      }
      if (isRedPlayer) {
        game.redIntelInfo = rr
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
