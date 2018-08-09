import * as Assets from '../assets';
import * as AssetUtils from '../utils/assetUtils';

export default class Preloader extends Phaser.State {

    public preload(): void {
        AssetUtils.Loader.loadAllAssets(this.game, this.waitForSoundDecoding, this);
    }

    private waitForSoundDecoding(): void {
        AssetUtils.Loader.waitForSoundDecoding(this.startGame, this);
    }

    private startGame(): void {
        this.loadMain();
    }

    private loadMain(): void {
        this.game.state.start('main');
    }
}
