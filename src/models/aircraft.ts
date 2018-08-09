import {Position} from './world';

export class Aircraft {

    private MIN_SPEED = 65;
    private MAX_SPEED = 250;

    // Aircraft parameters
    public position: Position = new Position(0, 0);
    public course: number = 0; // in degrees
    public groundSpeed: number;

    // Aircraft control
    public speed: number = 150; // in knots
    public heading: number = 0; // in degrees

    // Autopilot
    public apHeading: number = 0; // in degrees

    constructor(position?: Position, heading?: number, speed?: number) {
        if (position) {
            this.position = position;
        }
        if (heading) {
            this.heading = heading;
            this.apHeading = heading;
        }
        if (speed) {
            this.speed = speed;
        }
    }

    public setSpeed(speed: number) {
        // TODO (de)accelerate to given speed
        if (speed >= this.MIN_SPEED && speed <= this.MAX_SPEED) {
            this.speed = speed;
        }
    }

    public setApHeading(heading: number) {
        // TODO check for valid values
        this.apHeading = heading;
    }

}