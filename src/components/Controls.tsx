import React from 'react'

interface ControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void
}

const Controls: React.FC<ControlsProps> = ({ onMove }) => {
  return (
    <div className="controls">
      <div className="controls-row">
        <button onClick={() => onMove('up')} className="control-btn">
          ↑
        </button>
      </div>
      <div className="controls-row">
        <button onClick={() => onMove('left')} className="control-btn">
          ←
        </button>
        <button onClick={() => onMove('down')} className="control-btn">
          ↓
        </button>
        <button onClick={() => onMove('right')} className="control-btn">
          →
        </button>
      </div>
    </div>
  )
}

export default Controls
