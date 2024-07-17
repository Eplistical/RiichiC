<script setup>
import { ref, computed, onDeactivated, onBeforeUnmount, onUnmounted } from 'vue'
import { PointsLadderBriefDisplayMap } from './game_constants'
import { Lang } from './app_constants'
import { AllowedHans, AllowedFus } from './game_constants'

const props = defineProps({
  language: String,
  winner: String
})

const selected_han = defineModel('selected_han')
const selected_fu = defineModel('selected_fu')

//const selected_han = ref(undefined)
//const selected_fu = ref(undefined)
/*

onDeactivated(() => {
  console.log(">>> onDeactivated")
  selected_han.value = undefined
  selected_fu.value = undefined
})

onUnmounted(() => {
  console.log(">>> onUnmounted")
  selected_han.value = undefined
  selected_fu.value = undefined
})

onBeforeUnmount(() => {
  console.log(">>> onBeforeUnmount")
  selected_han.value = undefined
  selected_fu.value = undefined
})
*/

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
</template>
