import Util from '../utils/util';

export class Position {

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static getRandomPosition(maxRange: number) {
        let x = Math.floor(Math.random() * maxRange) - maxRange / 2;
        let y = Math.floor(Math.random() * maxRange) - maxRange / 2;
        return new Position(x, y);
    }

}

export class World {

    public centerX: number = 0;
    public centerY: number = 0;

    public range: number = 40; // in NM

    private game: Phaser.Game;

    constructor(game: Phaser.Game, centerX: number, centerY: number) {
        this.game = game;
        this.centerX = centerX;
        this.centerY = centerY;
    }

    public getPxPerNm() {
        // Range is related to the height of the world
        return this.game.world.height / this.range;
    }

    public convertSpeedToPx(speed: number) {
        return speed * this.getPxPerNm() / 3600;
    }

    public convertSpeedToKts(speed: number) {
        return speed * 3600 / this.getPxPerNm();
    }

    public static angleBetween(start: Position, end: Position): number {
        let theta = Math.atan2(end.y - start.y, end.x - start.x);
        if (theta < 0.0) {
            theta += 2 * Math.PI;
        }
        let angle = 90 + Util.toDegrees(theta);
        return angle < 360 ? angle : angle - 360;
    }

    public static distanceBetween(start: Position, end: Position): number {
        let deltaX = start.x - end.x;
        let deltaY = start.y - end.y;
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    }

    public static getReciprocalAngle(angle: number): number {
        return (angle + 180) % 360;
    }

    public static normaliseAngle(angle: number): number {
        // FIXME doesn't work for negative angles
        angle = angle % 360;
        if (angle < 0) {
            angle = angle + 360;
        }
        return angle;
    }

    // True if the heading points is going towards a given bearing
    public static directionTo(heading: number, bearing: number) {
        let diff = World.normaliseAngle(Math.abs(heading - bearing));
        return  (diff < 90 || diff >= 270);
    }

}

export class Wind {

    public direction: number = 0; // in degrees
    public speed: number = 0; // in knots

    constructor(direction: number, speed: number) {
        this.direction = direction;
        this.speed = speed;
    }

    public setWind(direction: number, speed: number) {
        this.direction = direction;
        this.speed = speed;
    }

}
