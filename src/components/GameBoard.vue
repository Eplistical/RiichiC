<script setup>
import { Game } from './game'
import { computed } from 'vue'
import { PlayerIdsInOrder } from './players'
import { Lang } from './app_constants'

const props = defineProps({
  language: String,
  game: Game
})
const riichi_players = defineModel()

const GameIsOnGoing = computed(() => {
  return props.game.IsOnGoing()
})

const GameIsFinished = computed(() => {
  return props.game.IsFinished()
})

function HandlePlayerRiichi(player_id, riichi) {
  console.log(`HandlePlayerRiichi: ${player_id}, ${riichi}`)
  if (riichi == true) {
    props.game.PlayerRiichi(player_id)
  } else {
    props.game.PlayerUnRiichi(player_id)
  }
}

function GetHandInfoBoardClass() {
  if (props.language == Lang.EN) {
    return 'hand_info_board_en'
  } else {
    return 'hand_info_board_cn'
  }
}
</script>

<template>
  <div :class="GetHandInfoBoardClass()">
    <HandInfoBoard :language="language" :hand="game.current_hand" :game_finished="GameIsFinished" />
  </div>

  <div v-for="player_id in PlayerIdsInOrder" :class="`${player_id}_player_board`">
    <PlayerBoard
      v-model="riichi_players"
      :language="language"
      :player_id="player_id"
      :current_hand_index="game.GetCurrentHandIndex()"
      :players="game.players"
      :riichi_disabled="!GameIsOnGoing"
      :last_hand_points_delta="game.GetLastHandPointsDelta()"
      @riichi="HandlePlayerRiichi(player_id, $event)"
    />
  </div>
</template>

<style scoped>
.hand_info_board_cn {
  border-style: solid;
  text-align: center;
  position: absolute;
  height: 70px;
  width: 70px;
  top: calc(50% - 35px);
  left: calc(50% - 35px);
  font-size: 15px;
}
.hand_info_board_en {
  border-style: solid;
  text-align: center;
  position: absolute;
  height: 70px;
  width: 120px;
  top: calc(50% - 35px);
  left: calc(50% - 60px);
  font-size: 15px;
}

.east_player_board,
.south_player_board,
.west_player_board,
.north_player_board {
  position: absolute;
  text-align: center;
  width: 240px;
  height: 100px;
  font-size: 20px;
}
.east_player_board {
  transform: rotate(0deg);
  bottom: 0;
  left: calc(50% - 120px);
}
.south_player_board {
  transform: rotate(270deg);
  right: -70px;
  bottom: calc(50% - 50px);
}
.west_player_board {
  transform: rotate(180deg);
  top: 0;
  left: calc(50% - 120px);
}
.north_player_board {
  transform: rotate(90deg);
  left: -70px;
  bottom: calc(50% - 50px);
}
</style>
