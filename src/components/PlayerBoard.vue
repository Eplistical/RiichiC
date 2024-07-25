<script setup>
import { Players } from './players'
import { LastWindMap, NextWindMap, Winds, WindsDisplayTextMap } from './seat_constants'
import { ref, computed, watch } from 'vue'
import { Lang } from './app_constants'

const props = defineProps({
  language: String,
  player_id: String,
  current_hand_index: Number,
  players: Players,
  riichied: Boolean,
  riichi_disabled: Boolean,
  last_hand_points_delta: Object
})

const emit = defineEmits(['riichi'])
const show_point_diff = ref(false)
const display_mode_timeout_id = ref(undefined)
const show_last_hand_pt_delta = ref(true)
const show_last_hand_pt_delta_timeout_id = ref(undefined)

watch(
  () => props.current_hand_index,
  () => {
    show_last_hand_pt_delta.value = true
    if (show_last_hand_pt_delta_timeout_id.value != undefined) {
      clearTimeout(show_last_hand_pt_delta_timeout_id.value)
    }
    show_last_hand_pt_delta_timeout_id.value = setTimeout(function () {
      show_last_hand_pt_delta.value = false
    }, 120000) // 2min
  }
)

function GetCurPlayer() {
  return props.players.GetPlayer(props.player_id)
}

function GetRightPlayer() {
  return props.players.GetPlayer(NextWindMap[props.player_id])
}

function GetLeftPlayer() {
  return props.players.GetPlayer(LastWindMap[props.player_id])
}

function GetOppoPlayer() {
  return props.players.GetPlayer(NextWindMap[NextWindMap[props.player_id]])
}

const PlayerName = computed(() => {
  return GetCurPlayer().name
})

const PlayerCurrentWind = computed(() => {
  return WindsDisplayTextMap[GetCurPlayer().current_wind][props.language]
})

const PlayerPoints = computed(() => {
  return GetCurPlayer().points
})

function FormatPointsDiff(diff) {
  return diff / 100
}

const OppoPlayerPointsDiff = computed(() => {
  const pt = GetCurPlayer().points
  const oppo_diff = pt - GetOppoPlayer().points
  return FormatPointsDiff(oppo_diff)
})

const LeftPlayerPointsDiff = computed(() => {
  const pt = GetCurPlayer().points
  const left_diff = pt - GetLeftPlayer().points
  return FormatPointsDiff(left_diff)
})

const RightPlayerPointsDiff = computed(() => {
  const pt = GetCurPlayer().points
  const right_diff = pt - GetRightPlayer().points
  return FormatPointsDiff(right_diff)
})

const IsDealer = computed(() => {
  return GetCurPlayer().current_wind == Winds.EAST
})

const RiichiStickImageSvg = computed(() => {
  if (props.riichied) {
    return './riichi_stick_white.svg'
  } else if (props.language == Lang.CN) {
    return './riichi_stick_empty_cn.svg'
  } else if (props.language == Lang.EN) {
    return './riichi_stick_empty_en.svg'
  }
})

const LastHandPointsDelta = computed(() => {
  const pt_delta = props.last_hand_points_delta
    ? props.last_hand_points_delta[props.player_id]
    : undefined
  return pt_delta == undefined ? 0 : pt_delta
})

function ToggleDisplayMode() {
  console.log(`ToggleDisplayMode`)
  show_point_diff.value = !show_point_diff.value
  if (show_point_diff.value == true) {
    if (display_mode_timeout_id.value != undefined) {
      clearTimeout(display_mode_timeout_id.value)
    }
    display_mode_timeout_id.value = setTimeout(function () {
      show_point_diff.value = false
    }, 4000)
  }
}

function ToggleRiichi() {
  console.log(`ToggleRiichi:`, GetCurPlayer())
  if (!props.riichi_disabled) {
    emit('riichi', !props.riichied)
  }
}
</script>

<template>
  <div :class="IsDealer ? 'dealer_board' : 'non_dealer_board'">
    <div class="riichi_stick_div">
      <el-image :src="RiichiStickImageSvg" class="riichi_stick_img" v-on:click="ToggleRiichi()" />
    </div>

    <div class="player_info_div" v-on:click="ToggleDisplayMode()">
      <div v-if="!show_point_diff">
        <div v-if="show_last_hand_pt_delta && LastHandPointsDelta != 0" class="points_delta">
          {{ `[${LastHandPointsDelta > 0 ? '+' : ''}${LastHandPointsDelta}]` }}
        </div>
        <div>{{ PlayerPoints }}</div>
      </div>
      <div v-else>
        <el-row>
          <el-col :span="8">
            {{ LeftPlayerPointsDiff }}
            <span v-if="LeftPlayerPointsDiff != 0" class="filling_zeros">00</span>
          </el-col>
          <el-col :span="8">
            {{ OppoPlayerPointsDiff }}
            <span v-if="OppoPlayerPointsDiff != 0" class="filling_zeros">00</span>
          </el-col>
          <el-col :span="8">
            {{ RightPlayerPointsDiff }}
            <span v-if="RightPlayerPointsDiff != 0" class="filling_zeros">00</span>
          </el-col>
        </el-row>
      </div>

      <div>{{ PlayerName }}[{{ PlayerCurrentWind }}]</div>
    </div>
  </div>
</template>

<style scoped>
.dealer_board {
  color: #cc0000;
}

.non_dealer_board {
  color: #00589a;
}

.filling_zeros {
  font-size: 5vw;
}

.points_delta {
  font-size: 4vw;
  position: absolute;
  left: calc(50% + 10vw);
  color: #2f261e;
}

.riichi_stick_div {
  height: 8vw;
}

.riichi_stick_img {
  height: 8vw;
  width: 50vw;
  margin-bottom: 2vw;
}
</style>
