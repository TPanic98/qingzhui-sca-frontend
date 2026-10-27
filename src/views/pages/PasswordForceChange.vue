<template>
  <QingzhuiAuthLayout>
    <div class="qz-auth-form-icon">
      <i class="fa fa-key" aria-hidden="true" />
    </div>
    <validation-observer tag="div" v-slot="{ passes }">
      <b-form
        novalidate
        @submit.prevent="passes(changePassword)"
        aria-labelledby="password-change-title"
        :aria-busy="isSubmitting"
      >
        <h2 id="password-change-title">
          {{ $t('message.password_force_change') }}
        </h2>
        <p class="qz-form-description">
          {{ $t('message.password_force_change_desc') }}
        </p>
        <b-validated-input-group-form-input
          id="username"
          :label="$t('message.username')"
          input-group-size="mb-3"
          rules="required"
          mode="passive"
          lazy="true"
          icon="icon-user"
          type="text"
          autocomplete="username email"
          v-model="input.username"
        />
        <b-validated-input-group-form-input
          id="current-password"
          :label="$t('message.password_current')"
          input-group-size="mb-3"
          rules="required"
          mode="passive"
          lazy="true"
          icon="icon-lock"
          type="password"
          autocomplete="current-password"
          v-model="input.password"
        />
        <b-validated-input-group-form-input
          id="new-password"
          :label="$t('message.password_new')"
          input-group-size="mb-3"
          rules="required"
          mode="passive"
          lazy="true"
          icon="icon-lock"
          type="password"
          autocomplete="new-password"
          v-model="input.newPassword"
        />
        <b-validated-input-group-form-input
          id="confirm-password"
          :label="$t('message.password_confirm')"
          input-group-size="mb-3"
          rules="required|confirmed:new-password"
          mode="passive"
          lazy="true"
          icon="icon-lock"
          type="password"
          autocomplete="new-password"
          v-model="input.confirmPassword"
        />
        <b-row>
          <b-col>
            <b-button
              block
              variant="primary"
              class="qz-auth-submit"
              :disabled="isSubmitting"
              type="submit"
              ><b-spinner
                v-if="isSubmitting"
                small
                aria-hidden="true"
                class="mr-2"
              />{{ $t('message.password_change') }}</b-button
            >
          </b-col>
        </b-row>
      </b-form>
    </validation-observer>

    <template #modals>
      <InformationalModal :message="passwordChangeError" />
    </template>
  </QingzhuiAuthLayout>
</template>

<script>
import axios from 'axios';
import { ValidationObserver } from 'vee-validate';
import InformationalModal from '../modals/InformationalModal';
import BValidatedInputGroupFormInput from '../../forms/BValidatedInputGroupFormInput';
import { getRedirectUrl } from '../../shared/utils';
import QingzhuiAuthLayout from '@/qingzhui/AuthLayout.vue';
const qs = require('querystring');

export default {
  name: 'PasswordForceChange',
  components: {
    QingzhuiAuthLayout,
    BValidatedInputGroupFormInput,
    InformationalModal,
    ValidationObserver,
  },
  data() {
    return {
      passwordChangeError: '',
      isSubmitting: false,
      input: {
        username: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
      },
    };
  },
  methods: {
    changePassword() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      const url = `${this.$api.BASE_URL}/${this.$api.URL_FORCE_PW_CHANGE}`;
      const requestBody = {
        username: this.input.username,
        password: this.input.password,
        newPassword: this.input.newPassword,
        confirmPassword: this.input.confirmPassword,
      };
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      axios
        .post(url, qs.stringify(requestBody), config)
        .then((result) => {
          if (result.status === 200) {
            this.$toastr.s(this.$t('message.password_change_success'));
            // No session token is returned on password change;
            // reroute users back to login
            const redirectTo = getRedirectUrl(this.$router);
            this.$router.replace({
              name: 'Login',
              query: { redirect: redirectTo },
            });
          }
        })
        .catch((err) => {
          if (!err.response) return;
          if (err.response.status === 401) {
            this.$bvModal.show('modal-informational');
            this.passwordChangeError = this.$t('message.password_unauthorized');
          } else if (err.response.status === 406) {
            this.$bvModal.show('modal-informational');
            this.passwordChangeError = this.$t(
              'message.password_not_acceptable',
            );
          }
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
  },
};
</script>
