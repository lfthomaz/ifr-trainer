import 'phaser';
import * as Assets from '../assets';

export class Button {

    private game: Phaser.Game;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private text: string;
    private longPress: boolean;
    private callback: Function;

    private longPressTimer: Phaser.TimerEvent;
    private longPressCount: number;

    private image: Phaser.Image;
    private bmd: Phaser.BitmapData;
    private bmdPressed: Phaser.BitmapData;

    private createBitmap() {

        this.bmd = this.game.make.bitmapData(this.width, this.height);
        this.bmd.ctx.strokeStyle = '#00ff00';
        this.bmd.ctx.lineWidth = 6;
        this.bmd.ctx.strokeRect(0, 0, this.bmd.width, this.bmd.height);
        this.bmd.ctx.fillStyle = '#00ff00';
        this.bmd.ctx.font = '20px ' + Assets.CustomWebFonts.FontsMonofonto.getFamily();
        let textWidth = this.bmd.ctx.measureText(this.text).width;
        this.bmd.ctx.fillText(this.text, (this.bmd.width / 2) - (textWidth / 2), this.bmd.height / 2 + 8);

        this.bmdPressed = this.game.make.bitmapData(this.width, this.height);
        this.bmdPressed.ctx.fillStyle = '#00ff00';
        this.bmdPressed.ctx.rect(0, 0, this.bmdPressed.width, this.bmdPressed.height);
        this.bmdPressed.ctx.fill();
        this.bmdPressed.ctx.fillStyle = '#000000';
        this.bmdPressed.ctx.font = '20px ' + Assets.CustomWebFonts.FontsMonofonto.getFamily();
        this.bmdPressed.ctx.fillText(this.text, (this.bmdPressed.width / 2) - (textWidth / 2), this.bmdPressed.height / 2 + 8);
    }

    constructor(game: Phaser.Game, x: number, y: number, width: number, height: number, text: string, longPress: boolean, callback: Function) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.longPress = longPress;
        this.callback = callback;

        this.createBitmap();

        this.image = this.game.add.image(this.x, this.y);
        this.image.inputEnabled = true;
        this.image.loadTexture(this.bmd);

        this.image.events.onInputDown.add(() => {
            this.image.loadTexture(this.bmdPressed);
            this.callback();
            if (this.longPress) {
                this.longPressCount = 0;
                this.longPressTimer = this.game.time.events.loop(300, this.longPressTimerCallback, this);
            }
        }, this);

        this.image.events.onInputUp.add(() => {
            if (this.longPressTimer) {
                this.game.time.events.remove(this.longPressTimer);
                this.longPressTimer = null;
            }
            this.image.loadTexture(this.bmd);
        }, this);
    }

    private longPressTimerCallback() {
        if (this.longPressTimer) {
            this.callback();
            // this.longPressCount++;
            // if (this.longPressCount === 4) {
                this.longPressTimer.delay = 25;
            // }
        }
    }

}