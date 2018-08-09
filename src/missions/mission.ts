import {Position, World} from '../models/world';
import {Beacon, NdbBeacon} from '../models/beacon';
import {Aircraft} from '../models/aircraft';
import Util from '../utils/util';

class Exercise {

    public type: number;
    public radial: number;
    public to: boolean;

    private static maxAngleDelta = 30;
    private static minAngleDivision = 10;
    private static minDistanceToBeacon = 2;
    private static maxDistanceToBeacon = 6;

    private static toleranceInDegrees = 2;
    private static toleranceInSeconds = 15;

    // Generate a new NDB radial exercise
    public static generateExercise(aircraft: Aircraft, beacon: Beacon): Exercise {
        let exercise = new Exercise();

        // Calculate current aircraft position in relation to the beacon
        let distance = World.distanceBetween(aircraft.position, beacon.position);
        let bearing = World.angleBetween(aircraft.position, beacon.position);
        bearing = Math.floor(bearing / 10) * 10;

        // Check if the aircraft is flying to or from the beacon
        let directionTo = World.directionTo(aircraft.heading, bearing);

        // Calculate a new radial based on the current radial, maximum angle delta and minimum angle division
        let random = Math.floor(Math.random() * (Exercise.maxAngleDelta / Exercise.minAngleDivision) + 1);
        let newAngle = Math.random() < 0.5 ? bearing - random * Exercise.minAngleDivision : bearing + random * Exercise.minAngleDivision;
        newAngle = World.normaliseAngle(newAngle);

        // Decide if it's TO/FROM based on the current aircraft direction and distance to beacon
        // TODO we could also use the last exercise in the heuristic
        // Far away from beacon
        if (distance > Exercise.maxDistanceToBeacon) {
            exercise.to = true;
            exercise.radial = newAngle;
        }
        // Medium distance from beacon
        else if (distance <= Exercise.maxDistanceToBeacon && distance >= Exercise.minDistanceToBeacon) {
            if (directionTo) {
                exercise.to = true;
                exercise.radial = newAngle;
            } else {
                exercise.to = false;
                exercise.radial = World.getReciprocalAngle(newAngle);
            }
        }
        // Near beacon
        else {
            exercise.to = false;
            if (directionTo) {
                exercise.radial = newAngle;
            } else {
                exercise.radial = World.getReciprocalAngle(newAngle);
            }
        }

        return exercise;
    }

    // Checks if aircraft direction/radial respects exercise parameters
    public checkExercise(game: Phaser.Game, aircraft: Aircraft, beacon: Beacon, callback: Function) {
        // Check every second the aircraft position
        let seconds = 0;
        let timer = game.time.events.loop(Phaser.Timer.SECOND, () => {
            let bearing = World.angleBetween(aircraft.position, beacon.position);
            let directionTo = World.directionTo(aircraft.course, bearing);
            let diff = World.normaliseAngle(Math.abs(this.radial - bearing));
            if (this.to === directionTo && diff < Exercise.toleranceInDegrees) {
                seconds++;
                if (seconds > Exercise.toleranceInSeconds) {
                    game.time.events.remove(timer);
                    callback();
                }
            } else {
                // If not on track, reset timer
                seconds = 0;
            }
        }, this);
    }

    toString(): string {
        return `BRG ${Util.toFixedDigits(this.radial, 3)} ${this.to ? 'TO' : 'FR'}`;
    }

}

export class Mission {

    private static timeToNextExercise = 5;

    private game: Phaser.Game;
    private aircraft: Aircraft;
    private beacon: Beacon;
    private exerciseSuccess: Function;
    private exerciseFail: Function;
    private exerciseChange: Function;

    private exerciseTimer: Phaser.TimerEvent;

    public currentExercise: Exercise;

    constructor(game: Phaser.Game, aircraft: Aircraft, beacon: Beacon) {
        this.game = game;
        this.aircraft = aircraft;
        this.beacon = beacon;
    }

    // Generates a new exercise based on the aircraft and beacon positions
    public nextExercise() {
        if (this.exerciseTimer) {
            this.game.time.events.remove(this.exerciseTimer);
        }
        this.generateExercise();
        this.executeExercise(this.exerciseSuccess, this.exerciseFail, this.exerciseChange);
        this.exerciseChange();
    }

    private generateExercise() {
        this.currentExercise = Exercise.generateExercise(this.aircraft, this.beacon);
    }

    private executeExercise(exerciseSuccess: Function, exerciseFail: Function, exerciseChange: Function) {
        this.currentExercise.checkExercise(this.game, this.aircraft, this.beacon, () => {
            exerciseSuccess();
            this.exerciseTimer = this.game.time.events.add(Phaser.Timer.SECOND * Mission.timeToNextExercise, () => {
                this.nextExercise();
            }, this);
        });
    }

    public startMission(exerciseSuccess: Function, exerciseFail: Function, exerciseChange: Function) {
        this.exerciseSuccess = exerciseSuccess;
        this.exerciseFail = exerciseFail;
        this.exerciseChange = exerciseChange;

        this.nextExercise();
    }

}