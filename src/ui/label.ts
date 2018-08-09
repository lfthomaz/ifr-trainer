import 'phaser';
import * as Assets from '../assets';

export enum LabelAlign {
    LEFT = 0,
    CENTER,
    RIGHT
}

export class Label {

    private labelText: Phaser.Text;

    private game: Phaser.Game;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private align: LabelAlign;

    constructor(game: Phaser.Game, x: number, y: number, width: number, height: number, text: string, align?: LabelAlign) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.align = align;

        let textX = x;
        let textY = y + this.height / 2 - 10;
        this.labelText = game.add.text(textX, textY, text, {
            font: '20px ' + Assets.CustomWebFonts.FontsMonofonto.getFamily(),
            fill: '#ffffff'
        });
        switch (align) {
            case LabelAlign.CENTER:
                this.labelText.x = x + (this.width - this.labelText.width) / 2;
                break;
            case LabelAlign.RIGHT:
                this.labelText.x = x + (this.width - this.labelText.width);
                break;
        }
    }

    public setText(text: string) {
        this.labelText.setText(text);
    }

    public setColor(color: string) {
        this.labelText.addColor(color, 0);
    }

}