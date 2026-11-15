import { AUTO, Game, Scale } from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { SplashScene } from './scenes/SplashScene';
import { chapterScenes } from './chapters';

export default function StartGame(parent: string, onSplashReady: () => void): Game {
  return new Game({
    type: AUTO,
    width: 1024,
    height: 640,
    parent,
    backgroundColor: '#081427',
    scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
    scene: [new SplashScene(onSplashReady), MainMenuScene, ...chapterScenes],
  });
}
