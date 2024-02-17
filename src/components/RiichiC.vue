<script setup></script>

<template>
  <div class="app_board">
    <!-- Unstartd Game -->
    <div v-if="GameIsNotStarted">
      <div class="player_name_configuration_board">
        <PlayerNameConfigurationBoard v-model="player_names" :num_players="ruleset.num_players" />
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

      <div class="hand_results_input_board" v-if="GameIsOnGoing">
        <HandResultsInputBoard
          v-model="hand_results_form"
          :game="game"
          @submit="SubmitHandResultsForm"
        />
      </div>

      <div class="game_log_board">
        <GameLogBoard :game="game" @resetLog="HandleResetGameLog" />
      </div>

      <div class="game_stats_board" v-if="GameIsFinished">
        <GameStatsBoard :game="game" />
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
      />
    </div>
  </div>
</template>

<script>
import { ElButton } from 'element-plus'
import { Winds, WindsInOrder, WindsDisplayTextMap } from './seat_constants.ts'
import { HandOutcomeEnum, HandOutcomeEnumDisplayTextMap } from './hand.ts'
import {
  PointsLadder,
  PointsLadderDisplayMap,
  PointsLadderBriefDisplayMap,
  AllowedHans,
  AllowedFus,
  NumberDisplayMap
} from './game_constants.ts'
import { MLeagueRuleset } from './rulesets.ts'
import { PlayerIdsInOrder } from './players.ts'
import { Game, GameState } from './game.ts'
import RuleSetConfigurationBoard from './RuleSetConfigurationBoard.vue'
import GameBoard from './GameBoard.vue'
import HandResultsInputBoard from './HandResultsInputBoard.vue'

export default {
  name: 'RiichiC',
  components: {
    ElButton
  },
  setup() {},
  mounted() {},
  beforeMount() {
    window.addEventListener('beforeunload', this.preventRefresh)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.preventRefresh)
  },
  data() {
    return {
      player_names: ['赤木', '原田', '瓦西子', '天'],
      ruleset: { ...MLeagueRuleset },
      game: new Game(),
      hand_results_form: {},

      Winds: Winds,
      WindsInOrder: WindsInOrder,
      WindsDisplayTextMap: WindsDisplayTextMap,
      PlayerIdsInOrder: PlayerIdsInOrder,
      HandOutcomeEnum: HandOutcomeEnum,
      HandOutcomeEnumDisplayTextMap: HandOutcomeEnumDisplayTextMap,
      PointsLadder: PointsLadder,
      PointsLadderDisplayMap: PointsLadderDisplayMap,
      PointsLadderBriefDisplayMap: PointsLadderBriefDisplayMap,
      AllowedHans: AllowedHans,
      AllowedFus: AllowedFus
    }
  },
  computed: {
    GameIsNotStarted() {
      return this.game.state == GameState.NOT_STARTED
    },
    GameIsOnGoing() {
      return this.game.state == GameState.ON_GOING
    },
    GameIsFinished() {
      return this.game.state == GameState.FINISHED
    },
    CurrentHandText() {
      return `${WindsDisplayTextMap[this.game.current_hand.round_wind]}${this.game.current_hand.hand}局${this.game.current_hand.honba}本场`
    },
    RiichiSticksText() {
      return `供托: ${this.game.current_hand.riichi_sticks}`
    },
    GameLogBoard() {
      let board = []
      for (let i = 0; i < this.game.log.length; ++i) {
        const log = this.game.log[i]
        const hand = log.hand
        const players = log.players
        const last_log = i > 0 ? this.game.log[i - 1] : null
        const last_hand = last_log ? last_log.hand : null
        const last_hand_players = last_log ? last_log.players : null
        let row = {}
        row.log_index = i
        row.hand_signature = `${WindsDisplayTextMap[hand.round_wind]}${hand.hand}-${hand.honba}`
        row.end_game_riichi_sticks = hand.riichi_sticks
        row.start_game_riichi_sticks = last_hand ? last_hand.riichi_sticks : 0
        row.results_summary = `${HandOutcomeEnumDisplayTextMap[hand.results.outcome]}`

        if (
          hand.results.outcome == HandOutcomeEnum.RON ||
          hand.results.outcome == HandOutcomeEnum.TSUMO
        ) {
          if (typeof hand.results.han == 'string') {
            row.results_summary += `[${PointsLadderBriefDisplayMap[hand.results.han]}]`
          } else {
            row.results_summary += `[${hand.results.han},${hand.results.fu}]`
          }
        }
        for (const player_id of PlayerIdsInOrder) {
          const end_hand_pt = players.GetPlayer(player_id).points
          const start_hand_pt = last_hand_players
            ? last_hand_players.GetPlayer(player_id).points
            : this.game.ruleset.starting_points
          const pt_delta = end_hand_pt - start_hand_pt
          row[player_id] = `${end_hand_pt}`
          if (pt_delta > 0) {
            row[player_id] += `(+${pt_delta})`
          } else if (pt_delta < 0) {
            row[player_id] += `(${pt_delta})`
          }
          if (hand.riichi.has(player_id)) {
            row[player_id] += `[立]`
          }
          if (
            hand.results.outcome == HandOutcomeEnum.DRAW &&
            hand.results.tenpai.includes(player_id)
          ) {
            row[player_id] += `[听]`
          }
          if (
            (hand.results.outcome == HandOutcomeEnum.TSUMO ||
              hand.results.outcome == HandOutcomeEnum.RON) &&
            hand.results.winner == player_id
          ) {
            row[player_id] += `[和]`
          }
          if (hand.results.outcome == HandOutcomeEnum.RON && hand.results.deal_in == player_id) {
            row[player_id] += `[铳]`
          }
        }
        board.push(row)
      }
      return board.reverse()
    },
    GameStatsBoard() {
      console.log('Generate GameStatsBoard')
      let board = []
      // scan log to compute stats
      for (const player_id of PlayerIdsInOrder) {
        let row = {}
        row.points = this.GetPlayerPoints(player_id)
        // find players rank from current hand
        if (this.game.players) {
          const current_points = this.game.players
            ? this.game.players.GetPlayers(PlayerIdsInOrder).map((p) => p.points)
            : [0, 0, 0, 0]
          const pt = this.game.players.GetPlayer(player_id).points
          row.rank = current_points.reduce((acc, val) => {
            return val > pt ? acc + 1 : acc
          }, 1)
        } else {
          row.rank = -1
        }
        row.player = `${this.GetPlayerName(player_id)}[${WindsDisplayTextMap[player_id]}起][${NumberDisplayMap[row.rank]}位]`
        // loop log to compute game stats
        let stats = {
          riichi: 0,
          agari: 0,
          tsumo: 0,
          ron: 0,
          deal_in: 0,
          riichi_agari: 0,
          riichi_tsumo: 0,
          riichi_ron: 0,
          riichi_deal_in: 0,
          tenpai_on_draw: 0,
          agari_over_mangan: 0,
          deal_in_over_mangan: 0
        }
        this.game.log.forEach((log) => {
          const hand = log.hand
          const player_riichi = log.hand.riichi && log.hand.riichi.has(player_id)
          if (player_riichi) {
            stats.riichi += 1
          }
          if (
            hand.results.outcome == HandOutcomeEnum.DRAW &&
            hand.results.tenpai &&
            hand.results.tenpai.includes(player_id)
          ) {
            stats.tenpai_on_draw += 1
          }
          if (hand.results.outcome != HandOutcomeEnum.DRAW && hand.results.winner == player_id) {
            stats.agari += 1
            if (player_riichi) {
              stats.riichi_agari += 1
            }
            if (hand.results.outcome != HandOutcomeEnum.RON) {
              stats.riichi_ron += 1
            }
            if (hand.results.outcome != HandOutcomeEnum.TSUMO) {
              stats.riichi_tsumo += 1
            }
            if (hand.results.han in PointsLadder) {
              stats.agari_over_mangan += 1
            }
          }
          if (hand.results.outcome == HandOutcomeEnum.RON && hand.results.deal_in == player_id) {
            stats.deal_in += 1
            if (player_riichi) {
              stats.riichi_deal_in += 1
            }
            if (hand.results.han in PointsLadder) {
              stats.deal_in_over_mangan += 1
            }
          }
        })
        stats.riichi_agari_rate = stats.riichi ? stats.riichi_agari / stats.riichi : 0.0
        stats.riichi_tsumo_rate = stats.riichi ? stats.riichi_tsumo / stats.riichi : 0.0
        stats.riichi_deal_in_rate = stats.riichi ? stats.riichi_deal_in / stats.riichi : 0.0
        stats.agari_with_over_mangan_agari = `${stats.agari}(${stats.agari_over_mangan})`
        stats.deal_in_with_over_mangan_deal_in = `${stats.deal_in}(${stats.deal_in_over_mangan})`
        Object.assign(row, stats)
        board.push(row)
      }
      return board
    }
  },
  methods: {
    StartGame() {
      console.log(
        `Start game with players ${JSON.stringify(this.player_names)} and ruleset ${JSON.stringify(this.ruleset)}`
      )
      this.game.InitGame({ ruleset: this.ruleset, player_names: this.player_names })
      this.game.Start()
      this.game.StartCurrentHand()
    },
    SetUpNewGame() {
      if (!confirm('确定开始新游戏？数据不会保存!')) {
        return
      }
      this.game = new Game()
    },
    FinishGame() {
      console.log('FinishGame')
      if (!confirm(`确定结束？`)) {
        return
      }
      if (this.game.Finish()) {
        this.hand_results_form = {}
      }
    },
    HandlePlayerRiichi(player_id, riichi) {
      console.log(`HandlePlayerRiichi: ${player_id}, ${riichi}`)
      if (riichi == true) {
        this.game.PlayerRiichi(player_id)
      } else {
        this.game.PlayerUnRiichi(player_id)
      }
    },
    SubmitHandResultsForm() {
      console.log('SubmitHandResultsForm')
      const hand_finished = this.game.FinishCurrentHand(this.hand_results_form)
      if (hand_finished) {
        this.game.SaveHandLog()
        this.game.SetUpNextHandOrFinishGame()
        this.game.StartCurrentHand()
        this.hand_results_form = {}
      }
    },
    HandleResetGameLog(index, row) {
      console.log('HandleResetGameLog: ', index, ' ', row)
      if (!confirm(`确定重置？`)) {
        return
      }
      if (row.log_index >= this.game.log.length) {
        alert(`cannot reset: log index ${row.log_index} >= log length ${this.game.log.length}`)
      }
      const hand_changed = this.game.ResetToPreviousFinishedHand(row.log_index)
      if (hand_changed && this.game.current_hand.has_next_hand) {
        // hands in log must be finished, thus we can move to next hand.
        this.game.SetUpNextHandOrFinishGame()
        this.game.StartCurrentHand()
        this.hand_results_form = {}
      }
    },
    GetPlayerName(player_id) {
      return this.game.players.GetPlayer(player_id).name
    },
    GetPlayerCurrentWind(player_id) {
      return this.game.players.GetPlayer(player_id).current_wind
    },
    GetPlayerPoints(player_id) {
      return this.game.players.GetPlayer(player_id).points
    },
    IsDealer(player_id) {
      return this.game.players.GetPlayer(player_id).IsDealer()
    },
    preventRefresh(event) {
      event.preventDefault()
      event.returnValue = ''
    }
  }
}
</script>

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

.player_name_input {
  position: relative;
  font-size: 16px;
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
