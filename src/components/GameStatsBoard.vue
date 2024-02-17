<script setup>
import { Game } from './game'
import { computed } from 'vue'

const props = defineProps({
  game: Game
})

const StartGameButtonText = computed(() => {
  return '开始对局'
})
const FinishGameButtonText = computed(() => {
  return '结束对局'
})
const NewGameButtonText = computed(() => {
  return '新对局'
})

const emit = defineEmits(['startGame', 'finishGame', 'newGame'])
</script>

<template>
  <div>
    <div v-if="game.IsNotStarted()">
      <el-button type="primary" @click="$emit('startGame', $event)">{{
        StartGameButtonText
      }}</el-button>
    </div>
    <div v-else-if="game.IsOnGoing()">
      <el-button type="danger" @click="$emit('finishGame', $event)">{{
        FinishGameButtonText
      }}</el-button>
    </div>
    <div v-else-if="game.IsFinished()">
      <el-button type="primary" @click="$emit('newGame', $event)">{{
        NewGameButtonText
      }}</el-button>
    </div>
  </div>
</template>
