<script setup>
const props = defineProps({
  title: String,
  step: Number,
  disabled: Boolean,
  suffix: String
})

const num = defineModel({ type: Number })
</script>

<template>
  <el-row>
    <el-col :span="12"> {{ title }} </el-col>
    <el-col :span="12">
      <el-input-number
        v-model="num"
        :step="step"
        :disabled="disabled"
        :value-on-clear="undefined"
      />
      {{ suffix }}
    </el-col>
  </el-row>
</template>

<style scoped></style>
