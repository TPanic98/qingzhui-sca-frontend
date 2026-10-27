<template>
  <div class="qz-auth" :class="{ 'qz-auth-error': error }">
    <header class="qz-auth-header">
      <QingzhuiBrand :slogan="slogan" />
    </header>
    <main class="qz-auth-main">
      <section v-if="!error" class="qz-auth-intro">
        <p class="qz-eyebrow" lang="en">DEVELOPMENT SECURITY</p>
        <h1>
          <span class="qz-gradient-text">{{ brand.name }}</span>
          <span class="qz-auth-title">{{ brand.subtitle }}</span>
        </h1>
        <p class="qz-auth-description">{{ brand.description }}</p>
        <div class="qz-auth-capabilities">
          <span
            ><i class="fa fa-sitemap" aria-hidden="true" />{{
              $t('message.projects')
            }}</span
          >
          <span
            ><i class="fa fa-cubes" aria-hidden="true" />{{
              $t('message.components')
            }}</span
          >
          <span
            ><i class="fa fa-shield" aria-hidden="true" />{{
              $t('message.vulnerabilities')
            }}</span
          >
        </div>
        <div class="qz-auth-art" aria-hidden="true">
          <div class="qz-art-orbit" />
          <div class="qz-art-sheet qz-art-sheet-back" />
          <div class="qz-art-sheet qz-art-sheet-front">
            <div class="qz-art-dots"><span /><span /><span /></div>
            <div class="qz-art-line" />
            <div class="qz-art-line" />
            <div class="qz-art-line qz-art-line-short" />
          </div>
          <div class="qz-art-shield"><i class="fa fa-shield" /></div>
          <div class="qz-art-spark" />
        </div>
      </section>
      <section class="qz-auth-card">
        <slot name="notice" />
        <slot />
      </section>
    </main>
    <footer class="qz-auth-footer">{{ brand.platformName }}</footer>
    <slot name="modals" />
  </div>
</template>

<script>
import brand from './brand';
import QingzhuiBrand from './Brand.vue';

export default {
  name: 'QingzhuiAuthLayout',
  components: { QingzhuiBrand },
  props: {
    slogan: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
  },
  data: () => ({ brand }),
};
</script>
