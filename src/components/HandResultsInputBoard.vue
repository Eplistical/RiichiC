<script setup>
import { ref, computed } from 'vue'
import { HandOutcomeEnum, HandOutcomeEnumDisplayTextMap } from './hand'
import { Actions, ActionDisplayMap } from './game_constants'
import { PointsLadderBriefDisplayMap } from './game_constants'
import { Game } from './game'
import { Lang } from './app_constants'
import { AllowedHans, AllowedFus } from './game_constants'

const props = defineProps({
  language: String,
  game: Game
})

const results_form = defineModel()

const HandReultsTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return '对局结果'
  } else if (props.language == Lang.EN) {
    return 'Hand Result'
  }
})
const TenpaiLabelText = computed(() => {
  return ActionDisplayMap[Actions.TENPAI][props.language]
})
const AgariLabelText = computed(() => {
  return ActionDisplayMap[Actions.AGARI][props.language]
})
const DealInLabelText = computed(() => {
  return ActionDisplayMap[Actions.DEAL_IN][props.language]
})
const HanLabelText = computed(() => {
  if (props.language == Lang.CN) {
    return `番`
  } else if (props.language == Lang.EN) {
    return `Han`
  }
})
const FuLabelText = computed(() => {
  if (props.language == Lang.CN) {
    return `符`
  } else if (props.language == Lang.EN) {
    return `Fu`
  }
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

const emit = defineEmits(['submit'])

function HandleWinnerSelectionChange(player_id) {
  // when winner selection changes, make sure the same player is un-selected from deal-in
  if (results_form.value.deal_in && results_form.value.deal_in == player_id) {
    delete results_form.value.deal_in
  }
}
</script>

<template>
  <el-collapse>
    <el-collapse-item :title="HandReultsTitleText">
      <el-form>
        <el-form-item>
          <el-radio-group v-for="outcome in HandOutcomeEnum" v-model="results_form.outcome">
            <el-radio-button :label="outcome">
              {{ HandOutcomeEnumDisplayTextMap[outcome][language] }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="TenpaiLabelText" v-if="results_form.outcome == HandOutcomeEnum.DRAW">
          <PlayersSelection
            :players="game.players"
            :fill="TenpaiSelectionColor"
            v-model="results_form.tenpai"
            :multi_selection="true"
          />
        </el-form-item>

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

        <el-form-item
          :label="HanLabelText"
          v-if="
            results_form.outcome == HandOutcomeEnum.TSUMO ||
            results_form.outcome == HandOutcomeEnum.RON
          "
        >
          <el-radio-group v-for="han in AllowedHans" v-model="results_form.han">
            <el-radio-button :label="han">{{
              han in PointsLadderBriefDisplayMap ? PointsLadderBriefDisplayMap[han][language] : han
            }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="FuLabelText"
          v-if="
            results_form.outcome == HandOutcomeEnum.TSUMO ||
            results_form.outcome == HandOutcomeEnum.RON
          "
        >
          <el-radio-group
            v-for="fu in AllowedFus[results_form.han]"
            v-model="results_form.fu"
            :disabled="results_form.han in PointsLadderBriefDisplayMap"
          >
            <el-radio-button :label="fu" />
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="$emit('submit')">{{ SubmitButtonText }}</el-button>
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </el-collapse>
</template>
