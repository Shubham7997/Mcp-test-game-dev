import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_IMG_SRC_TYPES } from "react"
import type { PlayerId } from "rune-sdk"

export interface Position {
  x: number
  y: number
}

export interface GameState {
  redBall: Position
  blueBall: Position
  maze: boolean[][],
  npcs: NPC[],
  lastNpc: number,
  intelInfo: string,
  gameOver: boolean
  winner: PlayerId | null
  playerRoles: {
    red: PlayerId
    blue: PlayerId
  }
  gridSize: number
}

export interface NPC {
  name: string,
  pos: Position,
  redPassedByDirection: string,
  bluePassedByDirection: string,
  lastContactedRed: boolean,
  lastContactedBlue: boolean,
  dialogue : string,
  isRedPassed: boolean,
  isBluePassed: boolean,
  sayTruth: boolean,
  sayLie: boolean,
  sayBluff: boolean // this is bluff or riddle  
}
