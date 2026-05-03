<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '亲友',
  },
})
const dataSource = ref<Api.Friend>({
  tagList: [],
})
onLoad(async (option) => {
  if (option?.id) {
    uni.setNavigationBarTitle({
      title: '编辑',
    })
    dataSource.value = await apiFriendGet({ id: option.id })
    dataSource.value.tagList ||= []
  }
})
const loading = ref(false)
const formRef = ref()
const onSubmit = async () => {
  try {
    await formRef.value.validate()
  }
  catch {
    return
  }
  loading.value = true
  const api = dataSource.value.id ? apiFriendPut : apiFriendPost
  await api(dataSource.value)
  uni.navigateBack()
  uni.showToast({
    title: '保存成功',
    icon: 'none',
  })
  loading.value = false
}

const rules = {
  'dataSource.name': { required: true, message: '请填写亲友姓名', trigger: ['blur', 'change'] },
}
</script>

<template>
  <div class="mx-3 space-y-3">
    <div class="rounded-2xl bg-white p-5">
      <uv-form ref="formRef" label-width="100" label-position="top" :model="{ dataSource }" :rules="rules">
        <uv-form-item label="姓名" prop="dataSource.name" required>
          <uv-input v-model="dataSource.name" clearable placeholder="请输入姓名" />
        </uv-form-item>
        <uv-form-item label="关系" prop="dataSource.relation">
          <uv-input v-model="dataSource.relation" placeholder="例如：舅舅" />
        </uv-form-item>
        <uv-form-item label="标签" prop="dataSource.tagList">
          <div class="w-full">
            <wd-select-picker
              v-model="dataSource.tagList"
              :columns="useAuthStore().friendTagPickerColumns"
            >
              <div class="friend-tag-trigger">
                <div class="friend-tag-trigger__value" :class="{ 'is-placeholder': !dataSource.tagList?.length }">
                  {{ dataSource.tagList?.length ? dataSource.tagList.join('、') : '请选择标签' }}
                </div>
                <wd-icon name="arrow-right" />
              </div>
            </wd-select-picker>
          </div>
        </uv-form-item>
        <uv-form-item label="备注" prop="dataSource.remarks">
          <uv-textarea v-model="dataSource.remarks" placeholder="请输入内容" />
        </uv-form-item>
      </uv-form>
    </div>
    <wd-button block :loading="loading" @click="onSubmit">
      保存
    </wd-button>
  </div>
</template>

<style lang="scss" scoped>
.friend-tag-trigger {
  display: flex;
  align-items: center;
  border: 1rpx solid #dadbde;
  border-radius: 8rpx;
  background: #fff;
  color: #303133;
  font-size: 15px;
  padding: 6px 9px;
}

.friend-tag-trigger__value {
  min-width: 0;
  flex: 1;
  line-height: 26px;
}

.friend-tag-trigger__value.is-placeholder {
  color: #c0c4cc;
}
</style>
