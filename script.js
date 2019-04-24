let origBoard;      // доска
let huPlayer = 'O'; // игрок
let aiPlayer = 'X'; // бот
let player1 = 'X'; // игрок1
let player2 = 'O'; // игрок2
let currentPlayer = player1;
let isGameWithAI;
let gameStarted = false;

const winCombos = [ // выигрышные комбинации
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [6, 4, 2],
    [2, 5, 8],
    [1, 4, 7],
    [0, 3, 6]
];

const cells = document.querySelectorAll('.cell');
startGame();

/*выбор символа*/
function selectSym(sym) {
    huPlayer = sym;
    aiPlayer = sym === 'O' ? 'X' : 'O';

    // крестики ходят первыми
    if (aiPlayer === 'X') {
        turn(bestSpot(), aiPlayer);
    }
    // прячем окно для выбора символа
    document.querySelector('.selectSym').style.display = "none";
    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener('click', turnClick, false);
    }
}

function chooseGameType(gameType) {
    isGameWithAI = gameType === 'Игра с компьютером';
    document.querySelector('.selectGameType').style.display = "none";
    if (isGameWithAI) {
        // показываем окно для выбора символа
        document.querySelector('.selectSym').style.display = "block";
    } else {
        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('click', turnClick, false);
        }
    }
}

/*начало игры*/
function startGame() {
    // прячем окно с результатом игры
    document.querySelector('.endgame').style.display = "none";
    document.querySelector('.endgame .text').innerText = "";
    origBoard = Array.from(Array(9).keys());
    // показываем окно для выбора типа игры
    document.querySelector('.selectGameType').style.display = "block";
    // для игры вдвоем
    currentPlayer = player1;
    // очищаем поле от символов и подсветки победной комбинации
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
    }

}

/*обработка хода игрока*/
function turnClick(cell) {
    // проверка что ход на пустую ячейку
    if (typeof origBoard[cell.target.id] === 'number') {
        if (isGameWithAI) {
            turn(cell.target.id, huPlayer);
            if (!checkWin(origBoard, huPlayer) && !checkTie())
                turn(bestSpot(), aiPlayer);
        } else {
            turn(cell.target.id, currentPlayer);
        }

    }
}

/*ход*/
function turn(cellId, player) {
    currentPlayer = player === player1 ? currentPlayer = player2 : currentPlayer = player1;
    // записываем символ игрока в массив
    origBoard[cellId] = player;
    // отображаем символ в ячейке
    document.getElementById(cellId).innerHTML = player;
    // проверка на победу
    let gameWon = checkWin(origBoard, player);
    if (isGameWithAI) {
        if (gameWon) gameOver(gameWon);
        // проверка на ничью
        checkTie();
    } else {
        if (gameWon) {
            gameOver(gameWon);
        } else {
            // проверка на ничью
            checkTie();
        }
    }

}

/*проверка на победу*/
function checkWin(board, player) {
    // получаем список ходов для текущего игрока
    // a - аккумулятор (возвр. значение, нач. инициализация - [])
    // e - элемент (ячейка)
    // i - итератор
    let turns = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null; // победившая комбинация игрока
    // поиск по всем победным комбинациям
    for (let [index, win] of winCombos.entries()) {
        // проверяем каждый элемент победной комбинации с ходами игрока
        if (win.every(e => turns.indexOf(e) > -1)) {
            // запоминаем индекс победной комбинации и игрока
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon; // null or not
}

/*завершение игры*/
function gameOver(gameWon) {
    // снимаем слушатели с ячеек
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    for (let index of winCombos[gameWon.index]) {
        // красим ячейки победной комбинации в синий или красный
        // в зависимости от игрока
        if (isGameWithAI) {
            document.getElementById(index).style.backgroundColor =
                gameWon.player === huPlayer ? "lightblue" : "pink";
        } else {
            document.getElementById(index).style.backgroundColor =
                gameWon.player === player1 ? "lightblue" : "pink";
        }
    }
    //  объявляем победителя
    if (isGameWithAI) {
        declareResult(gameWon.player === huPlayer ? "Вы выиграли!" : "Вы проиграли!");
    } else {
        declareResult(gameWon.player === player1 ? "Победил игрок 1!" : "Победил игрок 2!");
    }
}

/*объявление результата игры*/
function declareResult(result) {
    // показываем окно с результатом игры
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = result;
    gameStarted = false;
}

/*получение пустых клеток*/
function emptyCells() {
    return origBoard.filter((e, i) => i === e);
}

function bestSpot() {
    return minimax(origBoard, aiPlayer).index;
}

/*Проверка на ничью*/
function checkTie() {
    if (emptyCells().length === 0) {
        for (let i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "lightgreen";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareResult("Ничья!");
        return true;
    }
    return false;
}

function minimax(newBoard, player) {
    // доступные клетки
    var availableCells = emptyCells(newBoard);

    if (checkWin(newBoard, huPlayer)) {
        // если побеждает игрок, -10
        return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)) {
        // если побеждает бот, +10
        return {score: 10};
    } else if (availableCells.length === 0) {
        // если больше нет доступных клеток
        return {score: 0};
    }

    var moves = [];
    for (let i = 0; i < availableCells.length; i++) {
        var move = {};
        move.index = newBoard[availableCells[i]];
        newBoard[availableCells[i]] = player;

        if (player === aiPlayer)
            move.score = minimax(newBoard, huPlayer).score;
        else
            move.score = minimax(newBoard, aiPlayer).score;

        newBoard[availableCells[i]] = move.index;
        if ((player === aiPlayer && move.score === 10) || (player === huPlayer && move.score === -10))
            return move;
        else
            moves.push(move);
    }

    let bestMove, bestScore;
    if (player === aiPlayer) {
        bestScore = -1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        bestScore = 1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}