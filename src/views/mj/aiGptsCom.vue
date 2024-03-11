<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NImage, NPopover, NTag, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import type { gptsType } from '@/api'
import { chatSetting, mlog, my2Fetch, myFetch } from '@/api'
import { gptConfigStore, gptsUlistStore, homeStore, useChatStore } from '@/store'
import { SvgIcon } from '@/components/common'
import { t } from '@/locales'

const pp = defineProps<{ q: string }>()
const emit = defineEmits(['close', 'toq'])
const router = useRouter()
const ms = useMessage()
const chatStore = useChatStore()
// const gptsList= ref<gptsType[]>([]);
const gptsPageList = ref<gptsType[]>([])
const gptsInitList = ref<gptsType[]>([])
const gptsSearchList = ref<gptsType[]>([])
const st = ref({ loadPage: false, q: '', tab: '', search: false })
const tag = ref(['画图', '文件', '发票'])
const load = async () => {
  // const gptUrl= homeStore.myData.session.gptUrl?  homeStore.myData.session.gptUrl :'';
  // mlog('load',gptUrl );
  let d
  if (homeStore.myData.session.gptUrl)
    d = await my2Fetch(homeStore.myData.session.gptUrl)

  else
    d = await myFetch('https://gpts.ddaiai.com/open/gpts')

  gptsInitList.value = d.gpts as gptsType[]
  tag.value = d.tag as string[]
}
const go = async (item: gptsType) => {
  const saveObj = { model: `${item.gid}`, gpts: item }
  gptConfigStore.setMyData(saveObj)
  if (chatStore.active) { // 保存到对话框
    const chatSet = new chatSetting(chatStore.active)
    if (chatSet.findIndex() > -1)
      chatSet.save(saveObj)
  }
  ms.success(t('mjchat.success2'))
  const gptUrl = 'https://gpts.ddaiai.com/open/gptsapi/use'
  myFetch(gptUrl, item)
  emit('close')
  mlog('go local ', homeStore.myData.local)
  if (homeStore.myData.local !== 'Chat')
    router.replace({ name: 'Chat', params: { uuid: chatStore.active } })

  gptsUlistStore.setMyData(item)
}
const pageLoad = async () => {
  st.value.loadPage = true
  const gptUrl = `https://gpts.ddaiai.com/open/gptsapi/list/${gptsPageList.value.length}`
  const d = await myFetch(gptUrl)
  st.value.loadPage = false

  const rz = d.data.list as gptsType[]
  gptsPageList.value = gptsPageList.value.concat(rz) // rz.concat( gptsPageList.value  )
}
const gptsList = computed(() => {
  const rz: gptsType[] = []
  if (st.value.tab == 'search')
    return gptsSearchList.value
  // mlog('search', st.value.tab );

  return rz.concat(gptsInitList.value, gptsPageList.value)
})
const searchQ = async (q: string) => {
  st.value.q = q
  st.value.tab = 'search'
  st.value.search = true
  const gptUrl = `https://gpts.ddaiai.com/open/gptsapi/search?q=${st.value.q}`
  const d = await myFetch(gptUrl)
  st.value.search = false
  gptsSearchList.value = d.data.list as gptsType[]
}
const goSearch = (q: string) => {
  emit('toq', { q })
  searchQ(q)
}

const badgo = (item: gptsType, e: Event) => {
  e.stopPropagation()
  mlog('badgo', item)
  const gptUrl = 'https://gpts.ddaiai.com/open/gptsapi/bad'
  myFetch(gptUrl, item)
  item.bad = item.bad ? (+item.bad + 1) : 1
}

watch(() => pp.q, (n) => {
  if (n == '')
    st.value.tab = ''
})
load()
defineExpose({ searchQ })
</script>

<template>
  <div class="w-full h-full p-4">
    <template v-if="gptsList.length > 0">
      <div class="flex items-center justify-start line-clamp-1 pb-4">
        <div v-for="v in tag" class="m-1 cursor-pointer" @click="goSearch(v)">
          <NButton v-if="v == pp.q" strong round size="small" type="success">
            {{ v }}
          </NButton>
          <NButton v-else strong secondary round size="small" type="success">
            {{ v }}
          </NButton>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="v in gptsList" class="group relative flex gap-3 rounded-2xl bg-[#e8eaf1] p-5 dark:bg-neutral-600 cursor-pointer " @click="go(v)">
          <div class="min-w-0 flex-1 mt-[-10px]">
            <div class="flex justify-between items-center">
              <h3 class=" transition   text-lg font-semibold line-clamp-1">
                {{ v.name }}
              </h3>
            </div>
            <div class="mt-0.5 text-zinc-400 text-md line-clamp-2">
              {{ v.info }}
            </div>
          </div>
          <NImage
            :src="v.logo" :preview-disabled="true" lazy
            class="group-hover:scale-[130%] duration-300 shrink-0 overflow-hidden bg-base object-cover rounded-full bc-avatar w-[80px] h-[80px]"
          >
            <template #placeholder>
              <div class="w-full h-full justify-center items-center flex">
                <SvgIcon icon="line-md:downloading-loop" class="text-[60px] text-green-300" />
              </div>
            </template>
          </NImage>
          <!-- <img  class="group-hover:scale-[130%] duration-300 shrink-0 overflow-hidden bg-base object-cover rounded-full bc-avatar w-[80px] h-[80px]" :src="v.logo"/> -->
          <div class="space-x-1 flex absolute bottom-2 left-4">
            <NPopover trigger="hover">
              <template #trigger>
                <NTag type="success" size="small" round>
                  <div class="flex items-center">
                    <SvgIcon icon="mdi:hot" />{{ v.use_cnt }}
                  </div>
                </NTag>
              </template>
              <span>使用热度</span>
            </NPopover>
            <NPopover trigger="hover">
              <template #trigger>
                <NTag type="success" size="small" round>
                  <div class="flex items-center cursor-pointer" @click="badgo(v, $event)">
                    <SvgIcon icon="icon-park-outline:bad-two" />
                    <span class="ml-[2px]"> {{ v.bad }}</span>
                  </div>
                </NTag>
              </template>
              <span>不好用或应用已不存在请点这个</span>
            </NPopover>
          </div>
        </div>
      </div>
      <div v-if="st.tab == '' " class="flex items-center justify-center py-10">
        <div v-if="st.loadPage" @click="pageLoad()">
          {{ $t('mjchat.loading2') }}
        </div>
        <NButton v-else @click="pageLoad()">
          {{ $t('mjchat.loadmore') }}
        </NButton>
      </div>
    </template>
    <div v-else-if="st.tab == 'search' && !st.search" class="h-full flex items-center justify-center flex-col">
      <div>{{ $t('mjchat.nofind') }}<b class=" text-green-400">{{ st.q }}</b> {{ $t('mjchat.nofind2') }}</div>
      <div class="flex items-center justify-center flex-wrap">
        <div v-for="v in tag" class="m-1 cursor-pointer" @click="goSearch(v)">
          <NButton strong secondary round size="small" type="success">
            {{ v }}
          </NButton>
        </div>
      </div>
    </div>
    <div v-else class="h-full flex items-center justify-center">
      {{ $t('mjchat.loading2') }}
    </div>
  </div>
</template>
