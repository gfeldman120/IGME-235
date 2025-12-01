// 0,0 is top left
const width = 100;
const height = 100;
const objects = [];

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

class Test extends GameObject {
    constructor() {
        super("test", 5, 5);
    }
}

let processInput = (input) => {
    let player = objects[0];
    switch (input.keyCode) {
        // W
        case 87:
            player.setPosition(player.x, player.y - 1);
            break;
        // A
        case 65:
            player.setPosition(player.x - 1, player.y);
            break;
        // S
        case 83:
            player.setPosition(player.x, player.y + 1);
            break;
        // D
        case 68:
            player.setPosition(player.x + 1, player.y);
            break;
    }
    updateScreen();
}

let player = new GameObject(width / 2 - 1, height / 2 - 1);
objects.push(player);

document.addEventListener("keydown", function(eventInput) {processInput(eventInput)} );

const createGrid = (width, height) => {
    // not finding grid (error)
    let grid = document.querySelector(`#grid`);
    console.log(grid.innerHTML);
    grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${height}, 1fr)`;
    let innerHTML = "";
    for (let i = 0; i < width * height; i++) {
        innerHTML += `<div class="gridObject"></div>`;
    }
    grid.innerHTML = innerHTML;

    updateScreen();
}

let updateScreen = () => {
    let gridItems = document.querySelectorAll(`.gridObject`);
    for (let i = 0; i < gridItems.length; i++) {
        gridItems[i].style.color = `white`;
    }

    for (let i = 0; i < objects.length; i++) {
        switch (objects.name) {
            case "player":
                gridItems[player.x * width + player.y].style.color = `red`;
                break;
        }
    }
}

createGrid(width, height);