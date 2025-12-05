// Screen size values required
import { "width" as width }  from './script.js';
import { "height" as height } from './script.js';

// GameObject class
export default class GameObject {
    // Fields
    name;
    x;
    y;
    
    // Constructor
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
    }

    // Modify inputs to allow for screen wrapping, then set position
    setPosition(x, y) {
        let position = GameObject.getPosition(x, y);
        this.x = position.x;
        this.y = position.y;
    }

    // Create a position object that accounts for screen wrapping
    static getPosition(x, y) {
        while (x < 0) {
            x += width;
        }
        while (x >= width) {
            x -= width;
        }
        while (y < 0) {
            y += height;
        }
        while (y >= height) {
            y -= height;
        }
        let position = {
            x: x,
            y: y
        };
        return position;
    }
}