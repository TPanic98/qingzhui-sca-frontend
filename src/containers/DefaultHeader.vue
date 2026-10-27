<template>
  <AppHeader fixed class="qz-app-header">
    <SidebarToggler class="d-lg-none" display="md" mobile />
    <SidebarToggler class="d-md-down-none" display="lg" :defaultOpen="true" />
    <router-link to="/dashboard" class="qz-header-brand">
      <QingzhuiBrand />
    </router-link>
    <b-navbar-nav class="ml-auto">
      <DefaultHeaderProfileDropdown />
    </b-navbar-nav>
  </AppHeader>
</template>
<script>
import { Header as AppHeader, SidebarToggler } from '@coreui/vue';
import DefaultHeaderProfileDropdown from './DefaultHeaderProfileDropdown';
import QingzhuiBrand from '@/qingzhui/Brand.vue';

export default {
  name: 'DefaultHeader',
  components: {
    AppHeader,
    DefaultHeaderProfileDropdown,
    SidebarToggler,
    QingzhuiBrand,
  },
};
</script>
