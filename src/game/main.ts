import { AUTO, Game, Scene } from 'phaser';

class MainScene extends Scene
{
    constructor ()
    {
        super('main');
    }

    create ()
    {
        this.add.text(512, 384, 'Phaser project ready', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#1d1d1d',
    scene: [MainScene]
};

const StartGame = (parent: string) => new Game({ ...config, parent });

export default StartGame;
