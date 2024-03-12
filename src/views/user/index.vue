<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'
import { NButton, NCard, NForm, NFormItem, NInput, NInputGroup, NInputNumber, NModal, NSpace, NTable, useMessage } from 'naive-ui'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getUserList } from '@/api'

interface UserType {
  id: number
  name: string
  token: string
  imageLimit: number
}

interface ModalDataType {
  id: number | null
  name: string | null
  token: string | null
  imageLimit: number | null
}

const data = reactive({
  page: 1,
  rows: [] as UserType[],
  total: 0,
  modalData: {} as ModalDataType,
  refresh: 0,
  keyword: '',
})
const showModal = ref(false)
const title = computed(() => data.modalData.id ? '修改用户资料' : '添加用户')

// form related
const formRef = ref<FormInst | null>(null)
const formValue = ref({
  user: {
    id: 0,
    name: '',
    token: '',
    imageLimit: 0,
  },
})
const rules = {
  user: {
    name: {
      required: true,
      message: '请输入姓名',
      trigger: ['input', 'blur'],
    },
    token: {
      required: true,
      message: '请输入密钥',
      trigger: ['input', 'blur'],
    },
    imageLimit: {
      required: true,
      type: 'number',
      message: '请输入图片限额',
      trigger: ['input', 'blur'],
    },
  },
} satisfies FormRules
const message = useMessage()

const onCancel = () => showModal.value = false
const onEdit = (item: UserType) => {
  showModal.value = true
  formValue.value.user.id = item.id
  formValue.value.user.name = item.name
  formValue.value.user.token = item.token
  formValue.value.user.imageLimit = item.imageLimit
}
const onAdd = () => {
  showModal.value = true
  formValue.value.user = { id: 0, name: '', token: '', imageLimit: 0 }
}
const getData = (page: number) => {
  getUserList(page).then((res) => {
    const { total, rows } = res.data
    data.rows = rows
    data.total = total
  })
}
const onSave = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors)
      message.success('Valid')
    else
      message.error('Invalid')
  })
}
const onSearch = () => {
  data.refresh += 1
}
const onReset = () => {
  data.page = 1
  data.refresh += 1
  data.keyword = ''
}

watch(() => data.refresh, (refresh) => {
  if (refresh > 0)
    getData(data.page)
})

onMounted(() => {
  getData(data.page)
})
</script>

<template>
  <div class="p-5">
    <div class="pb-2 px-2 text-lg font-semibold">
      User Management
    </div>
    <div class="mb-2 flex justify-between">
      <NInputGroup>
        <NInput v-model:value="data.keyword" autosize class="min-w-[200px]" type="text" placeholder="关键词" />
        <NButton type="primary" ghost @click="onSearch">
          搜索
        </NButton>
        <NButton type="primary" ghost @click="onAdd">
          添加
        </NButton>
      </NInputGroup>
      <NButton type="primary" ghost @click="onReset">
        重置
      </NButton>
    </div>
    <NTable>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Token</th>
          <th>Image Limit</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data.rows" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.token }}</td>
          <td>{{ item.imageLimit }}</td>
          <td>
            <NSpace>
              <NButton type="primary" size="tiny" @click="onEdit(item)">
                修改
              </NButton>
              <NButton size="tiny">
                删除
              </NButton>
            </NSpace>
          </td>
        </tr>
      </tbody>
    </NTable>
    <NModal v-model:show="showModal">
      <NCard
        style="width: 600px"
        :title="title"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <NForm
          ref="formRef"
          inline
          :label-width="80"
          :model="formValue"
          :rules="rules"
          size="small"
        >
          <NFormItem label="Name" path="user.name">
            <NInput v-model:value="formValue.user.name" placeholder="输入姓名" />
          </NFormItem>
          <NFormItem label="Token" path="user.token">
            <NInput v-model:value="formValue.user.token" placeholder="输入Token" />
          </NFormItem>
          <NFormItem label="Image Limit" path="user.imageLimit">
            <NInputNumber v-model:value="formValue.user.imageLimit" placeholder="Image Limit" />
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace>
            <NButton size="small" type="primary" @click="onSave">
              保存
            </NButton>
            <NButton size="small" @click="onCancel">
              取消
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>
