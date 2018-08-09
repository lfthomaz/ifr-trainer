import 'phaser';
import * as Assets from '../assets';
import {Aircraft} from '../models/aircraft';
import {Beacon} from '../models/beacon';

export class DmeGauge extends Phaser.Group {

    private aircraft: Aircraft;
    private beacon: Beacon;

    public distance: number = 0;

    private dmeText: Phaser.Text;

    constructor(game: Phaser.Game, aircraft: Aircraft, beacon: Beacon) {
        super(game);

        this.aircraft = aircraft;
        this.beacon = beacon;

        let dmeCardSprite = this.create(0, 0, Assets.Images.ImagesDMEBackground.getName());
        dmeCardSprite.anchor.set(0.5, 0.5);

        this.dmeText = this.game.make.text(0, -6, '13:35', {
            font: '20px ' + Assets.CustomWebFonts.FontsLcd.getFamily(),
            fill: '#ff0000'
        });
        this.dmeText.anchor.setTo(0.5, 0.5);
        dmeCardSprite.addChild(this.dmeText);

        this.width = 256;
        this.height = 128;
    }

    public update() {
        this.distance = this.beacon.getDistance(this.aircraft.position);

        this.dmeText.setText(`${this.distance.toFixed(1)}  NM`);
    }

}
