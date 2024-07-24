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

onMounted(() => {
  interval_handle.value = setInterval(UpdateTimer, 1000)
})

function UpdateTimer() {
  props.tick_timer.Tick()
}

function ToggleTimer() {
  console.log('ToggleTimer')
  props.tick_timer.Toggle()
  emit('saveState')
}

const time_left = computed(() => {
  const time_left_min = props.tick_timer.TimeLeftMin()
  // When time left > 20 min, update every 5min, otherwise, update every 1 min
  if (time_left_min > 20) {
    const total_min = props.tick_timer.TotalMin()
    return `${Math.min(Math.ceil(time_left_min / 5) * 5, Math.ceil(total_min))} min`
  } else {
    return `${Math.ceil(time_left_min)} ${MinuteText.value}`
  }
})

const TimeIsUpMsgText = computed(() => {
  if (props.language == Lang.CN) {
    return `时间到`
  } else if (props.language == Lang.EN) {
    return `TIME UP`
  }
})

const MinuteText = computed(() => {
  if (props.language == Lang.CN) {
    return `分钟`
  } else if (props.language == Lang.EN) {
    return `min`
  }
})
</script>

<template>
  <div v-if="tick_timer.TimeIsUp()" class="time_is_up_div">
    {{ TimeIsUpMsgText }}
  </div>
  <div v-else-if="!tick_timer.started" v-on:click="ToggleTimer()" class="timer_paused_div">
    <el-icon><VideoPause /></el-icon>
    {{ time_left }}
  </div>
  <div
    v-else
    v-on:click="ToggleTimer()"
    :class="tick_timer.TimeLeftMin() > 5 ? `timer_running_div` : `timer_warning_div`"
  >
    <el-icon><Timer /></el-icon>
    {{ time_left }}
  </div>
</template>

<style scoped>
.time_is_up_div {
  color: red;
}
.timer_paused_div {
  color: red;
}
.timer_warning_div {
  color: orange;
}
</style>
