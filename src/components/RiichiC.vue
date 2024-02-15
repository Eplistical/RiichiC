<template>
  <div class="screen_div">
    <!-- unstartd game view -->
    <div v-if="GameIsNotStarted">
      <div v-for="i in ruleset.num_players" class="player_name_input">
        <el-row>
          <span> {{ WindsDisplayTextMap.wind_character[WindsOrder[i - 1]] }}起 </span>
          <el-input
            v-model="player_names[i - 1]"
            class="w-50 m-2"
            size="large"
            clearable
            placeholder="玩家名"
          />
        </el-row>
      </div>
      <el-button type="primary" @click="SetUpGame">开始游戏</el-button>
    </div>

    <!-- ongoing & finished game view -->
    <div v-else>
      <div class="gameboard">
        <div class="hand_info_board">
          <div>{{ CurrentHandText }}</div>
          <div>{{ RiichiSticksText }}</div>
          <div v-if="GameIsFinished">[游戏已结束]</div>
        </div>

        <div v-for="player_id in WindsOrder" :class="`${player_id}_player_board`">
          <div :class="IsDealer(player_id) ? `dealer_player_board` : `non_dealer_player_board`">
            <div>
              {{ GetPlayerName(player_id) }}[{{
                WindsDisplayTextMap.wind_character[GetPlayerCurrentWind(player_id)]
              }}]
            </div>
            <div>
              {{ GetPlayerPoints(player_id) }}
            </div>
          </div>
          <el-checkbox-group fill="#f7bc45" v-model="hand_results_form.riichi">
            <el-checkbox-button :label="player_id" @change="HandlePlayerRiichi(player_id, $event)">
              立直
            </el-checkbox-button>
          </el-checkbox-group>
        </div>
      </div>
      <el-divider />
    </div>

    <el-collapse v-if="GameIsOnGoing">
      <el-collapse-item title="对局结果">
        <!-- on-going game view -->
        <div v-if="GameIsOnGoing">
          <el-form :model="hand_results_form">
            <el-form-item label="">
              <el-radio-group
                v-for="outcome in HandOutcomeEnum"
                v-model="hand_results_form.outcome"
                size="default"
              >
                <el-radio-button :label="outcome">
                  {{ HandOutcomeEnumDisplayTextMap[outcome] }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item
              label="听牌"
              v-if="hand_results_form.outcome == HandOutcomeEnum.DRAW"
              size="default"
            >
              <el-checkbox-group fill="#289e20" v-model="hand_results_form.tenpai">
                <el-checkbox-button v-for="player_id in WindsOrder" :label="player_id">
                  {{ GetPlayerName(player_id) }}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item
              label="胡牌"
              v-if="
                hand_results_form.outcome == HandOutcomeEnum.TSUMO ||
                hand_results_form.outcome == HandOutcomeEnum.RON
              "
            >
              <el-radio-group
                fill="#289e20"
                v-for="player_id in WindsOrder"
                v-model="hand_results_form.winner"
                size="default"
              >
                <el-radio-button :label="player_id">
                  {{ GetPlayerName(player_id) }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="点炮" v-if="hand_results_form.outcome == HandOutcomeEnum.RON">
              <el-radio-group
                fill="#e86161"
                v-for="player_id in WindsOrder"
                v-model="hand_results_form.deal_in"
                size="default"
                :disabled="player_id == hand_results_form.winner"
              >
                <el-radio-button :label="player_id">
                  {{ GetPlayerName(player_id) }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item
              label="番"
              v-if="
                hand_results_form.outcome == HandOutcomeEnum.TSUMO ||
                hand_results_form.outcome == HandOutcomeEnum.RON
              "
            >
              <el-radio-group
                v-for="han in AllowedHans"
                v-model="hand_results_form.han"
                size="default"
              >
                <el-radio-button :label="han">{{
                  han in PointsLadderDisplayMap ? PointsLadderBriefDisplayMap[han] : han
                }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="符"
              v-if="
                hand_results_form.outcome == HandOutcomeEnum.TSUMO ||
                hand_results_form.outcome == HandOutcomeEnum.RON
              "
            >
              <el-radio-group
                v-for="fu in AllowedFus[hand_results_form.han]"
                v-model="hand_results_form.fu"
                size="default"
                :disabled="hand_results_form.han in PointsLadderDisplayMap"
              >
                <el-radio-button :label="fu" />
              </el-radio-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="SubmitHandResultsForm">提交</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-collapse v-if="!GameIsNotStarted">
      <el-collapse-item title="日志">
        <el-table :data="GameLogBoard" style="width: 100%" stripe>
          <el-table-column fixed prop="hand_signature" label="场" />
          <el-table-column prop="start_game_riichi_sticks" label="开局供托" />
          <el-table-column prop="results_summary" label="结局" />
          <el-table-column
            v-for="player_id in WindsOrder"
            :prop="player_id"
            :label="GetPlayerName(player_id)"
          />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
                type="warning"
                @click="HandleResetGameLog(scope.$index, scope.row)"
                >重置</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>

    <el-collapse v-if="GameIsFinished">
      <el-collapse-item title="统计">
        <el-table :data="GameStatsBoard" style="width: 100%" stripe>
          <el-table-column prop="player" label="玩家" />
          <el-table-column prop="rank" label="排名" />
          <el-table-column prop="riichi" label="立直" />
          <el-table-column prop="agari" label="和牌" />
          <el-table-column prop="deal_in" label="放铳" />
          <el-table-column prop="tenpai_on_draw" label="流局听牌" />
          <el-table-column
            prop="riichi_agari_rate"
            label="立直和牌"
            :formatter="(x) => x.riichi_agari_rate.toFixed(2)"
          />
          <el-table-column
            prop="riichi_tsumo_rate"
            label="立直自摸"
            :formatter="(x) => x.riichi_tsumo_rate.toFixed(2)"
          />
          <el-table-column
            prop="riichi_deal_in_rate"
            label="立直放铳"
            :formatter="(x) => x.riichi_deal_in_rate.toFixed(2)"
          />
          <el-table-column prop="agari_over_mangan" label="满上大和" />
          <el-table-column prop="deal_in_over_mangan" label="满上大铳" />
        </el-table>
      </el-collapse-item>
    </el-collapse>

    <el-divider />

    <div v-if="GameIsOnGoing">
      <el-button type="danger" @click="FinishGame">结束游戏</el-button>
    </div>

    <div v-if="GameIsFinished">
      <el-button type="primary" @click="SetUpNewGame">新对局</el-button>
    </div>
  </div>
</template>

<script>
import { ElButton } from 'element-plus'
import { ref } from 'vue'
import {
  Winds,
  WindsOrder,
  NextWindMap,
  LastWindMap,
  WindsDisplayTextMap
} from './seat_constants.ts'
import {
  HandOutcomeEnum,
  RemoveUnusedFieldsForHandResults,
  MaybeApplyRoundUpMangan,
  HandOutcomeEnumDisplayTextMap
} from './hand.ts'
import {
  PointsLadder,
  PointsLadderDisplayMap,
  PointsLadderBriefDisplayMap,
  AllowedHans,
  AllowedFus,
  RonPointsDealer,
  RonPointsNonDealer,
  TsumoPointsDealer,
  TsumoPointsNonDealer
} from './game_constants.ts'
import { MLeagueRuleset } from './rulesets.ts'
import { Hand, HandState } from './hand.ts'
import { Game, GameState } from './game.ts'

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
      ruleset: MLeagueRuleset,
      game: new Game(),
      hand_results_form: {},

      Winds: Winds,
      WindsOrder: WindsOrder,
      WindsDisplayTextMap: WindsDisplayTextMap,
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
      return `${WindsDisplayTextMap.wind_character[this.game.current_hand.round_wind]}${this.game.current_hand.hand}局${this.game.current_hand.honba}本场`
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
        row.hand_signature = `${WindsDisplayTextMap.wind_character[hand.round_wind]}${hand.hand}-${hand.honba}`
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
        for (const player_id of WindsOrder) {
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
          if (hand.results.outcome == HandOutcomeEnum.DRAW && hand.results.tenpai.has(player_id)) {
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
      for (const player_id of WindsOrder) {
        let row = {}
        row.player = `${this.GetPlayerName(player_id)}[${WindsDisplayTextMap.wind_character[player_id]}起]`
        // find players rank from current hand
        if (this.game.players) {
          const current_points = this.game.players
            ? this.game.players.GetPlayers(WindsOrder).map((p) => p.points)
            : [0, 0, 0, 0]
          const pt = this.game.players.GetPlayer(player_id).points
          console.log(player_id, ' current pt: ', current_points, ' pt = ', pt)
          row.rank = current_points.reduce((acc, val) => {
            return val > pt ? acc + 1 : acc
          }, 1)
        } else {
          row.rank = -1
        }
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
            hand.results.tenpai.has(player_id)
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
        Object.assign(row, stats)
        board.push(row)
      }
      return board
    }
  },
  methods: {
    SetUpGame() {
      console.log(
        `Set up game with players ${JSON.stringify(this.player_names)} and ruleset ${JSON.stringify(this.ruleset)}`
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
      this.game.Finish()
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

      let hand_results = RemoveUnusedFieldsForHandResults(this.hand_results_form)
      hand_results = MaybeApplyRoundUpMangan(this.game.ruleset, hand_results)
      const hand_finished = this.game.FinishCurrentHand(hand_results)
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

<style>
.screen_div {
  position: absolute;
  border-style: dotted;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
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
}

.hand_info_board {
  position: absolute;
  border-style: solid;
  text-align: center;
  width: 100px;
  height: 60px;
  top: 210px;
  left: 110px;
  font-size: 16px;
}

.east_player_board,
.south_player_board,
.west_player_board,
.north_player_board {
  position: absolute;
  text-align: center;
  width: 100px;
  height: 100px;
  font-size: 20px;
}

.dealer_player_board {
  color: #cc0000;
}

.non_dealer_player_board {
  color: #00589a;
}

.east_player_board {
  transform: rotate(0deg);
  bottom: 0;
  left: 110px;
}
.south_player_board {
  transform: rotate(270deg);
  right: 0;
  bottom: 190px;
}
.west_player_board {
  transform: rotate(180deg);
  top: 0;
  left: 110px;
}
.north_player_board {
  transform: rotate(90deg);
  left: 0;
  bottom: 190px;
}
</style>
