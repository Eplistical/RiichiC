<script setup>
const props = defineProps({
  title: String,
  active_text: String,
  inactive_text: String,
  active_value: String | Number | Boolean,
  inactive_value: String | Number | Boolean
})

const result = defineModel()
</script>

<template>
  <el-row>
    <el-col :span="12"> {{ title }}</el-col>
    <el-col :span="12">
      <el-switch
        v-model="result"
        :active-text="active_text"
        :active-value="active_value"
        :inactive-text="inactive_text"
        :inactive-value="inactive_value"
      />
    </el-col>
  </el-row>
</template>
