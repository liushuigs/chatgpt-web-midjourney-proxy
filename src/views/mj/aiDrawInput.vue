<script setup lang="ts">
import { NTabPane, NTabs } from 'naive-ui'
import aiDrawInputItem from './aiDrawInputItem.vue'
import aiFace from './aiFace.vue'
import aiBlend from './aiBlend.vue'
import aiDall from './aiDall.vue'

const $emit = defineEmits(['drawSent', 'close'])
const drawSent = (d: any) => $emit('drawSent', d)
</script>

<template>
  <div class="overflow-y-auto bg-[#fafbfc] pt-2 dark:bg-[#18181c] h-full ">
    <NTabs type="line" animated default-value="draw">
      <NTabPane name="start" tab="" />
      <NTabPane name="draw" :tab="$t('mjchat.draw')">
        <aiDrawInputItem @draw-sent="drawSent" @close="$emit('close')" />
      </NTabPane>
      <NTabPane name="face" :tab="$t('mjchat.face')">
        <div class="p-4">
          <aiFace />
        </div>
      </NTabPane>
      <NTabPane name="blend" :tab="$t('mjchat.blend')">
        <div class="p-4">
          <aiBlend />
        </div>
      </NTabPane>
      <NTabPane name="dall3" tab="Dall.E">
        <div class="p-4">
          <aiDall />
        </div>
      </NTabPane>
    </NTabs>
  </div>
</template>
