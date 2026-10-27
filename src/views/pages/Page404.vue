<template>
  <QingzhuiAuthLayout error>
    <div class="qz-error-code" aria-hidden="true">404</div>
    <h1>{{ $t('404.heading') }}</h1>
    <p class="qz-form-description">{{ $t('404.message') }}</p>
    <div class="qz-error-actions">
      <b-button variant="primary" @click="$router.back()">{{
        $t('404.action')
      }}</b-button>
      <b-button variant="outline-primary" to="/dashboard">{{
        $t('message.home')
      }}</b-button>
    </div>
  </QingzhuiAuthLayout>
</template>

<script>
import QingzhuiAuthLayout from '@/qingzhui/AuthLayout.vue';

export default {
  name: 'QingzhuiNotFound',
  components: { QingzhuiAuthLayout },
};
</script>
