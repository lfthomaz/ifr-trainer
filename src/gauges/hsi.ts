import 'phaser';
import * as Assets from '../assets';
import {Aircraft} from '../models/aircraft';
import {Beacon} from '../models/beacon';

export enum CdiIndicator {
    NA = 0,
    FROM,
    TO
}

export class HsiGauge extends Phaser.Group {

    private aircraft: Aircraft;
    private beacon: Beacon;

    private hsiCardOutsideSprite: Phaser.Sprite;
    private hsiPointerTo: Phaser.Sprite;
    private hsiPointerFrom: Phaser.Sprite;
    private hsiNeedleSprite: Phaser.Sprite;
    private hsiKnobHdgSprite: Phaser.Sprite;
    private hsiHdgBugSprite: Phaser.Sprite;
    private hsiKnobCdiSprite: Phaser.Sprite;
    private hsiCardInsideSprite: Phaser.Sprite;

    public hdg: number = 0;
    public cdi: number = 0;
    public cdiDeflection: number = -10; // in degrees
    public cdiIndicator: CdiIndicator = CdiIndicator.NA;

    constructor(game: Phaser.Game, aircraft: Aircraft, beacon: Beacon) {
        super(game);

        this.aircraft = aircraft;
        this.beacon = beacon;

        let hsiBackgroundSprite = this.create(0, 0, Assets.Images.ImagesHSIBackground.getName());
        hsiBackgroundSprite.anchor.set(0.5, 0.5);

        this.hsiCardOutsideSprite = this.create(0, 0, Assets.Images.ImagesHSICardOutside.getName());
        this.hsiCardOutsideSprite.anchor.set(0.5, 0.5);
        this.hsiCardOutsideSprite.angle = -this.aircraft.heading;

        this.hsiCardInsideSprite = this.create(0, 0, Assets.Images.ImagesHSICardInside.getName());
        this.hsiCardInsideSprite.anchor.set(0.5, 0.5);
        this.hsiCardOutsideSprite.addChild(this.hsiCardInsideSprite);

        this.hsiPointerTo = this.create(0, 0, Assets.Images.ImagesHSIPointerTo.getName());
        this.hsiPointerTo.anchor.set(0.5, 0.5);
        this.hsiPointerTo.x = 38;
        this.hsiPointerTo.y = -20;
        this.hsiPointerTo.visible = false;
        this.hsiCardInsideSprite.addChild(this.hsiPointerTo);

        this.hsiPointerFrom = this.create(0, 0, Assets.Images.ImagesHSIPointerFrom.getName());
        this.hsiPointerFrom.anchor.set(0.5, 0.5);
        this.hsiPointerFrom.x = 38;
        this.hsiPointerFrom.y = 20;
        this.hsiCardInsideSprite.addChild(this.hsiPointerFrom);

        this.hsiNeedleSprite = this.create(0, 0, Assets.Images.ImagesHSINeedle.getName());
        this.hsiNeedleSprite.anchor.set(0.5, 0.5);
        this.hsiNeedleSprite.x = -65;
        this.hsiCardInsideSprite.addChild(this.hsiNeedleSprite);

        let hsiMaskSprite = this.create(0, 0, Assets.Images.ImagesHSIMask.getName());
        hsiMaskSprite.anchor.set(0.5, 0.5);

        this.hsiHdgBugSprite = this.create(0, 0, Assets.Images.ImagesHSIHDGBug.getName());
        this.hsiHdgBugSprite.anchor.set(0.5, 0.5);
        this.hsiHdgBugSprite.angle = this.aircraft.heading;
        this.hsiHdgBugSprite.bringToTop();
        this.hsiCardOutsideSprite.addChild(this.hsiHdgBugSprite);

        // this.hsiKnobCdiSprite = this.create(-72, 55, Assets.Images.ImagesHSIKnobLeft.getName());
        // this.hsiKnobCdiSprite.anchor.set(0.5, 0.5);
        // hsiMaskSprite.addChild(this.hsiKnobCdiSprite);
        // this.hsiKnobCdiSprite.inputEnabled = true;

        // this.hsiKnobHdgSprite = this.create(72, 55, Assets.Images.ImagesHSIKnobRight.getName());
        // this.hsiKnobHdgSprite.anchor.set(0.5, 0.5);
        // hsiMaskSprite.addChild(this.hsiKnobHdgSprite);
        // this.hsiKnobHdgSprite.inputEnabled = true;

        // Mouse/Touch events
        // Util.listenSwipe(this.hsiKnobHdgSprite, function (direction, context) {
        //     if (direction === 'up') {
        //         context.increaseHeading();
        //     } else if (direction === 'down') {
        //         context.decreaseHeading();
        //     }
        // }, this);
        //
        // Util.listenSwipe(this.hsiKnobCdiSprite, function (direction, context) {
        //     if (direction === 'up') {
        //         context.increaseCdi();
        //     } else if (direction === 'down') {
        //         context.decreaseCdi();
        //     }
        // }, this);

        // Initialize values
        this.setHeading(this.aircraft.heading);
        this.updateBearing(this.beacon.getQdm(this.aircraft.position));

        this.x = hsiBackgroundSprite.width / 2;
        this.y = hsiBackgroundSprite.height / 2;

        this.width = 256;
        this.height = 256;
    }

    private updateBearing(bearing: number) {
        let radial = Math.abs(bearing + 180);
        radial = radial < 360 ? radial : radial - 360;

        // FIXME horrible code, there must be an easier way to calculate this
        let delta = ((radial - this.cdi) + 180) % 360 - 180;
        this.cdiIndicator = Math.abs(delta) > 90 ? CdiIndicator.TO : CdiIndicator.FROM;
        if (delta < -90) {
            delta = delta - 2 * (delta + 90);
        } else if (delta >= 90) {
            delta = delta - 2 * (delta - 90);
        }
        this.cdiDeflection = delta < 0 ? Math.max(-10, delta) : Math.min(10, delta);
    }

    public update() {
        this.updateBearing(this.beacon.getQdm(this.aircraft.position));
        this.hsiCardOutsideSprite.angle = -this.aircraft.heading;
        this.hsiNeedleSprite.position.x = this.cdiDeflection * -65 / 10;
        this.hsiPointerFrom.visible = (this.cdiIndicator === CdiIndicator.FROM);
        this.hsiPointerTo.visible = (this.cdiIndicator === CdiIndicator.TO);
    }

    public increaseHeading() {
        this.setHeading(this.hdg < 359 ? this.hdg + 1 : 0, true);
    }

    public decreaseHeading() {
        this.setHeading(this.hdg > 0 ? this.hdg - 1 : 359, false);
    }

    public setHeading(hdg: number, increase?: boolean) {
        if (hdg < 0 || hdg > 359) {
            console.error(`Heading is out of bounds: ${hdg}`);
            return;
        }
        this.hdg = hdg;
        this.aircraft.setApHeading(hdg);
        this.hsiHdgBugSprite.angle = hdg;
        // Update the Heading buttons
        // if (increase) {
        //     if (increase === true) {
        //         this.hsiKnobHdgSprite.angle += 12;
        //     } else {
        //         this.hsiKnobHdgSprite.angle -= 12;
        //     }
        // }
    }

    public increaseCdi() {
        this.setCdi(this.cdi < 359 ? this.cdi + 1 : 0, true);
    }

    public decreaseCdi() {
        this.setCdi(this.cdi > 0 ? this.cdi - 1 : 359, false);
    }

    public setCdi(cdi: number, increase?: boolean) {
        if (cdi < 0 || cdi > 359) {
            console.error(`CDI is out of bounds: ${cdi}`);
            return;
        }
        this.cdi = cdi;
        this.hsiCardInsideSprite.angle = cdi;
        // Update the Heading buttons
        // if (increase) {
        //     if (increase === true) {
        //         this.hsiKnobCdiSprite.angle += 12;
        //     } else {
        //         this.hsiKnobCdiSprite.angle += 12;
        //     }
        // }
    }

}
