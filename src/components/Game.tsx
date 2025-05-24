import React from 'react'
import { GameState } from '../types'
import { PlayerId } from 'rune-sdk'
import Controls from './Controls'
import MazeGrid from './MazeGrid'

interface GameProps {
  game: GameState
  yourPlayerId: PlayerId | undefined
}

const Game: React.FC<GameProps> = ({ game, yourPlayerId }) => {
  const isRedPlayer = yourPlayerId === game.playerRoles.red
  const isBluePlayer = yourPlayerId === game.playerRoles.blue
  const playerRole = isRedPlayer ? 'Red' : isBluePlayer ? 'Blue' : 'Spectator'

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    Rune.actions.move({ direction })
  }

  return (
    <div className="game-container">
      <div className="game-info">
        <h2>You are: {playerRole} Ball</h2>
        {isBluePlayer && (
          <p className="game-hint">Escape to the top-left corner to win!</p>
        )}
        {isRedPlayer && (
          <p className="game-hint">Catch the blue ball to win!</p>
        )}
      </div>
      
      <MazeGrid
        maze={game.maze}
        redBall={game.redBall}
        blueBall={game.blueBall}
        gridSize={game.gridSize}
      />
      
      {(isRedPlayer || isBluePlayer) && !game.gameOver && (
        <Controls onMove={handleMove} />
      )}
      
      {game.gameOver && (
        <div className="game-over">
          <h2>{game.winner === yourPlayerId ? 'You Won!' : 'You Lost!'}</h2>
        </div>
      )}
    </div>
  )
}

export default Game
