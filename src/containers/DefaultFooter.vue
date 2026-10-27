<template>
  <TheFooter>
    <span class="qz-footer-name">{{ brand.platformName }}</span>
    <div class="ml-auto">
      <b-button variant="link" class="qz-about-button" v-b-modal.aboutModal>
        {{ $t('message.about') }} <span>v{{ $version.version }}</span>
      </b-button>
    </div>
    <about-modal />
  </TheFooter>
</template>
<script>
import AboutModal from '../views/components/AboutModal';
import { Footer as TheFooter } from '@coreui/vue';
import brand from '@/qingzhui/brand';

export default {
  name: 'DefaultFooter',
  data: () => ({ brand }),
  components: {
    AboutModal,
    TheFooter,
  },
};
</script>
<style scoped>
footer {
  flex: 0 0 36px;
  font-size: 85%;
}
</style>
