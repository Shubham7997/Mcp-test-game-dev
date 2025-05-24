import React from 'react'
import { Position } from '../types'

interface MazeGridProps {
  maze: boolean[][]
  redBall: Position
  blueBall: Position
  gridSize: number
}

const MazeGrid: React.FC<MazeGridProps> = ({ maze, redBall, blueBall, gridSize }) => {
  return (
    <div 
      className="maze-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '1px',
        background: '#333',
        padding: '2px',
      }}
    >
      {maze.map((row, y) =>
        row.map((isWall, x) => {
          const hasRedBall = redBall.x === x && redBall.y === y
          const hasBlueBall = blueBall.x === x && blueBall.y === y
          const isEscapePoint = x === 0 && y === 0

          return (
            <div
              key={`${x}-${y}`}
              className={`cell ${isWall ? 'wall' : ''} ${
                isEscapePoint ? 'escape-point' : ''
              }`}
            >
              {hasRedBall && <div className="ball red-ball" />}
              {hasBlueBall && <div className="ball blue-ball" />}
            </div>
          )
        })
      )}
    </div>
  )
}

export default MazeGrid
