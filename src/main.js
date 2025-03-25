import './style.css'

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

const rows = 30
const cols = 15

// Definición de las piezas del Tetris
const pieces = {
  I: [
    [1, 1, 1, 1] // Línea recta
  ],
  O: [
    [1, 1],
    [1, 1] // Cuadrado
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1] // T
  ],
  L: [
    [1, 0, 0],
    [1, 1, 1] // L
  ],
  J: [
    [0, 0, 1],
    [1, 1, 1] // J
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0] // S
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1] // Z
  ]
}

// Lista de colores posibles
const pieceColors = [
  'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'cyan'
]

let currentPiece = generateRandomPiece() // Generar una pieza aleatoria al principio
let currentColor = generateRandomColor() // Asignar un color aleatorio a la pieza
let currentX = 5 // Posición inicial de la pieza en el eje X
let currentY = 0 // Posición inicial de la pieza en el eje Y
const board = [] // Tablero vacío

// Inicializar el tablero
function initializeBoard () {
  for (let r = 0; r < rows; r++) {
    board[r] = []
    for (let c = 0; c < cols; c++) {
      board[r][c] = 0 // 0 significa que la celda está vacía
    }
  }
}

// Función para generar una pieza aleatoria
function generateRandomPiece () {
  const pieceKeys = Object.keys(pieces)
  const randomIndex = Math.floor(Math.random() * pieceKeys.length)
  return pieceKeys[randomIndex]
}

// Función para generar un color aleatorio
function generateRandomColor () {
  const randomIndex = Math.floor(Math.random() * pieceColors.length)
  return pieceColors[randomIndex]
}

// Función para verificar colisiones
function checkCollision (x, y, shape) {
  const blockSize = canvas.width / cols

  // Revisar cada bloque de la pieza
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col
        const newY = y + row

        // Verificar si la pieza se sale del tablero
        if (newX < 0 || newX >= cols || newY >= rows) {
          return true // Colisión con los bordes
        }

        // Verificar si hay colisión con otras piezas
        if (board[newY][newX] !== 0) {
          return true // Colisión con otra pieza
        }
      }
    }
  }

  return false // No hay colisión
}

// Modificar la función de mover la pieza
function movePiece (event) {
  const shape = pieces[currentPiece] // Obtener la forma de la pieza

  // Intentar mover la pieza
  let newX = currentX
  let newY = currentY

  if (event.key === 'ArrowLeft') {
    newX -= 1 // Mover a la izquierda
  } else if (event.key === 'ArrowRight') {
    newX += 1 // Mover a la derecha
  } else if (event.key === 'ArrowDown') {
    newY += 1 // Mover hacia abajo
  } else if (event.key === 'ArrowUp') {
    rotatePiece() // Rotar la pieza
  }

  // Verificar si hay colisión antes de mover
  if (!checkCollision(newX, newY, shape)) {
    currentX = newX
    currentY = newY
  } else if (event.key === 'ArrowDown') {
    // Si no se puede mover hacia abajo, fijar la pieza
    placePiece(shape)
    currentPiece = generateRandomPiece() // Generar una nueva pieza aleatoria
    currentColor = generateRandomColor() // Asignar un nuevo color aleatorio
    currentX = 5 // Resetear la posición X
    currentY = 0 // Resetear la posición Y
  }

  // Limpiar el fondo y redibujar el tablero
  resizeCanvas()
  drawBoard() // Redibujar el tablero con las piezas fijadas
  drawPiece(currentPiece, currentX, currentY) // Dibujar la pieza en la nueva posición
}

// Función para rotar la pieza
function rotatePiece () {
  const shape = pieces[currentPiece] // Obtener la forma de la pieza
  const rotatedShape = shape[0].map((_, index) => shape.map(row => row[index])).reverse() // Rotar la pieza en sentido horario

  // Verificar colisión después de la rotación
  if (!checkCollision(currentX, currentY, rotatedShape)) {
    // Si no hay colisión, actualizar la pieza rotada
    pieces[currentPiece] = rotatedShape
  } else {
    // Si hay colisión, intentar mover la pieza hacia un lado
    let offsetX = 0
    // Verificar si hay espacio para mover la pieza hacia la izquierda o derecha
    while (checkCollision(currentX + offsetX, currentY, rotatedShape) && offsetX < cols) {
      offsetX++
    }

    // Si no se encuentra solución, no rotar
    if (offsetX < cols) {
      currentX += offsetX
      pieces[currentPiece] = rotatedShape
    }
  }
}

// Modificar la función 'placePiece' para eliminar las líneas completas y mover las piezas
function placePiece (shape) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        // Asignar el color de la pieza al tablero
        board[currentY + row][currentX + col] = currentColor // Asignar el color de la pieza
      }
    }
  }

  // Eliminar las líneas completas y mover las demás piezas hacia abajo
  clearFullLines()

  // Redibujar el tablero después de colocar la pieza
  drawBoard()
}

// Función para eliminar las líneas completas
function clearFullLines () {
  for (let r = 0; r < rows; r++) {
    // Verificar si la fila está completa
    if (board[r].every(cell => cell !== 0)) {
      // Si la fila está completa, la eliminamos y movemos las piezas hacia abajo
      board.splice(r, 1) // Eliminar la fila
      board.unshift(Array(cols).fill(0)) // Insertar una nueva fila vacía en la parte superior
    }
  }
}

// Función para dibujar la cuadrícula
function drawGrid () {
  ctx.strokeStyle = 'gray'
  const blockSize = canvas.width / cols

  for (let i = 0; i <= rows; i++) {
    ctx.beginPath()
    ctx.moveTo(0, i * blockSize)
    ctx.lineTo(cols * blockSize, i * blockSize)
    ctx.stroke()
  }
  for (let j = 0; j <= cols; j++) {
    ctx.beginPath()
    ctx.moveTo(j * blockSize, 0)
    ctx.lineTo(j * blockSize, rows * blockSize)
    ctx.stroke()
  }
}

// Función para dibujar una pieza
function drawPiece (pieceType, x, y) {
  const shape = pieces[pieceType] // Obtener la forma de la pieza
  const blockSize = canvas.width / cols
  const offsetX = x * blockSize
  const offsetY = y * blockSize

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        ctx.fillStyle = currentColor // Usar el color de la pieza
        ctx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize, blockSize)
      }
    }
  }
}

// Modificar la función 'drawBoard' para pintar las piezas con su color correspondiente
function drawBoard () {
  const blockSize = canvas.width / cols
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== 0) { // Si la celda tiene una pieza fijada
        ctx.fillStyle = board[r][c] // Usar el color de la celda en lugar de 'white'
        ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize)
      }
    }
  }
}

// Función para redibujar el canvas
function resizeCanvas () {
  const aspectRatio = cols / rows
  let width = window.innerWidth
  let height = window.innerHeight

  if (width / height > aspectRatio) {
    width = height * aspectRatio
  } else {
    height = width / aspectRatio
  }

  canvas.width = width
  canvas.height = height

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawGrid()
  drawPiece(currentPiece, currentX, currentY)
}

// Inicialización
initializeBoard()

// Ajustar el tamaño al inicio y cuando se redimensione la ventana
window.addEventListener('resize', resizeCanvas)

// Escuchar las teclas presionadas
window.addEventListener('keydown', movePiece)

resizeCanvas()
