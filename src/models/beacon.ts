import Util from '../utils/util';
import {Position, World} from './world';
import * as Assets from '../assets';

export class Beacon {

    protected game: Phaser.Game;

    public sprite: Phaser.Sprite;
    public ringsSprite: Phaser.Sprite;

    public name: string;
    public position: Position;
    public working: boolean = true;

    constructor(game: Phaser.Game, name: string, position: Position) {
        this.game = game;
        this.name = name;
        this.position = position;

        let bmd = this.game.make.bitmapData(this.game.world.width, this.game.world.height);
        this.ringsSprite = this.game.make.sprite(0, 0, bmd);
    }

    protected drawRings(world: World) {
        const RING_NUMBER = 5;
        const RING_MAX_RADIUS = world.range / 4;
        const RING_ANGLE_DIV = 30;

        let x = this.position.x * world.getPxPerNm() + world.centerX;
        let y = this.position.y * world.getPxPerNm() + world.centerY;

        // TODO Option to change ring sizes?
        let bmd: Phaser.BitmapData = <Phaser.BitmapData> this.ringsSprite.key;
        bmd.clear();

        bmd.ctx.lineWidth = 1;
        bmd.ctx.fillStyle = 'gray';
        bmd.ctx.strokeStyle = 'gray';
        bmd.ctx.font = '12px atari';
        bmd.ctx.setLineDash([4, 4]);
        for (let i = 1; i <= RING_NUMBER; i++) {
            bmd.ctx.beginPath();
            bmd.ctx.arc(x, y, i * RING_MAX_RADIUS * world.getPxPerNm() / RING_NUMBER, 0, 2 * Math.PI);
            bmd.ctx.stroke();
            bmd.ctx.closePath();
            bmd.ctx.fillText((RING_MAX_RADIUS / RING_NUMBER * i).toFixed(1), x + 2, y - (i * RING_MAX_RADIUS * world.getPxPerNm() / RING_NUMBER) - 6);
        }

        for (let i = 0; i < 360 / RING_ANGLE_DIV; i++) {
            bmd.ctx.beginPath();
            bmd.ctx.moveTo(x + (Math.sin(Util.toRadians(RING_ANGLE_DIV * i)) * this.sprite.width / 2), y - (Math.cos(Util.toRadians(RING_ANGLE_DIV * i)) * this.sprite.width / 2));
            bmd.ctx.lineTo(x + (Math.sin(Util.toRadians(RING_ANGLE_DIV * i)) * RING_MAX_RADIUS * world.getPxPerNm()), y - (Math.cos(Util.toRadians(RING_ANGLE_DIV * i)) * RING_MAX_RADIUS * world.getPxPerNm()));
            bmd.ctx.stroke();
            bmd.ctx.closePath();
        }
    }

    public addToWorld(world: World) {
        this.game.add.existing(this.sprite);
        this.game.add.existing(this.ringsSprite);
        this.update(world);
    }

    public update(world: World) {
        this.drawRings(world);
        this.sprite.position.x = this.position.x * world.getPxPerNm() + world.centerX;
        this.sprite.position.y = this.position.y * world.getPxPerNm() + world.centerY;
    }

    public isWorking(): boolean {
        return this.working;
    }

    public getQdr(position: Position): number {
        let qdr = this.getQdm(position) + 180;
        if (qdr > 360) {
            qdr = qdr - 360;
        }
        return qdr;
    }

    public getQdm(position: Position): number {
        let theta = Math.atan2(this.position.y - position.y, this.position.x - position.x);
        if (theta < 0.0) {
            theta += 2 * Math.PI;
        }
        let qdm = 90 + Util.toDegrees(theta);
        return qdm < 360 ? qdm : qdm - 360;
    }

    public getDistance(position: Position): number {
        let deltaX = position.x - this.position.x;
        let deltaY = position.y - this.position.y;
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    }

}

export class NdbBeacon extends Beacon {

    constructor(game: Phaser.Game, name: string, position: Position) {
        super(game, name, position);

        this.sprite = game.make.sprite(0, 0, Assets.Images.ImagesWorldNDB.getName());
        this.sprite.tint = Util.COLOR_CYAN;
        this.sprite.anchor.set(0.5, 0.5);
    }

    // TODO sprite creating
    // TODO add ring handling here

    public update(world: World) {
        if (world.range > 30 && world.range < 50) {
            this.sprite.scale.setTo(1 - (1.75 * world.range / 100));
        }
        super.update(world);
    }

}

export class VorBeacon extends Beacon {

    constructor(game: Phaser.Game, name: string, position: Position) {
        super(game, name, position);

        this.sprite = game.make.sprite(0, 0, Assets.Images.ImagesWorldVOR.getName());
        this.sprite.tint = Util.COLOR_CYAN;
        this.sprite.anchor.set(0.5, 0.5);
    }

    // TODO sprite creating
    // TODO add ring handling here

    public update(world: World) {
        if (world.range > 30 && world.range < 50) {
            this.sprite.scale.setTo(1 - (1.75 * world.range / 100));
        }
        super.update(world);
    }

}