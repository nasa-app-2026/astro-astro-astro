import { AUTO, Game, Scale } from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { chapterScenes } from './chapters';

export default function StartGame(parent: string): Game {
  return new Game({
    type: AUTO,
    width: 1024,
    height: 640,
    parent,
    backgroundColor: '#081427',
    scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
    scene: [MainMenuScene, ...chapterScenes],
  });
}
