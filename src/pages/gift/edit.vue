<script setup lang="ts">
import dayjs from 'dayjs'
import { giftCategory } from '@/constants/app'

definePage({
  style: {
    navigationBarTitleText: '人情往来',
  },
})

// '结婚': 'i-bi-postcard-heart',
// '宝宝': 'i-hugeicons-baby-01',
// '周岁': 'i-icon-park-outline-baby-feet',
// '乔迁': 'i-tabler-home-move',
// '生日': 'i-mingcute-cake-line',
// '升学': 'i-hugeicons-student',
// '福寿': 'i-mingcute-blessing-line',
// '探望': 'i-healthicons-fruits-outline',
// '白事': 'i-tabler-candle',
// '其他': 'i-mingcute-wallet-2-line',

const money = ref({
  amount: 0,
  type: '送礼',
  preset: [100, 200, 500, 800, 1000, 2000],
})

const columns = Object.entries(giftCategory)
  .map(([name, icon]) => ({ name, icon }))
const dataSource = ref<Api.Gift>({
  moneyType: 0,
})

const loading = ref(false)
const formRef = ref()

onLoad(async (option) => {
  if (option?.id) {
    uni.setNavigationBarTitle({
      title: '编辑',
    })
    dataSource.value = await apiGiftGet({ id: option.id })
    money.value.type = (dataSource.value.money ?? 0) > 0 ? '收礼' : '送礼'
    money.value.amount = Math.abs(dataSource.value.money || 0)
  }
  else {
    dataSource.value.date = dayjs().format('YYYY-MM-DD')
    dataSource.value.lunarDate = generateLunarDate(new Date())
  }

  if (option?.friendId) {
    dataSource.value.friendId = option.friendId
    dataSource.value.friendName = option.friendName
  }
})

function onSelectIcont(i: any) {
  dataSource.value.icon = i.icon
  if (i.name === '其他')
    dataSource.value.title = ''
  else dataSource.value.title = i.name
}

const selectedIconStyle = computed(() => {
  return dataSource.value.icon !== 'i-tabler-candle'
    ? 'text-white bg-red'
    : 'text-white bg-gray'
})

const onSubmit = async () => {
  try {
    await formRef.value.validate()
  }
  catch {
    return
  }
  loading.value = true
  if (money.value.type === '送礼')
    dataSource.value.money = -Math.abs(money.value.amount || 0)
  else
    dataSource.value.money = Math.abs(money.value.amount || 0)

  const api = dataSource.value.id ? apiGiftPut : apiGiftPost
  await api(dataSource.value)
  uni.navigateBack()
  uni.showToast({
    title: '保存成功',
    icon: 'none',
  })

  loading.value = false
}

const onSelectFriend = () => {
  uni.navigateTo({
    url: '/pages/friend/select',
    events: {
      acceptDataFromOpenedPage(e: Api.Friend) {
        dataSource.value.friendId = e.id
        dataSource.value.friendName = e.name
      },
    },
  })
}

const rules = {
  'dataSource.date': { required: true, message: '请选择日期时间', trigger: ['blur', 'change'] },
  'dataSource.friendName': { required: true, message: '请输入亲友姓名', trigger: ['blur', 'change'] },
  'dataSource.title': { required: true, message: '请填写事由', trigger: ['blur', 'change'] },
}

const onDateChange = (e: any) => {
  dataSource.value.date = e.detail.value
  dataSource.value.lunarDate = generateLunarDate(new Date(e.detail.value))
}
</script>

<template>
  <div class="mx-3 space-y-3">
    <div class="grid grid-cols-5 mt-3 justify-items-center gap-2 rounded-2xl bg-white p-4">
      <div v-for="i in columns" :key="i.name" @click="onSelectIcont(i)">
        <div class="h-12 w-12 flex rounded-full" :class="[
          i.icon === dataSource.icon
            ? selectedIconStyle
            : 'bg-gray-100  text-gray',
        ]"
        >
          <div class="m-auto h-8 w-8" :class="i.icon" />
        </div>
        <div class="mt-1 text-center text-sm">
          {{ i.name }}
        </div>
      </div>
    </div>

    <div class="rounded-2xl bg-white p-5">
      <uv-form ref="formRef" label-width="100" label-position="top" :model="{ dataSource, money }" :rules="rules">
        <uv-form-item label="往来方向">
          <wd-segmented v-model:value="money.type" :options="['送礼', '收礼']" />
        </uv-form-item>

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
        <uv-form-item label="礼金类型" label-position="left">
          <wd-radio-group v-model="dataSource.moneyType" shape="button" class="ms-auto line-height-none">
            <wd-radio :value="0">
              现金
            </wd-radio>
            <wd-radio :value="1">
              实物
            </wd-radio>
          </wd-radio-group>
        </uv-form-item>
        <uv-form-item label="金额" prop="money.amount">
          <uv-input v-model="money.amount" placeholder="礼金或实物金额" type="number" />
        </uv-form-item>
        <div class="flex justify-around">
          <div v-for="i in money.preset" :key="i">
            <wd-button size="small" type="info" @click="money.amount = i">
              {{ i }}
            </wd-button>
          </div>
        </div>

        <uv-form-item label="亲友" prop="dataSource.friendName" required>
          <uv-input v-model="dataSource.friendName" :disabled="!!dataSource.id" placeholder="输入姓名，或点击右侧选择">
            <template #suffix>
              <div class="i-hugeicons-contact-01 text-base text-gray" @click="onSelectFriend" />
            </template>
          </uv-input>
        </uv-form-item>
        <uv-form-item label="事由" prop="dataSource.title" required>
          <uv-input v-model="dataSource.title" placeholder="例如：结婚" />
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
      点亮人情往来的记忆微光，让每一次记账都成为温情的诗行。
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
