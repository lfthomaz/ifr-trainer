import 'phaser';
import * as Assets from '../assets';

export class Toggle {

    private game: Phaser.Game;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private text: string;
    private callback: Function;

    private image: Phaser.Image;
    private bmd: Phaser.BitmapData;
    private bmdToggled: Phaser.BitmapData;
    private toggled: boolean;

    private createBitmap() {
        this.bmd = this.game.make.bitmapData(this.width, this.height);
        this.bmd.ctx.strokeStyle = '#00ff00';
        this.bmd.ctx.lineWidth = 6;
        this.bmd.ctx.strokeRect(0, 0, this.bmd.width, this.bmd.height);
        this.bmd.ctx.fillStyle = '#00ff00';
        this.bmd.ctx.font = '20px ' + Assets.CustomWebFonts.FontsMonofonto.getFamily();
        let textWidth = this.bmd.ctx.measureText(this.text).width;
        this.bmd.ctx.fillText(this.text, (this.bmd.width / 2) - (textWidth / 2), this.bmd.height / 2 + 6);

        this.bmdToggled = this.game.make.bitmapData(this.width, this.height);
        this.bmdToggled.ctx.fillStyle = '#00ff00';
        this.bmdToggled.ctx.rect(0, 0, this.bmdToggled.width, this.bmdToggled.height);
        this.bmdToggled.ctx.fill();
        this.bmdToggled.ctx.fillStyle = '#000000';
        this.bmdToggled.ctx.font = '20px ' + Assets.CustomWebFonts.FontsMonofonto.getFamily();
        this.bmdToggled.ctx.fillText(this.text, (this.bmdToggled.width / 2) - (textWidth / 2), this.bmd.height / 2 + 6);

    }

    constructor(game: Phaser.Game, x: number, y: number, width: number, height: number, text: string, callback: Function, toggled?: boolean) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.callback = callback;
        this.toggled = toggled;

        this.createBitmap();

        this.image = this.game.add.image(this.x, this.y);
        this.image.inputEnabled = true;
        this.image.events.onInputDown.add(() => {
            this.setToggle(!this.toggled);
        }, this);
        this.image.loadTexture(toggled ? this.bmdToggled : this.bmd);
    }

    // Set the toggle programmatically
    public setToggle(toggled: boolean) {
        this.toggled = toggled;
        this.image.loadTexture(this.toggled ? this.bmdToggled : this.bmd);
        this.callback();
    }

}