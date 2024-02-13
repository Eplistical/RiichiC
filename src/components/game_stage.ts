export enum GameState {
  NOT_START,
  ON_GOING,
  FINISHED,
};

export class GameStage {
  state: GameState;
  honba: number;
  riichi_sticks: number;
}
