<script setup>
import { ref, computed } from 'vue'
import { PaoableHans, PointsLadderBriefDisplayMap } from './game_constants'
import { Lang } from './app_constants'
import { AllowedHans, AllowedFus } from './game_constants'
import { Players } from './players.ts'

const props = defineProps({
  language: String,
  winner: String,
  players: Players
})

const selected_han = defineModel('selected_han')
const selected_fu = defineModel('selected_fu')
const pao = defineModel('pao')
const PaoSelectionColor = ref('#e86161')

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
const PaoLabelText = computed(() => {
  if (props.language == Lang.CN) {
    return `包`
  } else if (props.language == Lang.EN) {
    return `Pao`
  }
})
const emit = defineEmits(['change'])
</script>

<template>
  <el-form-item :label="HanLabelText">
    <el-radio-group v-for="han in AllowedHans" v-model="selected_han">
      <el-radio-button :label="han">
        {{ han in PointsLadderBriefDisplayMap ? PointsLadderBriefDisplayMap[han][language] : han }}
      </el-radio-button>
    </el-radio-group>
  </el-form-item>

  <el-form-item :label="FuLabelText">
    <el-radio-group v-for="fu_i in AllowedFus[selected_han]" v-model="selected_fu">
      :disabled="selected_han in PointsLadderBriefDisplayMap" >
      <el-radio-button :label="fu_i" />
    </el-radio-group>
  </el-form-item>

  <el-form-item :label="PaoLabelText" v-if="selected_han in PaoableHans">
    <PlayersSelection
      :players="players"
      :fill="PaoSelectionColor"
      v-model="pao"
      :multi_selection="false"
      :disabled_options="[winner]"
    />
  </el-form-item>
</template>
