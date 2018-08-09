export default class Util {

    public static COLOR_CYAN = 0x00ffff;
    public static COLOR_GREEN = 0x00ff00;
    public static COLOR_WHITE = 0xffffff;

    public static toDegrees(angleInRad: number): number {
        return angleInRad * 180 / Math.PI;
    }

    public static toRadians(angleInDeg: number): number {
        return angleInDeg / 180 * Math.PI;
    }

    public static addAngles(angle1: number, angle2: number) {
        let result = angle1 + angle2;
        result = result % 360;
        if (result < 0) {
            result += 360;
        }
        return result;
    }

    public static toFixedDigits(angle: number, digits: number): string {
        return ('00' + angle).slice(-3);
    }

    public static listenSwipe(sprite: Phaser.Sprite, callback: Function, context: object) {
        let minimum = {duration: 75, distance: 2};
        let point: any = {};
        let direction;
        let flag = false;
        sprite.events.onInputDown.add(function (sprite: Phaser.Sprite, pointer: Phaser.Pointer) {
            point.x = pointer.clientX;
            point.y = pointer.clientY;
            flag = true;
        }, context);
        sprite.game.input.addMoveCallback(function (pointer: Phaser.Pointer) {
            if (flag) {
                direction = '';
                if (pointer.clientX - point.x > minimum.distance) {
                    direction = 'right';
                } else if (point.x - pointer.clientX > minimum.distance) {
                    direction = 'left';
                }
                if (pointer.clientY - point.y > minimum.distance) {
                    direction = 'down';
                } else if (point.y - pointer.clientY > minimum.distance) {
                    direction = 'up';
                }
                if (direction) {
                    point.x = pointer.clientX;
                    point.y = pointer.clientY;
                    callback(direction, context);
                }
            }
        }, context);
        sprite.events.onInputUp.add(function (sprite: Phaser.Sprite, pointer: Phaser.Pointer) {
            flag = false;
        }, context);
    }

}
