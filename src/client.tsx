import React from 'react'
import ReactDOM from 'react-dom/client'
import Game from './components/Game'
import './styles.css'

Rune.initClient({
  onChange: ({ game, yourPlayerId }) => {
    const root = document.getElementById('root')
    if (root) {
      ReactDOM.createRoot(root).render(
        <React.StrictMode>
          <Game game={game} yourPlayerId={yourPlayerId} />
        </React.StrictMode>
      )
    }
  },
})
