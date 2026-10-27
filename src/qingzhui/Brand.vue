<template>
  <div class="qz-brand">
    <img class="qz-bank-logo" :src="bankLogo" :alt="brand.bankName" />
    <div v-if="slogan" class="qz-brand-slogan">
      <span lang="en">{{ brand.slogan.en }}</span>
      <span>{{ brand.slogan.zh }}</span>
    </div>
    <div v-else-if="platform" class="qz-brand-platform">
      <strong>{{ brand.name }}</strong>
      <span>{{ brand.subtitle }}</span>
    </div>
  </div>
</template>

<script>
import brand from './brand';
import bankLogo from '@/assets/img/brand/bea-logo.png';

export default {
  name: 'QingzhuiBrand',
  props: {
    platform: { type: Boolean, default: true },
    slogan: { type: Boolean, default: false },
  },
  data: () => ({ brand, bankLogo }),
};
</script>
