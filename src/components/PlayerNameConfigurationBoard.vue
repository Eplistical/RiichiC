<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '@vueuse/core'
import { LIST_PLAYERS_API } from './app_constants'
import { Lang } from './app_constants'
const props = defineProps({
  language: String,
  num_players: Number,
  ruleset_id: String
})
const player_names = defineModel('player_names')
const player_starting_winds = defineModel('player_starting_winds')
const registered_players = defineModel('registered_players')

const PlayerNameDividerText = computed(() => {
  if (props.language == Lang.CN) {
    return `玩家信息`
  } else if (props.language == Lang.EN) {
    return `Players`
  }
})

const CannotFindPlayerMsgText = computed(() => {
  if (props.language == Lang.CN) {
    return `无法获得玩家信息`
  } else if (props.language == Lang.EN) {
    return `Cannot find player`
  }
})

const players = ref({})

const registered_players_for_ruleset_id = computed(() => {
  if (props.ruleset_id in players.value) {
    registered_players.value = players.value[props.ruleset_id]
  } else {
    registered_players.value = players.value['CUSTOM']
  }
  return registered_players.value
})

onMounted(() => {
  GetPlayers()
})

function GetPlayers() {
  console.log('GetPlayers')
  const { data, onFetchResponse, onFetchError } = useFetch(
    `${LIST_PLAYERS_API}?action=list_players`
  )
    .get()
    .text()
  onFetchResponse((response) => {
    players.value = JSON.parse(data.value).players
  })
  onFetchError((error) => {
    alert(`${CannotFindPlayerMsgText}: ${data.value}`)
  })
}
</script>

<template>
  <el-divider>{{ PlayerNameDividerText }}</el-divider>
  <el-row v-for="i in num_players">
    <PlayerNameEntry
      v-model:player_name="player_names[i - 1]"
      v-model:player_starting_wind="player_starting_winds[i - 1]"
      :language="language"
      :registered_players="registered_players_for_ruleset_id"
    />
  </el-row>
</template>
