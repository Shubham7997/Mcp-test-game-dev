import { useEffect, useState } from "react"
import type { GameState } from "./logic"

type TeamMate = {
  name: string
  isCulprit: boolean
  isActive: boolean
}

function App() {
  const [game, setGame] = useState<GameState>()
  const [localPlayerId, setLocalPlayerId] = useState<string>()

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setGame(game)
        setLocalPlayerId(yourPlayerId)
      },
    })
  }, [])

  if (!game || !localPlayerId) {
    return (
      <div className="loading">
        <h2>Loading...</h2>
      </div>
    )
  }

  const localPlayer = game.players[localPlayerId]
  const isLocalPlayerTurn = game.playerIds[game.currentPlayerIndex] === localPlayerId
  const playerEvents = game.events[localPlayerId] || []
  const latestEvent = playerEvents[playerEvents.length - 1]

  return (
    <div className="game-container">
      <div className="header">
        <h1>Basketball Team Detective</h1>
      </div>

      <div className="status-bar">
        <div className="player-stats">
          <h3>Your Team Status</h3>
          <p className="attempts">
            Attempts remaining: <span>{localPlayer.remainingAttempts}</span>
          </p>
          <p className="day">
            Day: <span>{game.currentDay}</span>
          </p>
        </div>
        
        <div className="turn-indicator">
          {isLocalPlayerTurn ? (
            <h3 className="your-turn">It's your turn, {localPlayer.displayName}!</h3>
          ) : (
            <h3 className="waiting">
              Waiting for {game.players[game.playerIds[game.currentPlayerIndex]].displayName}...
            </h3>
          )}
        </div>
      </div>

      {!game.gameOver && latestEvent && (
        <div className="event-display">
          <div className="event-header">
            <h2>Day {latestEvent.day}</h2>
          </div>
          <div className="event-content">
            <p>{latestEvent.description}</p>
          </div>
        </div>
      )}

      {isLocalPlayerTurn && !game.gameOver && (
        <div className="action-area">
          <div className="teammates-list">
            <h3>Your Team Members</h3>
            <div className="teammates-status">
              <div className="active-teammates">
                <h4>Active Members:</h4>
                <div className="buttons-grid">
                  {localPlayer.teammates
                    .filter((teammate: TeamMate) => teammate.isActive)
                    .map((teammate: TeamMate) => (
                      <button
                        key={teammate.name}
                        onClick={() => Rune.actions.accuseTeammate(teammate.name)}
                        className="teammate-button"
                      >
                        {teammate.name}
                      </button>
                    ))}
                </div>
              </div>
              
              <div className="inactive-teammates">
                <h4>Left/Injured Members:</h4>
                <div className="inactive-grid">
                  {localPlayer.teammates
                    .filter((teammate: TeamMate) => !teammate.isActive)
                    .map((teammate: TeamMate) => (
                      <div key={teammate.name} className="inactive-teammate">
                        {teammate.name}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => Rune.actions.skipTurn()}
            className="skip-button"
          >
            Need more time
          </button>
        </div>
      )}

      {game.gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <div className="results">
            {Object.entries(game.players).map(([playerId, player]) => (
              <div key={playerId} className={`player-result ${player.hasLost ? 'lost' : 'won'}`}>
                <p>
                  {player.displayName}: <span>{player.hasLost ? 'LOST' : 'WON'}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
