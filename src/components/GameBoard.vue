<script setup>
import { Game } from './game'
import { computed } from 'vue'
import { PlayerIdsInOrder } from './players'
import { Lang } from './app_constants'
import { TickTimer } from './tick_timer'

const props = defineProps({
  language: String,
  game: Game,
  tick_timer: TickTimer
})

const emit = defineEmits(['saveState'])

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
    <HandInfoBoard
      :language="language"
      :hand="game.current_hand"
      :game_finished="GameIsFinished"
      :tick_timer="tick_timer"
      @saveState="$emit('saveState')"
    />
  </div>

  <div v-for="player_id in PlayerIdsInOrder" :class="`${player_id}_player_board`">
    <PlayerBoard
      :language="language"
      :player_id="player_id"
      :current_hand_index="game.GetCurrentHandIndex()"
      :players="game.players"
      :riichied="game.current_hand.PlayerRiichied(player_id)"
      :riichi_disabled="!GameIsOnGoing"
      :last_hand_points_delta="game.GetLastHandPointsDelta()"
      @riichi="HandlePlayerRiichi(player_id, $event)"
    />
  </div>
</template>

<style scoped>
.hand_info_board_cn,
.hand_info_board_en {
  border-style: solid;
  border-width: 2px;
  text-align: center;
  position: absolute;
  height: 24vw;
  top: calc(50% - 10vw);
  font-size: 5vw;
}

.hand_info_board_cn {
  width: 32vw;
  left: calc(50% - 16vw);
}

.hand_info_board_en {
  width: 32vw;
  left: calc(50% - 16vw);
}

.east_player_board,
.south_player_board,
.west_player_board,
.north_player_board {
  position: absolute;
  text-align: center;
  width: 72vw;
  height: 28vw;
  font-size: 6vw;
}
.east_player_board {
  transform: rotate(0deg);
  bottom: 0;
  left: calc(50% - 36vw);
}
.south_player_board {
  transform: rotate(270deg);
  right: -22vw;
  bottom: calc(50% - 14vw);
}
.west_player_board {
  transform: rotate(180deg);
  top: 0;
  left: calc(50% - 36vw);
}
.north_player_board {
  transform: rotate(90deg);
  left: -22vw;
  bottom: calc(50% - 14vw);
}
</style>
