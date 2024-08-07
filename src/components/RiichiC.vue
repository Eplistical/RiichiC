<script setup>
import { ref, computed, onMounted, onDeactivated } from 'vue'
import { Winds } from './seat_constants.ts'
import { AppMode, Lang } from './app_constants'
import { RulesetName, The3Q1LeagueRuleset, AssignRuleset } from './rulesets.ts'
import { Game } from './game.ts'
import RuleSetConfigurationBoard from './RuleSetConfigurationBoard.vue'
import GameBoard from './GameBoard.vue'
import HandResultsInputBoard from './HandResultsInputBoard.vue'
import { HandOutcomeEnum } from './hand'
import { PointsLadder } from './game_constants'
import { TickTimer } from './tick_timer'

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
  console.log('Save to storage')
  const to_save = {
    app_mode: app_mode.value,
    player_starting_winds: player_starting_winds.value,
    player_names: player_names.value,
    ruleset: ruleset.value,
    ruleset_to_load: ruleset_to_load.value,
    //tick_timer: tick_timer.value,
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
    if ('ruleset_to_load' in data) {
      ruleset_to_load.value = data.ruleset_to_load
      console.log('Loaded ruleset_to_load=', ruleset_to_load.value)
    }
    if ('ruleset' in data) {
      ruleset.value = data.ruleset
      console.log('Loaded ruleset=', ruleset.value)
    }
    /*
    if ('tick_timer' in data) {
      tick_timer.value = TickTimer.ParseFromObject(data.tick_timer)
      console.log('Loaded tick_timer=', tick_timer.value)
    }
      */
    if ('game' in data) {
      game.value = Game.ParseFromObject(data.game)
      console.log('Loaded game=', game.value)
    }
  }
  console.log('Load from storage Done')
}

const registered_players = ref([])
const player_names = ref([undefined, undefined, undefined, undefined])
//const player_names = ref(['__FP1', '__FP2', '__FP3', '__FP4'])
const player_starting_winds = ref([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
const ruleset_to_load = ref('THE_3Q1_LEAGUE')
const ruleset = ref({ ...The3Q1LeagueRuleset })
const game = ref(new Game())
const tick_timer = ref(undefined)
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
  if (ruleset.value.language == Lang.CN) {
    return `回到[${row.hand_signature}结束]并清空此后所有记录？`
  } else if (ruleset.value.language == Lang.EN) {
    return `Backtrack to [end of ${row.hand_signature}] and clean up logs thereafter?`
  }
}
const ConfirmFinishGameText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return `确定结束？`
  } else if (ruleset.value.language == Lang.EN) {
    return `Are you sure to end the game?`
  }
})
const ConfirmSetUpNewGameText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return `确定回到主界面？数据不会保存!`
  } else if (ruleset.value.language == Lang.EN) {
    return `Back to main panel? The game may not be saved!`
  }
})

const PlayerDuplicatedMsgText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return `玩家重复`
  } else if (ruleset.value.language == Lang.EN) {
    return `Duplicated player`
  }
})

const UnregisteredPlayersMsgText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return `存在未注册玩家，本游戏可能无法上传，确定继续？`
  } else if (ruleset.value.language == Lang.EN) {
    return `There are unregistered players and the game may not be uploadable, proceed?`
  }
})

const RulesetText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return `规则`
  } else if (ruleset.value.language == Lang.EN) {
    return `Ruleset`
  }
})

const GameInfoText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return '对局信息'
  } else if (ruleset.value.language == Lang.EN) {
    return 'Game Info'
  }
})

const HandReultsTitleText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return '对局结果'
  } else if (ruleset.value.language == Lang.EN) {
    return 'Hand Result'
  }
})

const StatsTitleText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return `统计`
  } else if (ruleset.value.language == Lang.EN) {
    return `Stats`
  }
})

const LogTitleText = computed(() => {
  if (ruleset.value.language == Lang.CN) {
    return `日志`
  } else if (ruleset.value.language == Lang.EN) {
    return `Log`
  }
})

function StartGame() {
  // check duplicated players
  let { duplicated, item } = HasDuplication(player_names.value)
  if (duplicated == true) {
    alert(`${PlayerDuplicatedMsgText.value}: ${item}`)
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
  // alert about unregistered players
  let unregistered_players = []
  if (registered_players.value) {
    for (let player_name of player_names.value) {
      if (!registered_players.value.includes(player_name)) {
        unregistered_players.push(player_name)
      }
    }
  }
  if (unregistered_players.length > 0) {
    if (!confirm(`${UnregisteredPlayersMsgText.value} ${unregistered_players}`)) {
      return
    }
  }
  const [success, msg] = game.value.InitGame({
    ruleset: ruleset.value,
    player_names: player_names.value,
    player_starting_winds: player_starting_winds.value
  })
  if (!success) {
    alert(msg)
    return
  }
  // set up timer
  /*
  if (ruleset.value.total_minutes > 0) {
    tick_timer.value = new TickTimer(ruleset.value.total_minutes)
  } else {
    tick_timer.value = null
  }
    */
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

// pre-process hand results form
function ResolveHandResultsFromHandResultsForm(hand_results_form) {
  let hand_results = { ...hand_results_form }
  if (
    hand_results.outcome == HandOutcomeEnum.TSUMO ||
    hand_results.outcome == HandOutcomeEnum.RON
  ) {
    if (!hand_results.winner) {
      hand_results.winner = []
    } else if (!Array.isArray(hand_results.winner)) {
      hand_results.winner = [hand_results.winner]
    }

    hand_results.han = []
    hand_results.fu = []
    hand_results.pao = []
    for (let winner of hand_results.winner) {
      hand_results.han.push(hand_results[`${winner}_han`])
      if (hand_results[`${winner}_han`] in PointsLadder || !hand_results[`${winner}_fu`]) {
        hand_results.fu.push(null)
      } else {
        hand_results.fu.push(hand_results[`${winner}_fu`])
      }
      if (hand_results[`${winner}_pao`]) {
        hand_results.pao.push(hand_results[`${winner}_pao`])
      } else {
        hand_results.pao.push(null)
      }
      delete hand_results[`${winner}_han`]
      delete hand_results[`${winner}_fu`]
      delete hand_results[`${winner}_pao`]
    }
  }

  if (hand_results.han && !Array.isArray(hand_results.han)) {
    hand_results.han = [hand_results.han]
    if (hand_results.fu === undefined) {
      hand_results.fu = [null]
    } else {
      hand_results.fu = [hand_results.fu]
    }
  }
  console.log('resolved hand results = ', hand_results)
  return hand_results
}

function SubmitHandResultsForm() {
  console.log('SubmitHandResultsForm')
  const hand_finished = game.value.FinishCurrentHand(
    ResolveHandResultsFromHandResultsForm(hand_results_form.value)
  )
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

function HandleLoadRuleset() {
  console.log('loading ruleset: ', ruleset_to_load.value)
  AssignRuleset(ruleset.value, ruleset_to_load.value)
  SaveToStorage()
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
            v-model:registered_players="registered_players"
            :num_players="ruleset.num_players"
            :language="ruleset.language"
            :ruleset_id="ruleset_to_load"
          />
        </div>
        <div class="ruleset_configuration_board">
          <RuleSetConfigurationBoard
            :language="ruleset.language"
            v-model:ruleset="ruleset"
            v-model:ruleset_to_load="ruleset_to_load"
            @loadRuleset="HandleLoadRuleset"
          />
        </div>
      </div>

      <!-- On-going & Finished Game -->
      <div v-else>
        <div class="gameboard">
          <GameBoard
            :game="game"
            :language="ruleset.language"
            :tick_timer="tick_timer"
            @saveState="SaveToStorage"
          />
        </div>

        <el-collapse class="game_info_board">
          <el-collapse-item :title="`${GameInfoText}`">
            <el-tabs>
              <el-tab-pane :label="HandReultsTitleText" v-if="game.IsOnGoing()">
                <div class="hand_results_input_board">
                  <HandResultsInputBoard
                    v-model="hand_results_form"
                    :language="ruleset.language"
                    :game="game"
                    @submit="SubmitHandResultsForm"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane :label="StatsTitleText" v-if="game.IsFinished()">
                <div class="game_stats_board">
                  <GameStatsBoard :game="game" @gameUploaded="GameUploaded" />
                </div>
              </el-tab-pane>
              <el-tab-pane :label="LogTitleText">
                <div class="game_log_board">
                  <GameLogBoard
                    :language="ruleset.language"
                    :game_logs="game.log"
                    :players="game.players"
                    :ruleset="game.ruleset"
                    :backtrace_enabled="true"
                    @resetLog="HandleResetGameLog"
                  />
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-collapse-item>
        </el-collapse>
      </div>
      <el-divider> {{ RulesetName[ruleset.id][ruleset.language] }} </el-divider>
      <!-- Game control buttons -->
      <div class="game_control_board">
        <GameControlBoard
          :ruleset_id="ruleset.id"
          :game="game"
          v-model="ruleset.language"
          @startGame="StartGame"
          @finishGame="FinishGame"
          @newGame="SetUpNewGame"
          @toLeaderBoard="EnterLeaderBoardMode"
        />
      </div>
    </div>
    <div v-else-if="app_mode == AppMode.LEADER_BOARD">
      <div class="leader_board">
        <LeaderBoard
          class="leader_board"
          :language="ruleset.language"
          :ruleset_id="ruleset.id"
          @toGame="EnterGameMode"
        />
      </div>
    </div>
  </div>
  {{ hand_results_form }}
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
  border-width: 2px;
  width: 98vw;
  height: 70vh;
  margin-left: calc(50% - 49vw);
  margin-top: 1vh;
  margin-bottom: 1vh;
  background-color: white;
  color: black;
}
.game_info_board {
  margin-top: 0px;
  margin-bottom: 0px;
}
.game_control_board {
  margin-top: 0px;
  margin-bottom: 0px;
}
</style>
