<template>
  <!-- unstartd game view -->
  <div v-if="GameIsNotStarted">
    <div v-for="i in ruleset.num_players">
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-600"
          >{{ WindsDisplayTextMap.wind_character[WindsOrder[i-1]] }}起
        </span>
        <el-input
          v-model="player_names[i-1]"
          class="w-50 m-2"
          size="default"
        />
      </el-row>
    </div>
    <el-button type="primary" @click="SetUpGame">开始游戏</el-button>
  </div>


  <!-- on-going game view -->
  <div v-if="GameIsOnGoing">
    <el-button type="danger" @click="FinishGame">结束游戏</el-button>

    <div>
      <span> {{ CurrentHandText }} </span>
      <span> | </span>
      <span> {{ RiichiSticksText }} </span>
    </div>

      <div> {{ game.current_hand }} </div>

  <el-table :data="ScoreBoard" style="width: 100%">
    <el-table-column
      :prop="player_id"
      :label="GetScoreBoardLabel(player_id)"
      v-for="player_id in WindsOrder"
    />
  </el-table>

    <el-form :model="hand_results_form">
      <el-form-item label="立直">
        <el-checkbox-group
          fill="#f7bc45"
          v-for="player_id in Winds"
          v-model="hand_results_form.riichi"
          size="default"
        >
          <el-checkbox-button :label="player_id" @change="HandlePlayerRiichi(player_id, $event)">
            {{ GetPlayerName(player_id) }} 立直！
          </el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="对局结果">
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

      <el-form-item label="听牌"
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
          <el-radio-button :label="player_id"> {{ GetPlayerName(player_id) }} </el-radio-button>
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
          <el-radio-button :label="player_id"> {{ GetPlayerName(player_id) }} </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="番"
        v-if="hand_results_form.outcome == HandOutcomeEnum.TSUMO ||
          hand_results_form.outcome == HandOutcomeEnum.RON"
      >
        <el-radio-group v-for="han in AllowedHans" v-model="hand_results_form.han" size="default">
          <el-radio-button :label="han">{{
            han in PointsLadderDisplayMap ?  PointsLadderDisplayMap[han] : han
          }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="符"
        v-if="hand_results_form.outcome == HandOutcomeEnum.TSUMO ||
          hand_results_form.outcome == HandOutcomeEnum.RON"
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

  <el-table
    :data="GameLogBoard"
    style="width: 100%"
    stripe
  >
    <el-table-column fixed prop="hand_signature" label="场" />
    <el-table-column v-for="player_id in WindsOrder" :prop="player_id" :label="GetPlayerName(player_id)" />
  </el-table>

  </div>  

  <!-- finished game view -->
  <div v-if="GameIsFinished">
    游戏结束
    <el-button type="primary" @click="SetUpNewGame">新对局</el-button>
  </div>
  <!-- 
  <el-table
    :data="game.log"
    :default-sort="{ prop: 'log_index', order: 'descending' }"
    style="width: 100%"
    stripe
  >
    <el-table-column fixed prop="hand_signature" label="场" />
    <el-table-column prop="log_index" label="手" />
    <el-table-column prop="beginning_riichi_sticks" label="开局供托" />
    <el-table-column prop="result" label="结果" />
    <el-table-column prop="east_points_delta_with_riichi" :label="game.players[Winds.EAST].name" />
    <el-table-column
      prop="south_points_delta_with_riichi"
      :label="game.players[Winds.SOUTH].name"
    />
    <el-table-column prop="west_points_delta_with_riichi" :label="game.players[Winds.WEST].name" />
    <el-table-column
      prop="north_points_delta_with_riichi"
      :label="game.players[Winds.NORTH].name"
    />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" type="warning" @click="HandleResetLog(scope.$index, scope.row)"
          >重置</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  -->
</template>

<script>
import { ElButton } from 'element-plus'
import { ref } from 'vue'
import { Winds, WindsOrder, NextWindMap, LastWindMap, WindsDisplayTextMap } from './seat_constants.ts'
import { HandOutcomeEnum, RemoveUnusedFieldsForHandResults, HandOutcomeEnumDisplayTextMap } from './hand.ts'
import {
  PointsLadder,
  PointsLadderDisplayMap,
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
  setup() {
  },
  created() {
  },
  mounted() {
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
      AllowedHans: AllowedHans,
      AllowedFus: AllowedFus,
    }
  },
  computed: {
    GameIsNotStarted() { return this.game.state == GameState.NOT_STARTED },
    GameIsOnGoing() { return this.game.state == GameState.ON_GOING },
    GameIsFinished() { return this.game.state == GameState.FINISHED },
    CurrentHandText() {
      return `${WindsDisplayTextMap.wind_character[this.game.current_hand.round_wind]}${this.game.current_hand.hand}局${this.game.current_hand.honba}本场`
    },
    RiichiSticksText() {
      return `供托: ${ this.game.current_hand.riichi_sticks }`
    },
    ScoreBoard() {
      let row = {}
      for (const player_id of WindsOrder) {
        row[player_id] = this.game.players.GetPlayer(player_id).points
      }
      return [row]
    },
    GameLogBoard() {
      let board = []
      for (const log of this.game.log) {
        const hand = log.hand
        const players = log.players.player_map
        let row = {}
        row.hand_signature = `${WindsDisplayTextMap.wind_character[hand.round_wind]}${hand.hand}-${hand.honba}`
        /*
        row.results_summary = `${HandOutcomeEnumDisplayTextMap[hand.results.outcome]}`
        if (hand.results.outcome == HandOutcomeEnum.DRAW) {
          row.results_summary += `[`
          console.log(JSON.stringify(hand.results.tenpai))
          for (const player_id of WindsOrder) {
            if (player_id in hand.results.tenpai) {
              row.results_summary += GetPlayerName(player_id)
            }
          }
          row.results_summary += `]`
        }
        */
       console.log(">>>", JSON.stringify(players))
       console.log(">>>>>>", JSON.stringify(hand))
        for (const player_id of WindsOrder) {
          row[`${player_id}`] = players[player_id].points
        }
        board.push(row)
      }
      return board
    },
  },
  methods: {
    SetUpGame() {
      console.log(`Set up game with players ${JSON.stringify(this.player_names)} and ruleset ${JSON.stringify(this.ruleset)}`)
      this.game.InitGame({ruleset: this.ruleset, player_names: this.player_names})
      this.game.Start();
      this.game.StartCurrentHand();
    },
    SetUpNewGame() {
      this.game = new Game()
    },
    FinishGame() {
      console.log("FinishGame")
      // TODO
    },
    HandlePlayerRiichi(player_id, riichi) {
      console.log(`HandlePlayerRiichi: ${player_id}, ${riichi}`)
      if (riichi == true) {
        this.game.PlayerRiichi(player_id)
      }
      else {
        this.game.PlayerUnRiichi(player_id)
      }
    },
    SubmitHandResultsForm() {
      console.log("SubmitHandResultsForm")

    console.log("!!!", JSON.stringify(this.game.current_hand.results))
      const hand_finished = this.game.FinishCurrentHand(RemoveUnusedFieldsForHandResults(this.hand_results_form));
      if (hand_finished) {
        this.game.SaveHandLog();
        this.game.SetUpNextHandOrFinishGame()
        this.game.StartCurrentHand()
        this.hand_results_form = {}
      }
    },
    GetScoreBoardLabel(player_id) {
      const player = this.game.players.GetPlayer(player_id)
      return `${player.name}[${WindsDisplayTextMap.wind_character[player.current_wind]}]`
    },
    GetPlayerName(player_id) {
      return this.game.players.GetPlayer(player_id).name
    },
  },
}
</script>
