<script setup lang="ts">
import dayjs from 'dayjs'

definePage({
  style: {
    navigationBarTitleText: '添加礼簿',
  },
})

const dataSource = ref<Api.Book>({})
const formRef = ref()
const loading = ref(false)

onLoad(async (option) => {
  if (option?.id) {
    uni.setNavigationBarTitle({
      title: '编辑礼簿',
    })
    dataSource.value = await apiBookGet({ id: option.id })
  }
  else {
    dataSource.value.date = dayjs().format('YYYY-MM-DD')
    dataSource.value.lunarDate = generateLunarDate(new Date())
  }
})

const onSubmit = async () => {
  try {
    await formRef.value.validate()
  }
  catch {
    return
  }
  loading.value = true
  if (dataSource.value.id) {
    await apiBookPut(dataSource.value)
    uni.navigateBack()
    uni.showToast({
      title: '保存成功',
      icon: 'none',
    })
  }
  else {
    const id = await apiBookPost(dataSource.value)
    uni.redirectTo({
      url: `/pages/book/detail?id=${id}`,
    })
  }
  loading.value = false
}

const rules = {
  'dataSource.date': { required: true, message: '请选择日期时间', trigger: ['blur', 'change'] },
  'dataSource.title': { required: true, message: '请填写礼簿名称', trigger: ['blur', 'change'] },
}
const onDateChange = (e: any) => {
  dataSource.value.date = e.detail.value
  dataSource.value.lunarDate = generateLunarDate(new Date(e.detail.value))
}
</script>

<template>
  <div class="mx-3 space-y-3" :class="{ memorial: hasMourningWords(dataSource.title) }">
    <div class="rounded-2xl bg-white p-5">
      <uv-form ref="formRef" label-width="100" label-position="top" :model="{ dataSource }" :rules="rules">
        <uv-form-item label="日期时间" prop="dataSource.date" required>
          <div class="w-full">
            <picker :value="dataSource.date" mode="date" @change="onDateChange">
              <div class="flex items-center rounded-lg bg-[#efefef] p-2">
                <div class="mr-2 text-2xl text-red font-bold">
                  {{ dataSource.date ? dataSource.date.split('-')[2] : '--' }}
                </div>
                <div>
                  <div>{{ dataSource.lunarDate }}</div>
                  <div class="text-sm text-gray">
                    {{ dataSource.date }}
                  </div>
                </div>
                <div class="ml-auto">
                  <wd-icon name="arrow-right" />
                </div>
              </div>
            </picker>
          </div>
        </uv-form-item>
        <uv-form-item label="礼簿名称" prop="dataSource.title" required>
          <uv-input v-model="dataSource.title" placeholder="例如：新婚礼簿" clearable />
        </uv-form-item>
        <uv-form-item label="是否有宴席" prop="dataSource.isBanquet" label-position="left">
          <uv-switch v-model="dataSource.isBanquet" class="ms-auto" active-color="#F87171" />
        </uv-form-item>
        <uv-form-item v-if="dataSource.isBanquet" label="成本" prop="dataSource.cost">
          <uv-input v-model="dataSource.cost" type="number" placeholder="宴席、伴手礼等费用" />
        </uv-form-item>
        <uv-form-item label="备注" prop="dataSource.remarks">
          <uv-textarea v-model="dataSource.remarks" placeholder="添加细节，让回忆更完整" />
        </uv-form-item>
      </uv-form>
    </div>
    <wd-button block :loading="loading" @click="onSubmit">
      保存
    </wd-button>
    <div class="text-xs text-gray">
      一场宴席活动中，用来登记所有来宾贺礼的名册，称为礼簿。
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
