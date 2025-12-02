// TO DO
// - Styling
// - Better diagonal collision
// - Documentation

// 0,0 is top left, both width and height must be even
const width = 50;
const height = 50;
const baseTimer = 21;
const scoreTimeIncrease = 7;
const obstacleCount = (width * height) / 4;

const objects = [];
const keysPressed = [];
let screenInterval;
let timerInterval;
let timerItem = document.querySelector("#timer");
let timer;
let scoreItem = document.querySelector("#score");
let score;
let highScoreItem = document.querySelector("#highScore");
let highScore;

window.onload = function() {
    timerItem.innerHTML = `##`;
    scoreItem.innerHTML = `##`;
    highScore = localStorage.getItem("highScore");
    if (highScore > 1)
    {
        highScoreItem.innerHTML = `${highScore}`;
    }
    else
    {
        highScoreItem.innerHTML = `0`;
        highScore = 0;
    }
}

class GameObject {
    name;
    x;
    y;
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
    }

    // Modify inputs to allow for screen wrapping, then set position
    setPosition(x, y) {
        if (x < 0) {
            x += width;
        }
        else if (x >= width) {
            x -= width;
        }
        if (y < 0) {
            y += height;
        }
        else if (y >= height) {
            y -= height;
        }
        this.x = x;
        this.y = y;
    }

    static getEmpty(x, y) {
        return new GameObject("empty", x, y);
    }
}

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

let keyPressed = (input) => {
    if (keysPressed.length > 4)
    {
        keysPressed.splice(0, keysPressed.length);
    }
    if (!input.repeat)
    {
        keysPressed.push(input.key);
    }
}

let keyReleased = (input) => {
    for (let i = 0; i < keysPressed.length; i++)
    {
        if (keysPressed[i] == input.key)
        {
            keysPressed.splice(i, 1);
        }
    }
}

let timerUpdate = () => {
    timer -= 1;
    if (timer <= 0)
    {
        clearInterval(screenInterval);
        clearInterval(timerInterval);
    }
    timerItem.innerHTML = `${timer}`;
}

let updateScreen = () => {
    // Moving player
    let xMovement = 0;
    let yMovement = 0;
    for (let i = 0; i < keysPressed.length; i++)
    {
        switch (keysPressed[i])
        {
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
    let player = objects[0];
    // Object collision
    if (player != undefined)
    {
        for (let i = 1; i < objects.length; i++)
        {
            let object = objects[i];
            switch (object.name)
            {
                case "obstacle":
                    if (player.x + xMovement == object.x && player.y + yMovement == object.y)
                    {
                        xMovement = 0;
                        yMovement = 0;
                    }
                    break;
                case "goal":
                    if (player.x + xMovement == object.x && player.y + yMovement == object.y)
                    {
                        placeObjects();
                        score++;
                        scoreItem.innerHTML = `${score}`;
                        if (score > highScore)
                        {
                            highScore = score;
                            localStorage.setItem("highScore", highScore);
                            highScoreItem.innerHTML = `${highScore}`;
                        }
                        timer += scoreTimeIncrease + 1;
                        timerUpdate();
                    }
                    break;
            }
        }
        player.setPosition(player.x + xMovement, player.y + yMovement);
    }

    let grid = document.querySelector(`#grid`);
    let gridItems = document.querySelectorAll(`.gridObject`);
    for (let i = 0; i < gridItems.length; i++) {
        let item = gridItems[i];
        item.style.backgroundColor = `white`;
        item.style.minWidth = `${grid.style.width / width}px`;
        item.style.minHeight = `${grid.style.height / height}px`;
    }

    for (let i = 0; i < objects.length; i++) {
        let item = gridItems[objects[i].y * height + objects[i].x];
        switch (objects[i].name) {
            case "player":
                // If using images, this is where you set the image of the player grid item to whatever
                // item.innerHTML = `<img src="src/pixel.jpg" alt="A pixel.">`;
                // let image = item.querySelector("img");
                // image.style.width = `100%`;
                // image.style.height = `100%`;
                item.style.backgroundColor = "green";
                break;
            case "obstacle":
                item.style.backgroundColor = "red";
                break;
            case "goal":
                item.style.backgroundColor = "blue";
                break;
        }
    }
}

let makeObjects = (name, howMany) => {
    let newX;
    let newY;
    for (let i = 0; i < howMany; i)
    {
        console.log(i);
        newX = Math.floor(Math.random() * width);
        newY = Math.floor(Math.random() * height);
        if (objects.length == 1)
        {
            if (newX != objects[0].x && newY != objects[0].y)
            {
                objects.push(new GameObject(name, newX, newY));
                i++;
            }
        }
        else if (newX != objects[0].x && newY != objects[0].y && newX != objects[1].x && newY != objects[1].y)
        {
            objects.push(new GameObject(name, newX, newY));
            i++;
        }
    }
}

let placeObjects = () => {
    objects.splice(1, objects.length - 1);
    makeObjects("goal", 1);
    makeObjects("obstacle", obstacleCount);
}

let start = () => {
    clearInterval(screenInterval);
    clearInterval(timerInterval);
    createGrid(width, height);
    if (objects.length > 0)
    {
        objects.splice(0, objects.length);
    }
    let player = new GameObject("player", width / 2 - 1, height / 2 - 1);
    objects.push(player);
    
    placeObjects();

    timer = baseTimer;
    timerItem.innerHTML = `${timer}`;
    score = 0;
    scoreItem.innerHTML = `${score}`;
    screenInterval = setInterval(updateScreen, 50);
    timerInterval = setInterval(timerUpdate, 1000);
}

document.addEventListener("keydown", function(eventInput) { keyPressed(eventInput) });
document.addEventListener("keyup", function(eventInput) { keyReleased(eventInput) });
let startButton = document.querySelector("#start");
startButton.addEventListener("click", function() { start() });