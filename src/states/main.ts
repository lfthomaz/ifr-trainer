import 'phaser';

import * as Assets from '../assets';

import Util from '../utils/util';
import {Position, Wind, World} from '../models/world';
import {Aircraft} from '../models/aircraft';
import {Beacon, VorBeacon, NdbBeacon} from '../models/beacon';
import {Button} from '../ui/button';
import {Label, LabelAlign} from '../ui/label';
import {Toggle} from '../ui/toggle';
import {Mission} from '../missions/mission';
import {HsiGauge} from '../gauges/hsi';
import {RmiGauge} from '../gauges/rmi';
import {DmeGauge} from '../gauges/dme';
import {ClockGauge} from '../gauges/clock';
import {Panel, PanelFlow} from '../ui/panel';
import {VorGauge} from '../gauges/vor';

export default class Main extends Phaser.State {

    private AUTOPILOT_ERROR = 0.1;

    private cursors: Phaser.CursorKeys;
    private keys: Phaser.Key;

    private myWorld: World;

    private beacons: Array<Beacon> = new Array<Beacon>();
    private ndbBeacon: NdbBeacon;
    private vorBeacon: VorBeacon;

    private aircraft;
    private aircraftSprite: Phaser.Sprite;

    private gauges: Array<Phaser.Group> = new Array<Phaser.Group>();
    private hsiGauge: HsiGauge;
    private rmiGauge: RmiGauge;
    private vorGauge: VorGauge;
    // private dmeGauge: DmeGauge;
    private clockGauge: ClockGauge;

    // private infoText: Phaser.BitmapText;
    private infoText: Phaser.Text;

    private missionText: Phaser.Text;

    private speedLabel: Label;
    private clockLabel: Label;

    private ringsSprite: Phaser.Sprite;
    private ringsText: Phaser.BitmapText;
    private rangeLabel: Label;

    private TRAIL_SAMPLE: number = 500;
    private trailTime: number = 0;
    private trailPositions: Position[] = [];
    private trailSprite: Phaser.Sprite;
    private trailText: Phaser.BitmapText;

    private wind;
    private windsock: Phaser.Sprite;
    private windText: Phaser.BitmapText;

    private mission: Mission;

    private getInfoText(): string {
        let text: string = '';
        // text += `ias = ${this.aircraft.speed} \n`;
        // text += `heading = ${Math.round(this.aircraft.heading)} \n`;
        // text += `hsi hdg = ${this.hsiGauge.hdg} \n`;
        // text += `hsi cdi = ${this.hsiGauge.cdi} \n\n`;
        // text += `POS = (${this.aircraft.position.x.toFixed(1)} ${this.aircraft.position.y.toFixed(1)})\n`;
        text += `GS = ${Math.round(this.aircraft.groundSpeed)} \n`;
        text += `CRS = ${Math.round(this.aircraft.course)} \n`;
        text += `ADF bearing = ${Math.round(this.ndbBeacon.getQdm(this.aircraft.position))} \n`;
        text += `ADF distance = ${this.ndbBeacon.getDistance(this.aircraft.position).toFixed(1)} \n`;
        text += `VOR bearing = ${Math.round(this.vorBeacon.getQdm(this.aircraft.position))} \n`;
        text += `VOR distance = ${this.vorBeacon.getDistance(this.aircraft.position).toFixed(1)} \n`;
        return text;
    }

    // TODO should this belong to the Aircraft class?
    private drawTrail() {
        if (this.trailSprite.visible) {
            let bmd: Phaser.BitmapData = <Phaser.BitmapData> this.trailSprite.key;
            bmd.clear();
            bmd.context.beginPath();
            bmd.context.moveTo(this.trailPositions[0].x * this.myWorld.getPxPerNm() + this.myWorld.centerX, this.trailPositions[0].y * this.myWorld.getPxPerNm() + this.myWorld.centerY);
            this.trailPositions.forEach((pos: Position) => {
                bmd.context.lineTo(pos.x * this.myWorld.getPxPerNm() + this.myWorld.centerX, pos.y * this.myWorld.getPxPerNm() + this.myWorld.centerY);
            });
            bmd.context.stroke();
        }
    }

    private setRange(range: number) {
        if (range >= 20 && range <= 50) {
            // Set new range
            this.myWorld.range = range;

            // Reposition and scale beacons
            this.ndbBeacon.update(this.myWorld);
            this.vorBeacon.update(this.myWorld);

            // Reposition and scale aircraft
            if (this.myWorld.range > 30 && this.myWorld.range < 50) {
                this.aircraftSprite.scale.setTo(1 - (1.75 * this.myWorld.range / 100));
            }
            this.aircraftSprite.position.x = this.aircraft.position.x * this.myWorld.getPxPerNm() + this.myWorld.centerX;
            this.aircraftSprite.position.y = this.aircraft.position.y * this.myWorld.getPxPerNm() + this.myWorld.centerY;

            // Redraw aircraft trail
            this.drawTrail();
        }
    }

    private createRadarPanel() {
        let top = 0;
        let left = 0;
        let width = this.game.width - 256;
        let height = this.game.height - 256;

        let radarPanel = this.game.add.bitmapData(width, height);
        radarPanel.line(top, left, width, top, '#ffffff', 6);
        radarPanel.line(width, left, width, height, '#ffffff', 6);
        radarPanel.line(width, height, top, height, '#ffffff', 6);
        radarPanel.line(top, height, top, left, '#ffffff', 6);
        radarPanel.addToWorld(top, left);

        // Wind
        this.windsock = this.game.add.sprite(width - 55, 30, Assets.Images.ImagesWorldWind.getName());
        this.windsock.scale.setTo(0.02, 0.02);
        this.windsock.anchor.set(0.5, 0.5);
        this.windsock.angle = this.wind.direction + 90;
        this.windsock.tint = Util.COLOR_CYAN;
        this.windText = this.game.add.bitmapText(width - 30, 20, 'gem', this.wind.speed.toString(), 16);
        this.windText.tint = Util.COLOR_CYAN;

        // Aircraft trail
        let bmd = this.game.add.bitmapData(width, height);
        bmd.ctx.lineWidth = 3;
        bmd.ctx.strokeStyle = 'red';
        this.trailSprite = this.game.add.sprite(0, 0, bmd);

        // Aircraft
        this.aircraftSprite = this.game.add.sprite(this.aircraft.position.x * this.myWorld.getPxPerNm() + this.myWorld.centerX, this.aircraft.position.y * this.myWorld.getPxPerNm() + this.myWorld.centerY, Assets.Images.ImagesWorldAircraft.getName());
        this.aircraftSprite.scale.setTo(1 - (1.75 * this.myWorld.range / 100));
        this.aircraftSprite.anchor.set(0.5, 0.5);
        this.aircraftSprite.angle = this.aircraft.heading;
        this.game.physics.enable(this.aircraftSprite, Phaser.Physics.ARCADE);
    }

    // TODO we need a layout manager for this
    private createInstrumentPanel() {
        let panel = new Panel(this.game, 0, this.world.height - 256, 256 * 3, 256, PanelFlow.LEFT_TO_RIGHT, '#1f1f1f', false);

        this.hsiGauge = new HsiGauge(this.game, this.aircraft, this.vorBeacon);
        panel.addToPanelFlow(this.hsiGauge, true);
        this.gauges.push(this.hsiGauge);

        this.rmiGauge = new RmiGauge(this.game, this.aircraft, this.ndbBeacon, this.vorBeacon);
        panel.addToPanelFlow(this.rmiGauge, true);
        this.gauges.push(this.rmiGauge);

        this.vorGauge = new VorGauge(this.game, this.aircraft, this.vorBeacon);
        panel.addToPanelFlow(this.vorGauge, true);
        this.gauges.push(this.vorGauge);

        // this.dmeGauge = new DmeGauge(this.game, this.aircraft, this.vorBeacon);
        // panel.addToPanelFlow(this.dmeGauge, false);
        // this.gauges.push(this.dmeGauge);

        this.clockGauge = new ClockGauge(this.game, this.aircraft);
        // panel.addToPanelFlow(this.clockGauge, false);
        this.gauges.push(this.clockGauge);
    }

    private createControlPanel() {
        let x = this.world.width - 256;
        let firstPosX = x + 10;
        let secondPosX = x + 72;
        let thirdPosX = x + 133;
        let fourthPosX = x + 195;

        let rightPanel = this.game.add.bitmapData(256, this.world.height);
        // rightPanel.rect(0, 0, 256, this.world.height, '#1f1f1f');
        rightPanel.rect(0, 0, 256, this.world.height, '#000000');
        rightPanel.addToWorld(this.world.width - 256, 0);

        // Parameters Text
        // this.infoText = this.game.add.bitmapText(10, 10, 'gem', this.getInfoText(), 16);
        this.infoText = this.game.add.text(10, 10, this.getInfoText(), {
            font: '16px ' + Assets.CustomWebFonts.FontsMonofonto.getFamily(),
            fill: '#ffffff'
        });

        // **********************************************************
        // Aircraft Control

        // Speed
        new Label(this.game, firstPosX, 518, 52, 40, 'SPD');
        let speedLabel = new Label(this.game, secondPosX, 518, 52, 40, this.aircraft.speed, LabelAlign.CENTER);
        new Button(this.game, thirdPosX, 518, 52, 40, '-', false, () => {
            this.aircraft.setSpeed(this.aircraft.speed - 5);
            speedLabel.setText(`${this.aircraft.speed}`);
        });
        new Button(this.game, fourthPosX, 518, 52, 40, '+', false, () => {
            this.aircraft.setSpeed(this.aircraft.speed + 5);
            speedLabel.setText(`${this.aircraft.speed}`);
        });

        // Heading
        new Label(this.game, firstPosX, 568, 52, 40, 'HDG');
        let headingLabel = new Label(this.game, secondPosX, 568, 52, 40, Util.toFixedDigits(this.hsiGauge.hdg, 3), LabelAlign.CENTER);
        new Button(this.game, thirdPosX, 568, 52, 40, '-', true, () => {
            this.hsiGauge.decreaseHeading();
            headingLabel.setText(Util.toFixedDigits(this.hsiGauge.hdg, 3));
        });
        new Button(this.game, fourthPosX, 568, 52, 40, '+', true, () => {
            this.hsiGauge.increaseHeading();
            headingLabel.setText(Util.toFixedDigits(this.hsiGauge.hdg, 3));
        });

        // Cdi
        new Label(this.game, firstPosX, 618, 52, 40, 'CDI');
        let cdiLabel = new Label(this.game, secondPosX, 618, 52, 40, Util.toFixedDigits(this.hsiGauge.cdi, 3), LabelAlign.CENTER);
        new Button(this.game, thirdPosX, 618, 52, 40, '-', true, () => {
            this.hsiGauge.decreaseCdi();
            cdiLabel.setText(Util.toFixedDigits(this.hsiGauge.cdi, 3));
        });
        new Button(this.game, fourthPosX, 618, 52, 40, '+', true, () => {
            this.hsiGauge.increaseCdi();
            cdiLabel.setText(Util.toFixedDigits(this.hsiGauge.cdi, 3));
        });

        // Obs
        new Label(this.game, firstPosX, 668, 52, 40, 'OBS');
        let obsLabel = new Label(this.game, secondPosX, 668, 52, 40, Util.toFixedDigits(this.hsiGauge.cdi, 3), LabelAlign.CENTER);
        new Button(this.game, thirdPosX, 668, 52, 40, '-', true, () => {
            this.vorGauge.decreaseObs();
            obsLabel.setText(Util.toFixedDigits(this.vorGauge.obs, 3));
        });
        new Button(this.game, fourthPosX, 668, 52, 40, '+', true, () => {
            this.vorGauge.increaseObs();
            obsLabel.setText(Util.toFixedDigits(this.vorGauge.obs, 3));
        });

        // Clock
        new Label(this.game, firstPosX, 718, 52, 40, 'CLK');
        this.clockLabel = new Label(this.game, secondPosX - 8, 718, 52, 40, `00:00`, LabelAlign.LEFT);
        new Button(this.game, thirdPosX, 718, 52, 40, 'S', false, () => {
            this.clockGauge.setClock();
        });
        new Button(this.game, fourthPosX, 718, 52, 40, 'R', false, () => {
            this.clockGauge.resetClock();
        });

        // **********************************************************
        // Mission Control

        let missionLabel = new Label(this.game, firstPosX, 10, 52, 40, this.mission.currentExercise.toString());
        new Button(this.game, thirdPosX, 10, 113, 40, 'NEXT', false, () => {
            this.mission.nextExercise();
            missionLabel.setText(this.mission.currentExercise.toString());
        });

        // **********************************************************
        // Radar Control

        // Range
        new Label(this.game, firstPosX, 90, 52, 40, 'RNG');
        this.rangeLabel = new Label(this.game, secondPosX, 90, 52, 40, this.myWorld.range.toString(), LabelAlign.CENTER);
        new Button(this.game, thirdPosX, 90, 52, 40, '-', false, () => {
            this.setRange(this.myWorld.range - 10);
            this.rangeLabel.setText(`${this.myWorld.range}`);
        });
        new Button(this.game, fourthPosX, 90, 52, 40, '+', false, () => {
            this.setRange(this.myWorld.range + 10);
            this.rangeLabel.setText(`${this.myWorld.range}`);
        });

        // Aircraft
        new Toggle(this.game, firstPosX, 140, 113, 40, 'AIRCRAFT', () => {
            this.aircraftSprite.visible = !this.aircraftSprite.visible;
        }, true);

        // Aircraft Trail
        let aircraftTrailToggle = new Toggle(this.game, thirdPosX, 140, 113, 40, 'TRAIL', () => {
            this.trailSprite.visible = !this.trailSprite.visible;
        }, true);

        // Range Rings
        new Toggle(this.game, firstPosX, 190, 113, 40, 'RINGS', () => {
            // TODO iterate through beacons to disable it
            this.vorBeacon.ringsSprite.visible = !this.vorBeacon.ringsSprite.visible;
        }, true);

        // Info
        new Toggle(this.game, thirdPosX, 190, 113, 40, 'INFO', () => {
            this.infoText.visible = !this.infoText.visible;
        }, false);
        this.infoText.visible = false;

        // **********************************************************
        // Simulation Control

        // Random
        new Button(this.game, firstPosX, 270, 113, 40, 'RANDOM', false, () => {
            this.aircraft.position = Position.getRandomPosition(this.myWorld.range / 2);
        });

        // Pause
        new Toggle(this.game, thirdPosX, 270, 113, 40, 'PAUSE', () => {
            this.game.paused = !this.game.paused;
        });

        // Config
        new Button(this.game, firstPosX, 320, 113, 40, 'CONFIG', false, () => {
        });

        // Back
        new Button(this.game, thirdPosX, 320, 113, 40, 'BACK', false, () => {
        });

    }

    public create(): void {

        // Create objects
        this.myWorld = new World(this.game, (this.game.width - 256) / 2, (this.game.height - 256) / 2);
        this.wind = new Wind(200, 20);

        this.ndbBeacon = new NdbBeacon(this.game, 'Ndb', new Position(12, 6));
        this.ndbBeacon.addToWorld(this.myWorld);
        // TODO this should become a method
        this.ndbBeacon.ringsSprite.visible = false;
        this.beacons.push(this.ndbBeacon);

        this.vorBeacon = new VorBeacon(this.game, 'Vor', new Position(0, 0));
        // this.vorBeacon.ringsSprite.visible = false;
        this.vorBeacon.addToWorld(this.myWorld);
        this.beacons.push(this.vorBeacon);

        this.aircraft = new Aircraft(new Position(-12, -1), 95, 150);
        // this.aircraft = new Aircraft(Position.getRandomPosition(this.myWorld.range));

        // **********************************************************
        // Mission

        this.mission = new Mission(this.game, this.aircraft, this.vorBeacon);
        this.mission.startMission(
            () => {
                // TODO Blink text or do something to catch the user's attention
                // this.missionText.addColor('#00FF00', 0);
            },
            () => {
                // this.missionText.addColor('#FF0000', 0);
            },
            () => {
                // this.missionText.addColor('#FFFF00', 0);
            }
        );

        // **********************************************************
        // Radar panel

        // World
        this.game.stage.backgroundColor = '#000000';

        this.createRadarPanel();

        // **********************************************************
        // Instrument Panel

        this.createInstrumentPanel();

        // **********************************************************
        // Control Panel

        this.createControlPanel();

        // **********************************************************
        // Keys

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.keys = this.game.input.keyboard.addKeys({
            'up': Phaser.KeyCode.W,
            'down': Phaser.KeyCode.S,
            'left': Phaser.KeyCode.A,
            'right': Phaser.KeyCode.D,
            'turnLeft': Phaser.KeyCode.Q,
            'turnRight': Phaser.KeyCode.E
        });

    }

    public update(): void {
        // Calculate velocity based on speed and heading (NM/h to px/s)
        let speedInPx = this.myWorld.convertSpeedToPx(this.aircraft.speed);
        let velocityX = speedInPx * Math.sin(Util.toRadians(this.aircraft.heading));
        let velocityY = -speedInPx * Math.cos(Util.toRadians(this.aircraft.heading));
        let windSpeedInPx = this.myWorld.convertSpeedToPx(this.wind.speed);
        let windVelocityX = -windSpeedInPx * Math.sin(Util.toRadians(this.wind.direction));
        let windVelocityY = windSpeedInPx * Math.cos(Util.toRadians(this.wind.direction));
        this.aircraftSprite.body.velocity.setTo(velocityX + windVelocityX, velocityY + windVelocityY);

        // Calculate angular velocity based on actual heading and new heading
        if (Math.abs(this.aircraft.heading - this.aircraft.apHeading) > this.AUTOPILOT_ERROR) {
            // start standard rate turn
            // TODO start and finish turns more realistic
            // FIXME better angle handling (normalise, differences, negative angles etc)
            let delta = this.aircraft.apHeading - this.aircraft.heading;
            let acc = -Math.pow(this.aircraftSprite.body.angularVelocity, 2) / 2 * 1;
            let dec = -Math.pow(this.aircraftSprite.body.angularVelocity, 2) / 2 * -1;
            // console.log(this.aircraftSprite.body.angularVelocity.toFixed(2), delta.toFixed(2), acc.toFixed(2), dec.toFixed(2));
            // Turn left
            if (delta > 180 || (delta < 0 && delta > -180)) {
                if (Math.abs(this.aircraft.heading - this.aircraft.apHeading) < dec) {
                    this.aircraftSprite.body.angularAcceleration = 1;
                } else {
                    if (this.aircraftSprite.body.angularVelocity > -3) {
                        this.aircraftSprite.body.angularAcceleration = -1;
                    } else {
                        this.aircraftSprite.body.angularAcceleration = 0;
                    }
                }
            }
            // Turn right
            else {
                if (Math.abs(this.aircraft.heading - this.aircraft.apHeading) < dec) {
                    this.aircraftSprite.body.angularAcceleration = -1;
                } else {
                    if (this.aircraftSprite.body.angularVelocity < 3) {
                        this.aircraftSprite.body.angularAcceleration = 1;
                    } else {
                        this.aircraftSprite.body.angularAcceleration = 0;
                    }
                }
            }
            let angle = this.aircraftSprite.angle;
            this.aircraft.heading = angle < 0 ? 360 + angle : angle;
        } else {
            this.aircraftSprite.body.angularAcceleration = 0;
            this.aircraftSprite.body.angularVelocity = 0;
        }

        // Update aircraft parameters
        this.aircraft.position.x = (this.aircraftSprite.x - this.myWorld.centerX) / this.myWorld.getPxPerNm();
        this.aircraft.position.y = (this.aircraftSprite.y - this.myWorld.centerY) / this.myWorld.getPxPerNm();
        // FIXME should find a generic way for dealing with angles (normalise/negative angles/diff between angles etc)
        let course = Util.toDegrees(Math.atan2(velocityY + windVelocityY, velocityX + windVelocityX)) + 90;
        this.aircraft.course = course < 0 ? course + 360 : course;
        this.aircraft.groundSpeed = this.myWorld.convertSpeedToKts(Math.sqrt(Math.pow(velocityX + windVelocityX, 2) + Math.pow(velocityY + windVelocityY, 2)));

        // Update Gauges
        // TODO Can be become an array of gauges (Gauge interface)
        this.gauges.forEach((gauge) => {
            gauge.update();
        });

        // Clock label
        this.clockLabel.setText(this.clockGauge.toString());

        // Aircraft Trail
        if (this.game.time.now > this.trailTime) {
            this.trailPositions.push(new Position(this.aircraft.position.x, this.aircraft.position.y));
            this.trailTime = this.game.time.now + this.TRAIL_SAMPLE;
            this.drawTrail();
        }

        // Keys just for debugging
        if (this.keys['down'].isDown) {
            this.aircraftSprite.body.velocity.y = this.aircraft.speed;
        }
        else if (this.keys['up'].isDown) {
            this.aircraftSprite.body.velocity.y = -this.aircraft.speed;
        }

        if (this.keys['right'].isDown) {
            this.aircraftSprite.body.velocity.x = this.aircraft.speed;
        }
        else if (this.keys['left'].isDown) {
            this.aircraftSprite.body.velocity.x = -this.aircraft.speed;
        }

        if (this.keys['turnRight'].isDown) {
            this.aircraft.setApHeading(this.aircraft.apHeading < 359 ? this.aircraft.apHeading + 1 : 0);
        }
        else if (this.keys['turnLeft'].isDown) {
            this.aircraft.setApHeading(this.aircraft.apHeading > 0 ? this.aircraft.apHeading - 1 : 359);
        }

        this.infoText.setText(this.getInfoText());
        // this.missionText.setText(this.mission.currentExercise.toString());
    }

    public render(): void {
        // this.game.debug.spriteInfo(this.aircraftSprite, this.aircraftSprite.position.x + 32, this.aircraftSprite.position.y + 32);
    }

}