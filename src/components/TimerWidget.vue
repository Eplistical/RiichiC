<script setup>
import { ref, computed, onMounted, onDeactivated } from 'vue'
import { TickTimer } from './tick_timer'
import { Lang } from './app_constants'

const props = defineProps({
  language: String,
  tick_timer: TickTimer
})

const emit = defineEmits(['saveState'])

const interval_handle = ref(0)

function UpdateTimer() {
  console.log('UpdateTimer')
  props.tick_timer.Tick()
}

function ToggleTimer() {
  console.log('ToggleTimer')
  props.tick_timer.Toggle()
  if (props.tick_timer.started) {
    interval_handle.value = setInterval(UpdateTimer, 10000)
  } else {
    clearInterval(interval_handle.value)
    interval_handle.value = 0
  }
  emit('saveState')
}

const minutes_left = computed(() => {
  return Math.ceil(props.tick_timer.TimeLeftMs() / 1000 / 60)
})

const TimeIsUpMsgText = computed(() => {
  if (props.language == Lang.CN) {
    return `时间到`
  } else if (props.language == Lang.EN) {
    return `TIME UP`
  }
})
</script>

<template>
  <div v-if="tick_timer.TimeIsUp()" class="time_is_up_div">
    {{ TimeIsUpMsgText }}
  </div>
  <div v-else-if="!tick_timer.started" v-on:click="ToggleTimer()" class="timer_paused_div">
    <el-icon><VideoPause /></el-icon>
    {{ minutes_left }} min
  </div>
  <div v-else v-on:click="ToggleTimer()">
    <el-icon><Timer /></el-icon>
    {{ minutes_left }} min
  </div>
</template>

<style scoped>
.time_is_up_div {
  color: red;
}
.timer_paused_div {
  color: red;
}
</style>
