import 'phaser';
import * as Assets from '../assets';
import {Aircraft} from '../models/aircraft';
import {Beacon} from '../models/beacon';

export class RmiGauge extends Phaser.Group {

    private aircraft: Aircraft;
    private ndbBeacon: Beacon;
    private vorBeacon: Beacon;

    // When no signal, bearing should be 90
    public adfBearing: number = 90;
    public vorBearing: number = 90;

    private rmiCardSprite: Phaser.Sprite;
    private rmiAdfNeedleSprite: Phaser.Sprite;
    private rmiVorNeedleSprite: Phaser.Sprite;

    constructor(game: Phaser.Game, aircraft: Aircraft, ndbBeacon: Beacon, vorBeacon: Beacon) {
        super(game);

        this.aircraft = aircraft;
        this.ndbBeacon = ndbBeacon;
        this.vorBeacon = vorBeacon;

        let rmiBackgroundSprite = this.create(0, 0, Assets.Images.ImagesRMIBackground.getName());
        rmiBackgroundSprite.anchor.set(0.5, 0.5);

        this.rmiCardSprite = this.create(0, 0, Assets.Images.ImagesRMICard.getName());
        this.rmiCardSprite.anchor.set(0.5, 0.5);
        this.rmiCardSprite.angle = -this.aircraft.heading;

        // TODO connect signal once VOR is available
        this.rmiVorNeedleSprite = this.create(0, 0, Assets.Images.ImagesRMIVORNeedle.getName());
        this.rmiVorNeedleSprite.anchor.set(0.5, 0.5);
        this.rmiCardSprite.addChild(this.rmiVorNeedleSprite);

        this.rmiAdfNeedleSprite = this.create(0, 0, Assets.Images.ImagesRMIADFNeedle.getName());
        this.rmiAdfNeedleSprite.anchor.set(0.5, 0.5);
        this.rmiCardSprite.addChild(this.rmiAdfNeedleSprite);

        this.width = 256;
        this.height = 256;
    }

    public update() {
        if (this.ndbBeacon) {
            this.adfBearing = this.ndbBeacon.getQdm(this.aircraft.position);
        }
        if (this.vorBeacon) {
            this.vorBearing = this.vorBeacon.getQdm(this.aircraft.position);
        }

        this.rmiCardSprite.angle = -this.aircraft.heading;
        this.rmiAdfNeedleSprite.angle = this.adfBearing;
        this.rmiVorNeedleSprite.angle = this.vorBearing;
    }

}
