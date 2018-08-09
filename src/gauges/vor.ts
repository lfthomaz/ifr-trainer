import 'phaser';
import * as Assets from '../assets';
import {Aircraft} from '../models/aircraft';
import {Beacon} from '../models/beacon';

export enum VorIndicator {
    NA = 0,
    FROM,
    TO
}

export class VorGauge extends Phaser.Group {

    private aircraft: Aircraft;
    private beacon: Beacon;

    private vorCardOutsideSprite: Phaser.Sprite;
    private vorPointerTo: Phaser.Sprite;
    private vorPointerFrom: Phaser.Sprite;
    private vorNeedleSprite: Phaser.Sprite;
    private vorCardInsideSprite: Phaser.Sprite;

    public obs: number = 0;
    public vorDeflection: number = -10; // in degrees
    public vorIndicator: VorIndicator = VorIndicator.NA;

    constructor(game: Phaser.Game, aircraft: Aircraft, beacon: Beacon) {
        super(game);

        this.aircraft = aircraft;
        this.beacon = beacon;

        let vorBackgroundSprite = this.create(0, 0, Assets.Images.ImagesVORBackground.getName());
        vorBackgroundSprite.anchor.set(0.5, 0.5);

        this.vorCardInsideSprite = this.create(0, 0, Assets.Images.ImagesVORCardInside.getName());
        this.vorCardInsideSprite.anchor.set(0.5, 0.5);

        this.vorPointerTo = this.create(0, 0, Assets.Images.ImagesVORPointerTo.getName());
        this.vorPointerTo.anchor.set(0.5, 0.5);
        this.vorPointerTo.x = 38;
        this.vorPointerTo.y = -20;
        this.vorPointerTo.visible = false;
        this.vorCardInsideSprite.addChild(this.vorPointerTo);

        this.vorPointerFrom = this.create(0, 0, Assets.Images.ImagesVORPointerFrom.getName());
        this.vorPointerFrom.anchor.set(0.5, 0.5);
        this.vorPointerFrom.x = 38;
        this.vorPointerFrom.y = 20;
        this.vorCardInsideSprite.addChild(this.vorPointerFrom);

        this.vorNeedleSprite = this.create(0, 0, Assets.Images.ImagesVORNeedle.getName());
        this.vorNeedleSprite.anchor.set(0.5, 0.5);
        // this.vorNeedleSprite.y = -63;
        // this.vorNeedleSprite.pivot.y = -65;

        this.vorCardOutsideSprite = this.create(0, 0, Assets.Images.ImagesVORCardOutside.getName());
        this.vorCardOutsideSprite.anchor.set(0.5, 0.5);

        // Initialize values
        this.setObs(0);
        this.updateBearing(this.beacon.getQdm(this.aircraft.position));

        this.x = vorBackgroundSprite.width / 2;
        this.y = vorBackgroundSprite.height / 2;

        this.width = 256;
        this.height = 256;
    }

    private updateBearing(bearing: number) {
        let radial = Math.abs(bearing + 180);
        radial = radial < 360 ? radial : radial - 360;

        // FIXME horrible code, there must be an easier way to calculate this
        let delta = ((radial - this.obs) + 180) % 360 - 180;
        this.vorIndicator = Math.abs(delta) > 90 ? VorIndicator.TO : VorIndicator.FROM;
        if (delta < -90) {
            delta = delta - 2 * (delta + 90);
        } else if (delta >= 90) {
            delta = delta - 2 * (delta - 90);
        }
        this.vorDeflection = delta < 0 ? Math.max(-10, delta) : Math.min(10, delta);
    }

    public update() {
        this.updateBearing(this.beacon.getQdm(this.aircraft.position));
        this.vorNeedleSprite.position.x = this.vorDeflection * -65 / 10;
        this.vorPointerFrom.visible = (this.vorIndicator === VorIndicator.FROM);
        this.vorPointerTo.visible = (this.vorIndicator === VorIndicator.TO);
    }

    public increaseObs() {
        this.setObs(this.obs < 359 ? this.obs + 1 : 0, true);
    }

    public decreaseObs() {
        this.setObs(this.obs > 0 ? this.obs - 1 : 359, false);
    }

    public setObs(obs: number, increase?: boolean) {
        if (obs < 0 || obs > 359) {
            console.error(`Heading is out of bounds: ${obs}`);
            return;
        }
        this.obs = obs;
        this.vorCardOutsideSprite.angle = -obs;
    }

}
