import "./styles.css"
import { GameState } from "./types"

const CELL_SIZE = 30 // Size of each grid cell in pixels
const RED_COLOR = "#ff4444"
const BLUE_COLOR = "#4444ff"
const WALL_COLOR = "#333333"
const ESCAPE_COLOR = "#44ff44"

// Canvas and context
let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D

// Touch control state
let touchStartX = 0
let touchStartY = 0
let yourPlayerId: string | undefined

function initCanvas(game: GameState) {
  const size = game.gridSize * CELL_SIZE
  canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  canvas.style.backgroundColor = "#ffffff"
  canvas.style.touchAction = "none" // Prevent scrolling on touch
  ctx = canvas.getContext("2d")!
  
  // Add touch event listeners
  canvas.addEventListener("touchstart", handleTouchStart)
  canvas.addEventListener("touchend", handleTouchEnd)
  
  // Replace the board div with our canvas
  const board = document.getElementById("board")!
  board.innerHTML = ""
  board.appendChild(canvas)
}

function drawMaze(game: GameState) {
  const { maze, gridSize } = game
  
  // Clear canvas
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Draw escape point
  ctx.fillStyle = ESCAPE_COLOR
  ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE)
  
  // Draw walls
  ctx.fillStyle = WALL_COLOR
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (maze[y][x]) {
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }
  }
  
  // Draw players
  const { redBall, blueBall } = game
  
  // Draw red ball
  ctx.fillStyle = RED_COLOR
  ctx.beginPath()
  ctx.arc(
    redBall.x * CELL_SIZE + CELL_SIZE / 2,
    redBall.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  )
  ctx.fill()
  
  // Draw blue ball
  ctx.fillStyle = BLUE_COLOR
  ctx.beginPath()
  ctx.arc(
    blueBall.x * CELL_SIZE + CELL_SIZE / 2,
    blueBall.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  )
  ctx.fill()
}

function handleTouchStart(event: TouchEvent) {
  const touch = event.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  event.preventDefault()
}

function handleTouchEnd(event: TouchEvent) {
  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY
  
  // Determine swipe direction
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (deltaX > 10) {
      Rune.actions.move({ direction: "right" })
    } else if (deltaX < -10) {
      Rune.actions.move({ direction: "left" })
    }
  } else {
    // Vertical swipe
    if (deltaY > 10) {
      Rune.actions.move({ direction: "down" })
    } else if (deltaY < -10) {
      Rune.actions.move({ direction: "up" })
    }
  }
  event.preventDefault()
}

// Update player info display
function updatePlayerInfo(game: GameState, yourPlayerId: string | undefined) {
  const playersSection = document.getElementById("playersSection")!
  playersSection.innerHTML = ""
  
  const roles = [
    { id: game.playerRoles.red, color: RED_COLOR, name: "Red Ball" },
    { id: game.playerRoles.blue, color: BLUE_COLOR, name: "Blue Ball" },
  ]
  
  roles.forEach(({ id, color, name }) => {
    const player = Rune.getPlayerInfo(id)
    const li = document.createElement("li")
    li.style.color = color
    li.innerHTML = `
      <img src="${player.avatarUrl}" style="width: 40px; height: 40px; border-radius: 50%;" />
      <span>${player.displayName} (${name})${id === yourPlayerId ? " (You)" : ""}</span>
    `
    playersSection.appendChild(li)
  })
}

Rune.initClient({
  onChange: ({ game, yourPlayerId: yId, event }) => {
    if (!canvas) {
      initCanvas(game)
    }
    
    yourPlayerId = yId
    drawMaze(game)
    updatePlayerInfo(game, yourPlayerId)
  },
})
