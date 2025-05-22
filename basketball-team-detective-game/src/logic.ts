import type { PlayerId, RuneClient } from "rune-sdk"

type TeamMate = {
  name: string
  isCulprit: boolean
  isActive: boolean
}

type Player = {
  teammates: TeamMate[]
  remainingAttempts: number
  hasLost: boolean
  displayName: string
}

type Event = {
  day: number
  type: 'ditching' | 'injury'
  description: string
  involvedTeammates: string[]
  victimName: string
}

export interface GameState {
  players: Record<PlayerId, Player>
  playerIds: PlayerId[]
  currentPlayerIndex: number
  events: Record<PlayerId, Event[]>
  currentDay: number
  culpritName: string
  coreNames: string[]
  gameOver: boolean
}

type GameActions = {
  accuseTeammate: (teammateName: string) => void
  skipTurn: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const NAMES_POOL = [
  'Mike', 'Jack', 'Cody', 'Claus', 'Ben', 'Tom', 'Alex', 'Sam', 'Chris',
  'David', 'Eric', 'Frank', 'George', 'Henry', 'Ian', 'John', 'Kevin',
  'Luke', 'Mark', 'Nathan', 'Oscar', 'Paul', 'Quinn', 'Ryan', 'Scott'
]

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function selectRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items]
  let currentIndex = shuffled.length
  
  while (currentIndex > 0) {
    const randomIndex = getRandomInt(currentIndex)
    currentIndex--
    ;[shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]]
  }
  
  return shuffled.slice(0, count)
}

function generateTeam(allNames: string[], coreNames: string[], culpritName: string): TeamMate[] {
  // Get 4 random core names, ensuring culprit is included
  const selectedCoreNames = selectRandomItems(
    coreNames.filter(name => name !== culpritName),
    3
  )
  selectedCoreNames.push(culpritName) // Make sure culprit is always in the team
  
  // Get 3 random non-core names
  const nonCoreNames = allNames.filter(name => !coreNames.includes(name))
  const selectedNonCoreNames = selectRandomItems(nonCoreNames, 3)
  
  // Combine all names and shuffle
  const teamNames = selectRandomItems([...selectedCoreNames, ...selectedNonCoreNames], 7)
  
  // Create teammates array with proper flags
  return teamNames.map(name => ({
    name,
    isCulprit: name === culpritName,
    isActive: true
  }))
}

function generateWitnessStatement(witness: TeamMate, victim: TeamMate, eventType: 'ditching' | 'injury'): string {
  const isCulprit = witness.isCulprit
  
  if (eventType === 'ditching') {
    if (isCulprit) {
      const statements = [
        `"${victim.name} seemed very nervous after our conversation,"`,
        `"I was trying to convince ${victim.name} to stay, but they insisted on leaving,"`,
        `"${victim.name} mentioned something about feeling unsafe before leaving,"`
      ]
      return statements[getRandomInt(statements.length)]
    } else {
      const statements = [
        `"I saw ${victim.name} arguing with someone before they left,"`,
        `"${victim.name} was acting strange after talking to another teammate,"`,
        `"I heard ${victim.name} saying they couldn't take it anymore,"`
      ]
      return statements[getRandomInt(statements.length)]
    }
  } else {
    if (isCulprit) {
      const statements = [
        `"The practice got a bit intense, maybe too intense,"`,
        `"I might have pushed them too hard during practice,"`,
        `"These accidents happen when people don't follow my lead,"`
      ]
      return statements[getRandomInt(statements.length)]
    } else {
      const statements = [
        `"Someone was playing very aggressively during practice,"`,
        `"I've never seen such a rough practice session before,"`,
        `"There was definitely something off about that practice session,"`
      ]
      return statements[getRandomInt(statements.length)]
    }
  }
}

function generateEvent(game: GameState, playerId: PlayerId): Event | null {
  const player = game.players[playerId]
  const activeTeammates = player.teammates.filter(t => t.isActive)
  
  if (activeTeammates.length <= 1) return null
  
  const eventType = Math.random() < 0.5 ? 'ditching' : 'injury'
  
  // Select a random victim (who is not the culprit)
  const possibleVictims = activeTeammates.filter(t => !t.isCulprit)
  if (possibleVictims.length === 0) return null
  
  const victim = possibleVictims[getRandomInt(possibleVictims.length)]
  
  // Select 1-2 witnesses (may include culprit)
  const witnesses = selectRandomItems(
    activeTeammates.filter(t => t !== victim),
    1 + getRandomInt(2)
  )
  
  // Mark victim as inactive
  const victimInTeam = player.teammates.find(t => t.name === victim.name)
  if (victimInTeam) {
    victimInTeam.isActive = false
  }
  
  const playerName = game.players[playerId].displayName
  const witnessStatements = witnesses.map(w => `\n${w.name} says: ${generateWitnessStatement(w, victim, eventType)}`).join('')
  
  return {
    day: game.currentDay,
    type: eventType,
    description: eventType === 'ditching'
      ? `${victim.name} from ${playerName}'s team suddenly left after last being seen with ${witnesses.map(w => w.name).join(' and ')}. ${witnessStatements}`
      : `${victim.name} from ${playerName}'s team got injured during practice. ${witnesses.map(w => w.name).join(' and ')} were practicing with them. ${witnessStatements}`,
    involvedTeammates: witnesses.map(w => w.name),
    victimName: victim.name
  }
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 4,
  setup: (allPlayerIds): GameState => {
    // Select 4 core names and the culprit from them
    const selectedCoreNames = selectRandomItems(NAMES_POOL, 4)
    const culpritName = selectedCoreNames[getRandomInt(4)]

    // Initialize players
    const players: Record<PlayerId, Player> = {}
    const events: Record<PlayerId, Event[]> = {}
    
    allPlayerIds.forEach(playerId => {
      const playerInfo = Rune.getPlayerInfo(playerId)
      players[playerId] = {
        teammates: generateTeam(NAMES_POOL, selectedCoreNames, culpritName),
        remainingAttempts: 3,
        hasLost: false,
        displayName: playerInfo?.displayName || `Player ${playerId}`
      }
      
      // Generate initial day 1 event for each player
      const initialEvent = generateEvent({
        players,
        playerIds: allPlayerIds,
        currentPlayerIndex: 0,
        events,
        currentDay: 1,
        culpritName,
        coreNames: selectedCoreNames,
        gameOver: false
      }, playerId)
      
      if (initialEvent) {
        events[playerId] = [initialEvent]
      }
    })

    return {
      players,
      playerIds: allPlayerIds,
      currentPlayerIndex: 0,
      events,
      currentDay: 1,
      culpritName,
      coreNames: selectedCoreNames,
      gameOver: false
    }
  },
  
  actions: {
    accuseTeammate: (teammateName, { game, playerId }) => {
      const player = game.players[playerId]
      
      // Check if it's player's turn
      if (game.playerIds[game.currentPlayerIndex] !== playerId) return
      
      // Check if player still has attempts
      if (player.remainingAttempts <= 0) return
      
      // Check if the accused teammate exists and is active
      const accusedTeammate = player.teammates.find(t => t.name === teammateName && t.isActive)
      if (!accusedTeammate) return
      
      // Handle the accusation
      if (accusedTeammate.isCulprit) {
        // Player won!
        game.gameOver = true
        // Mark all other players as lost
        Object.keys(game.players).forEach(pid => {
          if (pid !== playerId) {
            game.players[pid].hasLost = true
          }
        })
      } else {
        // Wrong accusation
        player.remainingAttempts--
        if (player.remainingAttempts <= 0) {
          player.hasLost = true
        }
        
        // Count players who still have attempts
        const playersWithChances = Object.values(game.players).filter(p => !p.hasLost).length
        
        // If only one player remains with chances, they keep playing
        // If no players have chances left, game is over
        if (playersWithChances === 0) {
          game.gameOver = true
        }
        
        // Find next player who hasn't lost yet
        if (!game.gameOver) {
          let nextPlayerIndex = (game.currentPlayerIndex + 1) % game.playerIds.length
          while (game.players[game.playerIds[nextPlayerIndex]].hasLost) {
            nextPlayerIndex = (nextPlayerIndex + 1) % game.playerIds.length
            // If we've gone full circle and found no valid player, something's wrong
            if (nextPlayerIndex === game.currentPlayerIndex) {
              game.gameOver = true
              break
            }
          }
          game.currentPlayerIndex = nextPlayerIndex
        }
      }
    },
    
    skipTurn: (_params, { game, playerId }) => {
      // Check if it's player's turn
      if (game.playerIds[game.currentPlayerIndex] !== playerId) return
      
      // Clear previous events and generate new unique event for each player
      game.playerIds.forEach(pid => {
        const event = generateEvent(game, pid)
        // Replace old events with just the new one
        if (event) {
          game.events[pid] = [event]
        }
      })
      
      // Move to next player and increment day
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playerIds.length
      if (game.currentPlayerIndex === 0) {
        game.currentDay++
      }
    }
  },
})
