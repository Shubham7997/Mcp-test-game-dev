import type { PlayerId } from "rune-sdk"

export interface Position {
  x: number
  y: number
}

export interface GameState {
  redBall: Position
  blueBall: Position
  maze: boolean[][]
  npcs: NPC[]
  lastNpc: number
  redIntelInfo: string
  blueIntelInfo: string
  gameOver: boolean
  winner: PlayerId | null
  playerRoles: {
    red: PlayerId
    blue: PlayerId
  }
  gridSize: number
  escapePoint: Position
  currentMaze: MAZE
}

export interface NPC {
  name: string
  pos: Position
  redPassedByDirection: string
  bluePassedByDirection: string
  lastContactedRed: boolean
  lastContactedBlue: boolean
  dialogue: string
  isRedPassed: boolean
  isBluePassed: boolean
  sayTruth: boolean
  sayLie: boolean
  sayBluff: boolean // this is bluff or riddle
}

export interface MAZE {
  name: string
  possibleEscapePoints: Position[]
  possibleRedPoints: Position[]
  possibleBluePoints: Position[]
  mazeMapArray: number[][]
  npcPossibleDirs: string[][]
}
