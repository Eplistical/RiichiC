<script setup>
import { ref, computed, onMounted, onDeactivated } from 'vue'
import { Winds } from './seat_constants.ts'
import { AppMode } from './app_constants'
import { MLeagueRuleset } from './rulesets.ts'
import { Game } from './game.ts'
import RuleSetConfigurationBoard from './RuleSetConfigurationBoard.vue'
import GameBoard from './GameBoard.vue'
import HandResultsInputBoard from './HandResultsInputBoard.vue'

function preventRefresh(event) {
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', preventRefresh)
  LoadFromStorage()
})

onDeactivated(() => {
  window.removeEventListener('beforeunload', preventRefresh)
})

function SaveToStorage() {
  const to_save = {
    app_mode: app_mode.value,
    player_starting_winds: player_starting_winds.value,
    player_names: player_names.value,
    ruleset: ruleset.value,
    game: game.value,
    timestamp: new Date()
  }
  localStorage.setItem('data', JSON.stringify(to_save))
}

function LoadFromStorage() {
  console.log('Load from storage')
  let data = localStorage.getItem('data')
  const current_time = new Date()
  data = data ? JSON.parse(data) : undefined
  if (data) {
    if (data.timestamp) {
      const t = new Date(data.timestamp)
      if (current_time - t > 1000 * 60 * 60 * 12 /*12h*/) {
        console.log(
          'storage timestamp=',
          data.timestamp,
          ' current time=',
          current_time,
          ' cache is too old, not loading'
        )
        localStorage.removeItem('data')
        return
      }
    }
    if ('app_mode' in data) {
      app_mode.value = data.app_mode
      console.log('Loaded app_mode=', app_mode.value)
    }
    if ('player_starting_winds' in data) {
      player_starting_winds.value = data.player_starting_winds
      console.log('Loaded player_starting_winds=', player_starting_winds.value)
    }
    if ('player_names' in data) {
      player_names.value = data.player_names
      console.log('Loaded player_names=', player_names.value)
    }
    if ('ruleset' in data) {
      ruleset.value = data.ruleset
      console.log('Loaded ruleset=', ruleset.value)
    }
    if ('game' in data) {
      game.value = Game.ParseFromObject(data.game)
      console.log('Loaded game=', game.value)
    }
  }
  console.log('Load from storage Done')
}

const player_names = ref([undefined, undefined, undefined, undefined])
const player_starting_winds = ref([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
const ruleset = ref({ ...MLeagueRuleset })
const game = ref(new Game())
const hand_results_form = ref({})
const app_mode = ref(AppMode.GAME)

function HasDuplication(arr) {
  let seen = []
  for (const x of arr) {
    if (seen.includes(x) == true) {
      return {
        duplicated: true,
        item: x
      }
    }
    seen.push(x)
  }
  return {
    duplicated: false,
    item: null
  }
}

function ConfirmResetGameLogText(row) {
  return `回到[${row.hand_signature}结束]并清空此后所有记录？`
}
const ConfirmFinishGameText = computed(() => {
  return `确定结束？`
})
const ConfirmSetUpNewGameText = computed(() => {
  return `确定开始新游戏？数据不会保存!`
})

function StartGame() {
  let { duplicated, item } = HasDuplication(player_names.value)
  if (duplicated == true) {
    alert(`玩家重复: ${item}`)
    return
  }
  console.log(
    'Start game with players: ',
    player_names.value,
    ', player starting winds: ',
    player_starting_winds.value,
    ' and ruleset: ',
    ruleset.value
  )
  const [success, msg] = game.value.InitGame({
    ruleset: ruleset.value,
    player_names: player_names.value,
    player_starting_winds: player_starting_winds.value
  })
  if (!success) {
    alert(msg)
    return
  }
  game.value.Start()
  game.value.StartCurrentHand()
  SaveToStorage()
}

function SetUpNewGame() {
  if (!confirm(ConfirmSetUpNewGameText.value)) {
    return
  }
  game.value = new Game()
  SaveToStorage()
}

function FinishGame() {
  console.log('FinishGame')
  if (!confirm(ConfirmFinishGameText.value)) {
    return
  }
  if (game.value.Finish()) {
    hand_results_form.value = {}
  }
  SaveToStorage()
}

function GameUploaded(game_id) {
  console.log('GameUploaded, ', game_id)
  game.value.SetGameId(game_id)
  SaveToStorage()
}

function EnterLeaderBoardMode() {
  app_mode.value = AppMode.LEADER_BOARD
  SaveToStorage()
}

function EnterGameMode() {
  app_mode.value = AppMode.GAME
  SaveToStorage()
}

function SubmitHandResultsForm() {
  console.log('SubmitHandResultsForm')
  const hand_finished = game.value.FinishCurrentHand(hand_results_form.value)
  console.log('hand_finished = ', hand_finished)
  if (hand_finished) {
    game.value.SaveHandLog()
    game.value.SetUpNextHandOrFinishGame()
    game.value.StartCurrentHand()
    hand_results_form.value = {}
    SaveToStorage()
  }
}

function HandleResetGameLog(index, row) {
  console.log('HandleResetGameLog: ', index, ' ', row)
  if (!confirm(ConfirmResetGameLogText(row))) {
    return
  }
  if (row.log_index >= game.value.log.length) {
    alert(`cannot reset: log index ${row.log_index} >= log length ${game.value.log.length}`)
  }
  const hand_changed = game.value.ResetToPreviousFinishedHand(row.log_index)
  if (hand_changed && game.value.current_hand.has_next_hand) {
    // hands in log must be finished, thus we can move to next hand.
    game.value.SetUpNextHandOrFinishGame()
    game.value.StartCurrentHand()
    hand_results_form.value = {}
    SaveToStorage()
  }
}
</script>

<template>
  <div class="app_board">
    <div v-if="app_mode == AppMode.GAME">
      <!-- Unstartd Game -->
      <div v-if="game.IsNotStarted()">
        <div class="player_name_configuration_board">
          <PlayerNameConfigurationBoard
            v-model:player_names="player_names"
            v-model:player_starting_winds="player_starting_winds"
            :num_players="ruleset.num_players"
          />
        </div>
        <div class="ruleset_configuration_board">
          <RuleSetConfigurationBoard v-model="ruleset" />
        </div>
      </div>

      <!-- On-going & Finished Game -->
      <div v-else>
        <div class="gameboard">
          <GameBoard :game="game" v-model="hand_results_form.riichi_players" />
        </div>

        <el-divider />

        <div class="hand_results_input_board" v-if="game.IsOnGoing()">
          <HandResultsInputBoard
            v-model="hand_results_form"
            :game="game"
            @submit="SubmitHandResultsForm"
          />
        </div>

        <div class="game_log_board">
          <GameLogBoard :game="game" @resetLog="HandleResetGameLog" />
        </div>
        <div class="game_stats_board" v-if="game.IsFinished()">
          <GameStatsBoard :game="game" @gameUploaded="GameUploaded" />
        </div>
      </div>

      <el-divider />

      <!-- Game control buttons -->
      <div class="game_control_board">
        <GameControlBoard
          :game="game"
          @startGame="StartGame"
          @finishGame="FinishGame"
          @newGame="SetUpNewGame"
          @toLeaderBoard="EnterLeaderBoardMode"
        />
      </div>
    </div>
    <div v-else-if="app_mode == AppMode.LEADER_BOARD">
      <div class="leader_board">
        <LeaderBoard class="leader_board" @toGame="EnterGameMode" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app_board {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: white;
  color: black;
}
.gameboard {
  position: relative;
  border-style: solid;
  width: 320px;
  height: 480px;
  margin-left: calc(50% - 160px);
  margin-top: 30px;
  margin-bottom: 30px;
  background-color: white;
  color: black;
}
</style>
