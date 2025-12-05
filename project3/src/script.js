// Importing GameObject class
import GameObject from './GameObject.js';

// Audio files
const gameStartSFX = new Audio(`src/gameStart.wav`);
const timeLowSFX = new Audio(`src/timeLow.wav`);
const timeOutSFX = new Audio(`src/timeOut.wav`);
const collectSFX = new Audio(`src/collect.wav`);
const beatHighScoreSFX = new Audio(`src/beatHighScore.wav`);

// Variables that change the game
export const width = 50;
export const height = 50;
const baseTimer = 20;
const scoreTimeIncrease = 3;
const obstacleCount = (width * height) / 10;
const screenTimer = 50;
const trailTimer = 500;
export default { width, height };

// Important information
const objects = [];
const keysPressed = [];
let screenInterval;
let timerInterval;
let timerItem = document.querySelector("#timer");
let timer = 0;
let scoreItem = document.querySelector("#score");
let score = 0;
let highScoreItem = document.querySelector("#highScore");
let highScore = 0;
let highScoreForThisRun = 0;
let updateGradients = false;
const gradients = [];

// Setting default text and high score text
window.onload = function () {
    timerItem.innerHTML = `##`;
    scoreItem.innerHTML = `##`;
    highScore = localStorage.getItem("highScore");
    if (highScore > 1) {
        highScoreItem.innerHTML = `${highScore}`;
    }
    else {
        highScoreItem.innerHTML = `0`;
        highScore = 0;
    }
    // Add key pressed events to the entire page, as well as an event for clicking the start button
    document.addEventListener("keydown", function (eventInput) { keyPressed(eventInput) });
    document.addEventListener("keyup", function (eventInput) { keyReleased(eventInput) });
    let startButton = document.querySelector("#start");
    startButton.addEventListener("click", function () { start() });
}

// Check to see if 2 positions overlap
let areSamePosition = (position1, position2) => {
    return (position1.x == position2.x && position1.y == position2.y);
}

// Create a grid of HTML elements based on the width and height constants, then update the screen
const createGrid = (width, height) => {
    let grid = document.querySelector(`#grid`);
    grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${height}, 1fr)`;
    let innerHTML = "";
    for (let i = 0; i < width * height; i++) {
        innerHTML += `<div class="gridObject"></div>`;
    }
    grid.innerHTML = innerHTML;
    updateScreen();
}

// If a WASD key is pressed, add it to the inputs array (or trim the array if something is wrong)
// Reset the movement/update screen interval to be after 1st key press
let keyPressed = (input) => {
    if (keysPressed.length > 4) {
        keysPressed.splice(0, keysPressed.length);
    }
    if (!input.repeat) {
        keysPressed.push(input.key);
        if (keysPressed.length == 1 && timer > 0) {
            clearInterval(screenInterval);
            screenInterval = setInterval(updateScreen, screenTimer);
            updateScreen();
        }
    }
}

// Remove the pressed key if it exists and, if no keys are pressed afterwards, stop updating movement/the screen
let keyReleased = (input) => {
    for (let i = 0; i < keysPressed.length; i++) {
        if (keysPressed[i] == input.key) {
            keysPressed.splice(i, 1);
        }
    }
    if (keysPressed.length == 0) {
        clearInterval(screenInterval);
    }
}

// Subtract a second from the timer and stop the game if the timer hits 0
let timerUpdate = () => {
    timer -= 1;
    if (timer <= 0) {
        timeOutSFX.play();
        clearInterval(screenInterval);
        clearInterval(timerInterval);
        let gridItems = document.querySelectorAll(`.gridObject`);
        for (let i = 0; i < gridItems.length; i++) {
            gridItems[i].style.transition = `background-color 1000ms`;
            gridItems[i].style.backgroundColor = `rgb(200, 200, 200)`;
        }
    }
    else if (timer <= 5) {
        timeLowSFX.play();
    }
    timerItem.innerHTML = `${timer}`;
}

// Handle player movement and update the screen
let updateScreen = () => {
    // Use pressed keys to figure out where the player wants to go
    let xMovement = 0;
    let yMovement = 0;
    for (let i = 0; i < keysPressed.length; i++) {
        switch (keysPressed[i]) {
            // W
            case `w`:
                yMovement -= 1;
                break;
            // A
            case `a`:
                xMovement -= 1;
                break;
            // S
            case `s`:
                yMovement += 1;
                break;
            // D
            case `d`:
                xMovement += 1;
                break;
        }
    }
    // Save a reference to the player and see where the player might be going
    let player = objects[0];
    let oldPlayerPosition;
    if (player != undefined && keysPressed.length > 0) {
        oldPlayerPosition = GameObject.getPosition(player.x, player.y);
        let futureHorizontal = GameObject.getPosition(player.x + xMovement, player.y);
        let futureVertical = GameObject.getPosition(player.x, player.y + yMovement);
        let futureBoth = GameObject.getPosition(player.x + xMovement, player.y + yMovement);
        let xChange = xMovement;
        let yChange = yMovement;
        let sameHorizontal = false;
        let sameVertical = false;
        let sameBoth = false;
        let goalPosition;
        // See if any objects in play overlap with the player's potential future positions
        for (let i = 1; i < objects.length; i++) {
            let object = objects[i];
            switch (object.name) {
                case "obstacle":
                    let obstaclePosition = GameObject.getPosition(object.x, object.y);
                    if (areSamePosition(futureHorizontal, obstaclePosition)) {
                        sameHorizontal = true;
                    }
                    if (areSamePosition(futureVertical, obstaclePosition)) {
                        sameVertical = true;
                    }
                    if (areSamePosition(futureBoth, obstaclePosition)) {
                        sameBoth = true;
                    }

                    break;
                case "goal":
                    goalPosition = GameObject.getPosition(object.x, object.y);
                    break;
            }
        }
        // Use overlap information to determine if the player cannot go in a given direction and update movement accordingly
        if ((yMovement == 0 && xMovement != 0 && sameHorizontal) || (yMovement != 0 && xMovement != 0 && ((sameBoth && sameHorizontal) || (sameVertical && sameHorizontal) || (sameBoth && !sameVertical && !sameHorizontal)))) {
            xChange = 0;
        }
        if ((yMovement != 0 && xMovement == 0 && sameVertical) || (yMovement != 0 && xMovement != 0 && ((sameBoth && sameVertical) || (sameVertical && sameHorizontal) || (sameBoth && !sameVertical && !sameHorizontal)))) {
            yChange = 0;
        }
        xMovement = xChange;
        yMovement = yChange;
        player.setPosition(player.x + xMovement, player.y + yMovement);
        // After moving, if the player is on the goal object, increment the score and reset obstacles
        if (areSamePosition(goalPosition, GameObject.getPosition(player.x, player.y))) {
            updateGradients = true;
            placeObjects();
            score++;
            scoreItem.innerHTML = `${score}`;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
                highScoreItem.innerHTML = `${highScore}`;
            }
            if (score == highScoreForThisRun + 1 && highScoreForThisRun > 0) {
                beatHighScoreSFX.play();
            }
            else {
                collectSFX.play();
            }
            timer += scoreTimeIncrease + 1;
            timerUpdate();
        }
    }
    // Get the HTML grid and set colors to match the objects array
    let grid = document.querySelector(`#grid`);
    let gridItems = document.querySelectorAll(`.gridObject`);
    for (let i = 0; i < gridItems.length; i++) {
        let item = gridItems[i];
        let itemPosition = GameObject.getPosition(Math.floor(i % width), Math.floor(i / width));
        // If this position was the player's last position, make it fade from green to white, creating the effect of a trail behind the player
        if (oldPlayerPosition != undefined && player != undefined) {
            if (areSamePosition(oldPlayerPosition, itemPosition)) {
                item.style.backgroundColor = `green`;
                item.style.transition = `background-color ${trailTimer}ms`;
                item.style.backgroundColor = `white`;
                disableTransition(item);
            }
            else {
                item.style.backgroundColor = `white`;
            }
        }
        // If the player runs into a position that is part of the trail, reset it immediately
        else if (player != undefined) {
            if (areSamePosition(GameObject.getPosition(player.x, player.y), itemPosition)) {
                item.style.transition = `background-color 0ms`;
            }
            else {
                item.style.backgroundColor = `white`;
            }
        }
        else {
            item.style.backgroundColor = `white`;
        }
        item.style.backgroundImage = `none`;
        // Ensure grid items don't squish themselves
        item.style.minWidth = `${grid.style.width / width}px`;
        item.style.minHeight = `${grid.style.height / height}px`;
    }
    // Gradients should only be created on game start and goal hit: This ensures that they aren't done every screen update
    if (updateGradients) {
        gradients.slice(0, gradients.length);
    }
    // Update visuals on the screen for each position
    for (let i = 0; i < objects.length; i++) {
        let item = gridItems[objects[i].y * height + objects[i].x];
        switch (objects[i].name) {
            case "player":
                item.style.backgroundColor = "green";
                break;
            case "obstacle":
                if (updateGradients) {
                    gradients.push(`linear-gradient(${Math.floor(Math.random() * 360)}deg, red, rgb(150,0,0))`);
                }
                item.style.backgroundImage = gradients[i - 1];
                break;
            case "goal":
                if (updateGradients) {
                    gradients.push(`linear-gradient(${Math.floor(Math.random() * 360)}deg, blue, rgb(0,0,100))`);
                }
                item.style.backgroundImage = gradients[i - 1];
                break;
        }
    }
    if (updateGradients) {
        updateGradients = false;
    }
}

// Once an item is done transitioning, make it stop to allow for consistent behavior later
let disableTransition = (item) => {
    let savedItem = item;
    setInterval(function () { savedItem.style.transition = `background-color 0ms` }, 500);
}

// Make objects with a given name and quantity
let makeObjects = (name, howMany) => {
    let newX;
    let newY;
    for (let i = 0; i < howMany; i) {
        newX = Math.floor(Math.random() * width);
        newY = Math.floor(Math.random() * height);
        // If only the player exists, put the goal somewhere that isn't the player
        if (objects.length == 1) {
            if (newX != objects[0].x && newY != objects[0].y) {
                objects.push(new GameObject(name, newX, newY));
                i++;
            }
        }
        // Ensure this isn't the player or goal
        else if (newX != objects[0].x && newY != objects[0].y && newX != objects[1].x && newY != objects[1].y) {
            objects.push(new GameObject(name, newX, newY));
            i++;
        }
    }
}

// Get rid of all objects, except for the player, and make new ones
let placeObjects = () => {
    objects.splice(1, objects.length - 1);
    makeObjects("goal", 1);
    makeObjects("obstacle", obstacleCount);
}

// When the start button is pressed, ready the game
let start = () => {
    gameStartSFX.play();
    highScoreForThisRun = Math.floor(highScore);
    clearInterval(screenInterval);
    clearInterval(timerInterval);
    createGrid(width, height);
    // Make the player object - this only happens when the game starts
    let player = new GameObject("player", width / 2 - 1, height / 2 - 1);
    objects.push(player);
    placeObjects();
    // Setup the timer and corresponding HTML elements
    timer = baseTimer;
    timerItem.innerHTML = `${timer}`;
    score = 0;
    scoreItem.innerHTML = `${score}`;
    updateGradients = true;
    updateScreen();
    timerInterval = setInterval(timerUpdate, 1000);
}