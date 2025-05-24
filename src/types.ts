import type { PlayerId } from "rune-sdk"

export interface Position {
  x: number
  y: number
}

export interface GameState {
  redBall: Position
  blueBall: Position
  maze: boolean[][]
  gameOver: boolean
  winner: PlayerId | null
  playerRoles: {
    red: PlayerId
    blue: PlayerId
  }
  gridSize: number
}
