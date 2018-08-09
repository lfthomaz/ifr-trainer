import 'phaser';
import DisplayObject = PIXI.DisplayObject;
import Group = Phaser.Group;

export enum PanelFlow {
    LEFT_TO_RIGHT = 0,
    RIGHT_TO_LEFT,
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP
}

export class Panel extends Phaser.Group {

    private panel: Phaser.Sprite;

    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public centerX: number;
    public centerY: number;
    public flow: number;

    constructor(game: Phaser.Game, x: number, y: number, width: number, height: number, flow: PanelFlow, backgroundColor: string, border?: boolean) {
        super(game);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.flow = flow;

        // FIXME objects outside the panel limits are still being displayed

        // Create the panel
        Phaser.Group.call(this, game);
        let panel = this.game.add.bitmapData(width, height);

        // TODO Add background color if requested
        if (backgroundColor) {
            panel.rect(0, 0, width, height, backgroundColor);
        }

        // Add a border if requested
        if (border) {
            panel.line(0, 0, width, 0, '#ffffff', 6);
            panel.line(width, 0, width, height, '#ffffff', 6);
            panel.line(width, height, 0, height, '#ffffff', 6);
            panel.line(0, height, 0, 0, '#ffffff', 6);
        }

        this.panel = this.create(x, y, panel);
    }

    public addToPanelFree(object: Group, x: number, y: number) {
        // TODO add a group not using the flow system
    }

    public addToPanelFlow(object: Group, scaleObject?: boolean) {
        let lastGroup = this.panel.children[this.panel.children.length - 1] as Group;

        // Scale the object
        if (scaleObject) {
            let factor = 1;
            if (this.flow === PanelFlow.LEFT_TO_RIGHT || this.flow === PanelFlow.RIGHT_TO_LEFT) {
                factor = this.height / object.height;
            } else {
                factor = this.width / object.width;
            }
            object.height *= factor;
            object.width *= factor;
        }

        // Position the object inside the panel
        switch (this.flow) {
            case PanelFlow.LEFT_TO_RIGHT:
                if (lastGroup) {
                    object.x = lastGroup.x + (lastGroup.width / 2) + (object.width / 2);
                } else {
                    object.x = object.width / 2;
                }
                object.y = object.height / 2;
                break;
            case PanelFlow.RIGHT_TO_LEFT:
                break;
            case PanelFlow.TOP_TO_BOTTOM:
                break;
            case PanelFlow.BOTTOM_TO_TOP:
                break;
        }

        this.panel.addChild(object);
    }

}