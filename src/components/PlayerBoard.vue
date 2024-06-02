<script setup>
import { Players } from './players'
import { LastWindMap, NextWindMap, Winds, WindsDisplayTextMap } from './seat_constants'
import { ref, computed } from 'vue'

const props = defineProps({
  player_id: String,
  players: Players,
  riichi_disabled: Boolean
})

const riichi_players = defineModel()
const emit = defineEmits(['riichi'])
const show_point_diff = ref(false)
const display_mode_timeout_id = ref(undefined)

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
  return WindsDisplayTextMap[GetCurPlayer().current_wind]
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

const RiichiText = computed(() => {
  return '立直'
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
    }, 3000)
  }
}
</script>

<template>
  <div :class="IsDealer ? 'dealer_board' : 'non_dealer_board'">
    <div class="player_info_div" v-on:click="ToggleDisplayMode()">
      <div>{{ PlayerName }}[{{ PlayerCurrentWind }}]</div>

      <div v-if="!show_point_diff">
        {{ PlayerPoints }}
      </div>
      <div v-else>
        <el-row>
          <el-col :span="8">
            {{ LeftPlayerPointsDiff }}
            <span v-if="LeftPlayerPointsDiff != 0" class="filling_zeros">00</span>
          </el-col>
          <el-col :span="8">
            {{ OppoPlayerPointsDiff }}
            <span v-if="LeftPlayerPointsDiff != 0" class="filling_zeros">00</span>
          </el-col>
          <el-col :span="8">
            {{ RightPlayerPointsDiff }}
            <span v-if="LeftPlayerPointsDiff != 0" class="filling_zeros">00</span>
          </el-col>
        </el-row>
      </div>
    </div>

    <el-checkbox-group fill="#f7bc45" v-model="riichi_players">
      <el-checkbox-button
        :label="player_id"
        :disabled="riichi_disabled"
        @change="$emit('riichi', $event)"
      >
        {{ RiichiText }}
      </el-checkbox-button>
    </el-checkbox-group>
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
  font-size: 16px;
}
</style>
