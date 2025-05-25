import React from 'react'
import { Position, NPC } from '../types'
import Game from './Game'

interface MazeGridProps {
  maze: boolean[][]
  npcs: NPC[],
  redBall: Position
  blueBall: Position
  gridSize: number,
  viewPort: Position,
  escapePoint: Position
}

const MazeGrid: React.FC<MazeGridProps> = ({ maze, npcs, redBall, blueBall, gridSize, viewPort,
  escapePoint
 }) => {
  return ( 
  <div className="maze-grid"
      style={{
        gridTemplateColumns: `repeat(5, 1fr)`,
        gap: '1px',
        background: '#333',
        padding: '2px',
      }}>
        
      {
      maze.map((row, y) =>
        row
        .map((isWall, x) => {

          const hasRedBall = redBall.x === x && redBall.y === y
          const hasBlueBall = blueBall.x === x && blueBall.y === y
          const isEscapePoint = x === escapePoint.x && y === escapePoint.y
    

         return  (
          (viewPort.y < 2 && y < 5) 
       ||  (viewPort.y >= 17 && y >= 15 && y < 20)
      || (y >= viewPort.y - 2 && y <= viewPort.y + 2)
        )
         && (
          (viewPort.x < 2 && x < 5)
          || (viewPort.x >=17 && x >=15 && x < 20)
          ||(x >= viewPort.x -2 && x <= viewPort.x +2)
         )

         && (
            <div
              key={`${x}-${y}`}
              className={`cell ${isWall ? 'wall' : ''} ${
                isEscapePoint ? 'escape-point' : ''
              }`}
            >
              {hasRedBall && <div className="ball red-ball" />}
              {hasBlueBall && <div className="ball blue-ball" />}
              {npcs.map((npc, index)=> {
                if (npc.pos.x === x && npc.pos.y === y) {
                return <div className="ball orange-ball"/>}
                else {
                  return null
                }
              })}
            </div>
          )
        })
      )}
    </div>
  )
}

export default MazeGrid
