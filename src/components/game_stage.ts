export enum GameState {
  NOT_START,
  ON_GOING,
  FINISHED
}

interface GameStageInterface {
  state: GameState;
}

export class GameStage {
  state: GameState

  constructor({state} : GameStageInterface) {
    this.state = state
  }
}
