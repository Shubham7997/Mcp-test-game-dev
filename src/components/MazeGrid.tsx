import React from 'react'
import { Position, NPC } from '../types'
import Game from './Game'

interface MazeGridProps {
  maze: boolean[][]
  npcs: NPC[],
  redBall: Position
  blueBall: Position
  gridSize: number,
  viewPort: Position
}

const MazeGrid: React.FC<MazeGridProps> = ({ maze, npcs, redBall, blueBall, gridSize, viewPort
 }) => {
  return ( 
  <div className="maze-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '1px',
        background: '#333',
        padding: '2px',
      }}>
        
      {
      maze.map((row, y) =>
        row.
        map((isWall, x) => {

          const hasRedBall = redBall.x === x && redBall.y === y
          const hasBlueBall = blueBall.x === x && blueBall.y === y
          const isEscapePoint = x === 10 && y === 0
    

         return 7-viewPort.x > x && 
         (y > viewPort.y -3) && y < viewPort.y  +4 &&(
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
