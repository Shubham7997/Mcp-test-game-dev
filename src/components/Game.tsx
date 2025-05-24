import React, { isValidElement } from 'react'
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
        <h4>You are: {playerRole} Ball</h4>
        {isBluePlayer && (<div>
          <p className="game-hint">Find the ESCAPE to win!</p>
          <p className='intel-box'>{game.blueIntelInfo}</p></div>
        )}
        {isRedPlayer && (
          <div>
          <p className="game-hint">Catch the BLUE to win!</p>
          <p className='intel-box'>{game.redIntelInfo}</p>
          </div>
        )}
        
      </div>
      
      {isRedPlayer && (
      <MazeGrid
        maze={game.maze}
        redBall={game.redBall}
        blueBall={game.blueBall}
        gridSize={game.gridSize}
        npcs={game.npcs}
        viewPort={game.redBall}
      />)}

      {isBluePlayer && (
        <MazeGrid
                maze={game.maze}
                        redBall={game.redBall}
                                blueBall={game.blueBall}
                                        gridSize={game.gridSize}
                                                npcs={game.npcs}
                                                viewPort={game.blueBall}
                                                      />
      )}
      
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
