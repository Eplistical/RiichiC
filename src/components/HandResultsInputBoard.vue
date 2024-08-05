<script setup>
import { ref, computed } from 'vue'
import { HandOutcomeEnum, HandOutcomeEnumDisplayTextMap } from './hand'
import { Actions, ActionDisplayMap, PointsLadder, NumberDisplayMap } from './game_constants'
import { Game } from './game'
import { Lang } from './app_constants'
import HanFuSelection from './HanFuSelection.vue'
import { PlayerIdsInOrder } from './players'
import { WindsFullDisplayTextMap } from './seat_constants'

const props = defineProps({
  language: String,
  game: Game
})

const results_form = defineModel()

const ResultLabelText = computed(() => {
  if (props.language == Lang.CN) {
    return '结果'
  } else if (props.language == Lang.EN) {
    return 'Result'
  }

  return ActionDisplayMap[Actions.AGARI][props.language]
})
const TenpaiLabelText = computed(() => {
  return ActionDisplayMap[Actions.TENPAI][props.language]
})
const ChomboLabelText = computed(() => {
  return ActionDisplayMap[Actions.CHOMBO][props.language]
})
const AgariLabelText = computed(() => {
  return ActionDisplayMap[Actions.AGARI][props.language]
})
const DealInLabelText = computed(() => {
  return ActionDisplayMap[Actions.DEAL_IN][props.language]
})
const SubmitButtonText = computed(() => {
  if (props.language == Lang.CN) {
    return `提交`
  } else if (props.language == Lang.EN) {
    return `Submit`
  }
})

const TenpaiSelectionColor = ref('#289e20')
const WinnerSelectionColor = ref('#289e20')
const DealInSelectionColor = ref('#e86161')
const ChomboSelectionColor = ref('#e86161')

const emit = defineEmits(['submit'])

function HandleWinnerSelectionChange(player_id, selected) {
  console.log('HandleWinnerSelectionChange: ', player_id, selected)
  // when winner selection changes, make sure the same player is un-selected from deal-in
  if (results_form.value.deal_in && results_form.value.deal_in == player_id) {
    delete results_form.value.deal_in
  }
  // sort winners by order
  if (Array.isArray(results_form.value.winner)) {
    results_form.value.winner.sort(
      (p1, p2) => PlayerIdsInOrder.indexOf(p1) - PlayerIdsInOrder.indexOf(p2)
    )
  }
  if (!selected) {
    delete results_form.value[`${player_id}_han`]
    delete results_form.value[`${player_id}_fu`]
    delete results_form.value[`${player_id}_pao`]
  }
}

const HandSignatureText = computed(() => {
  if (props.language == Lang.CN) {
    return `${WindsFullDisplayTextMap[props.game.current_hand.round_wind][props.language]}${NumberDisplayMap[props.game.current_hand.hand][props.language]}局`
  } else if (props.language == Lang.EN) {
    return `${WindsFullDisplayTextMap[props.game.current_hand.round_wind][props.language]}${NumberDisplayMap[props.game.current_hand.hand][props.language]}`
  }
})

const RiichiStickIconSvg = computed(() => {
  return './riichi_stick_white.svg'
})

const HonbaIconSvg = computed(() => {
  return './honba_white.svg'
})
</script>

<template>
  <el-row>
    <el-col :span="6">
      {{ HandSignatureText }}
    </el-col>
    <el-col :span="8">
      <el-image :src="RiichiStickIconSvg" class="riichi_stick_icon" />
      {{ game.current_hand.riichi_sticks }}
    </el-col>
    <el-col :span="8">
      <el-image :src="HonbaIconSvg" class="honba_icon" />
      {{ game.current_hand.honba }}
    </el-col>
  </el-row>
  <el-divider />

  <el-form>
    <el-form-item :label="ResultLabelText">
      <el-radio-group v-for="outcome in HandOutcomeEnum" v-model="results_form.outcome">
        <el-radio-button :label="outcome">
          {{ HandOutcomeEnumDisplayTextMap[outcome][language] }}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item :label="ChomboLabelText" v-if="results_form.outcome == HandOutcomeEnum.CHOMBO">
      <PlayersSelection
        :players="game.players"
        :fill="ChomboSelectionColor"
        v-model="results_form.chombo"
        :multi_selection="true"
      />
    </el-form-item>

    <el-form-item :label="TenpaiLabelText" v-if="results_form.outcome == HandOutcomeEnum.DRAW">
      <PlayersSelection
        :players="game.players"
        :fill="TenpaiSelectionColor"
        v-model="results_form.tenpai"
        :multi_selection="true"
      />
    </el-form-item>

    <div v-if="game.ruleset.head_bump">
      <!-- Head bump ON case -->
      <el-form-item
        :label="AgariLabelText"
        v-if="
          results_form.outcome == HandOutcomeEnum.TSUMO ||
          results_form.outcome == HandOutcomeEnum.RON
        "
      >
        <PlayersSelection
          :players="game.players"
          :fill="WinnerSelectionColor"
          v-model="results_form.winner"
          :multi_selection="false"
          @change="HandleWinnerSelectionChange"
        />
      </el-form-item>

      <el-form-item :label="DealInLabelText" v-if="results_form.outcome == HandOutcomeEnum.RON">
        <PlayersSelection
          :players="game.players"
          :fill="DealInSelectionColor"
          v-model="results_form.deal_in"
          :multi_selection="false"
          :disabled_options="[results_form.winner]"
        />
      </el-form-item>

      <HanFuSelection
        v-if="
          results_form.outcome == HandOutcomeEnum.TSUMO ||
          results_form.outcome == HandOutcomeEnum.RON
        "
        :language="language"
        :winner="results_form.winner"
        :players="game.players"
        v-model:selected_han="results_form[`${results_form.winner}_han`]"
        v-model:selected_fu="results_form[`${results_form.winner}_fu`]"
        v-model:pao="results_form[`${results_form.winner}_pao`]"
      />
    </div>
    <div v-else>
      <!-- Head bump OFF case -->
      <el-form-item
        :label="AgariLabelText"
        v-if="
          results_form.outcome == HandOutcomeEnum.TSUMO ||
          results_form.outcome == HandOutcomeEnum.RON
        "
      >
        <PlayersSelection
          :players="game.players"
          :fill="WinnerSelectionColor"
          v-model="results_form.winner"
          :multi_selection="true"
          @change="HandleWinnerSelectionChange"
        />
      </el-form-item>

      <el-form-item :label="DealInLabelText" v-if="results_form.outcome == HandOutcomeEnum.RON">
        <PlayersSelection
          :players="game.players"
          :fill="DealInSelectionColor"
          v-model="results_form.deal_in"
          :multi_selection="false"
          :disabled_options="results_form.winner"
        />
      </el-form-item>

      <div
        v-if="
          results_form.outcome == HandOutcomeEnum.TSUMO ||
          results_form.outcome == HandOutcomeEnum.RON
        "
      >
        <div v-for="winner in results_form.winner">
          <el-divider> {{ game.players.GetPlayer(winner).name }} </el-divider>
          <HanFuSelection
            :language="language"
            :winner="winner"
            :players="game.players"
            v-model:selected_han="results_form[`${winner}_han`]"
            v-model:selected_fu="results_form[`${winner}_fu`]"
            v-model:pao="results_form[`${winner}_pao`]"
          />
        </div>
      </div>
    </div>

    <el-form-item>
      <el-button type="primary" @click="$emit('submit')">{{ SubmitButtonText }}</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.honba_icon,
.riichi_stick_icon {
  height: 4vw;
  width: 20vw;
  margin-top: 1vw;
  margin-right: 1vw;
}
</style>
