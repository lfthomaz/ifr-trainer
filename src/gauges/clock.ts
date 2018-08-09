import 'phaser';
import * as Assets from '../assets';
import {Aircraft} from '../models/aircraft';

export class ClockGauge extends Phaser.Group {

    private aircraft: Aircraft;

    private clockTimer: Phaser.TimerEvent;
    public running: boolean = false;
    public seconds: number = 0;

    constructor(game: Phaser.Game, aircraft: Aircraft) {
        super(game);

        this.aircraft = aircraft;

        this.createTimer();
    }

    private createTimer() {
        if (this.clockTimer) {
            this.removeTimer();
        }
        this.clockTimer = this.game.time.events.loop(Phaser.Timer.SECOND, () => {
            if (this.running) {
                this.seconds += 1;
            }
        }, this);
    }

    private removeTimer() {
        if (this.clockTimer) {
            this.game.time.events.remove(this.clockTimer);
            this.clockTimer = null;
            this.seconds = 0;
        }
    }

    public setClock() {
        this.running = !this.running;
    }

    public resetClock() {
        this.removeTimer();
        this.createTimer();
    }

    public toString() {
        let minutes: any = Math.floor(this.seconds / 60) % 60;
        let seconds: any = Math.floor(this.seconds) % 60;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;
        return minutes + ':' + seconds;
    }

    public update() {
    }

}
