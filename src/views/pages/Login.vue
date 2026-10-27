<template>
  <QingzhuiAuthLayout slogan>
    <template #notice>
      <aside
        v-if="isWelcomeMessage && welcomeMessage"
        class="qz-welcome-message"
      >
        <div v-html="welcomeMessage" />
      </aside>
    </template>
    <div class="qz-auth-form-icon">
      <i class="fa fa-lock" aria-hidden="true" />
    </div>
    <p class="qz-eyebrow" lang="en">ACCOUNT ACCESS</p>
    <h2 id="login-title">{{ $t('message.login') }}</h2>
    <p class="qz-form-description">{{ $t('message.login_desc') }}</p>
    <validation-observer tag="div" v-slot="{ passes }">
      <b-form
        novalidate
        @submit.prevent.stop="passes(login)"
        aria-labelledby="login-title"
        :aria-busy="isSubmitting"
      >
        <b-validated-input-group-form-input
          v-show="showLoginForm"
          id="username"
          :label="$t('message.username')"
          input-group-size="mb-3"
          rules="required"
          mode="passive"
          icon="icon-user"
          type="text"
          autocomplete="username"
          v-model="input.username"
          autofocus="true"
          lazy="true"
        />
        <b-validated-input-group-form-input
          v-show="showLoginForm"
          id="password"
          :label="$t('message.password')"
          input-group-size="mb-3"
          rules="required"
          mode="passive"
          icon="icon-lock"
          type="password"
          autocomplete="current-password"
          v-model="input.password"
          lazy="true"
        />
        <b-button
          v-show="showLoginForm"
          block
          variant="primary"
          type="submit"
          class="qz-auth-submit"
          :disabled="isSubmitting"
        >
          <b-spinner
            v-if="isSubmitting"
            small
            aria-hidden="true"
            class="mr-2"
          />
          {{ $t('message.login') }}
          <i
            v-if="!isSubmitting"
            class="fa fa-arrow-right"
            aria-hidden="true"
          />
        </b-button>
        <b-button
          v-if="oidcAvailable"
          block
          :variant="showLoginForm ? 'outline-primary' : 'primary'"
          class="qz-auth-submit"
          @click="oidcLogin()"
        >
          <span v-if="oidcCheckLoginButtonTextSetted()">{{
            oidcLoginButtonText()
          }}</span>
          <img
            v-else
            alt="OpenID"
            src="@/assets/img/openid-logo.svg"
            width="72"
          />
        </b-button>
        <b-button
          v-if="oidcAvailable && !showLoginForm"
          block
          variant="link"
          class="mt-3"
          @click="showLoginForm = true"
        >
          {{ $t('message.login_more_options') }}
        </b-button>
      </b-form>
    </validation-observer>
    <template #modals>
      <informational-modal :message="loginError" />
    </template>
  </QingzhuiAuthLayout>
</template>

<script>
import axios from 'axios';
import Oidc from 'oidc-client';
// bootstrap-table still relies on jQuery for ajax calls, even though there's a supported Vue wrapper for it.
import { ValidationObserver } from 'vee-validate';
import BValidatedInputGroupFormInput from '../../forms/BValidatedInputGroupFormInput';
import InformationalModal from '../modals/InformationalModal';
import EventBus from '../../shared/eventbus';
import { getRedirectUrl, getContextPath } from '../../shared/utils';
const qs = require('querystring');
import common from '../../shared/common';
import * as permissions from '../../shared/permissions';
import DOMPurify from 'dompurify';
import QingzhuiAuthLayout from '@/qingzhui/AuthLayout.vue';

export default {
  name: 'QingzhuiLogin',
  components: {
    QingzhuiAuthLayout,
    InformationalModal,
    BValidatedInputGroupFormInput,
    ValidationObserver,
  },
  data() {
    return {
      isWelcomeMessage: true,
      welcomeMessage: '',
      loginError: '',
      isSubmitting: false,
      input: {
        username: '',
        password: '',
      },
      oidcAvailable: false,
      oidcUserManager: new Oidc.UserManager({
        userStore: new Oidc.WebStorageStateStore(),
        authority: this.$oidc.ISSUER,
        client_id: this.$oidc.CLIENT_ID,
        redirect_uri:
          getContextPath() !== ''
            ? `${window.location.origin}${getContextPath()}/static/oidc-callback.html`
            : `${window.location.origin}/static/oidc-callback.html`,
        response_type:
          this.$oidc.FLOW === 'implicit' ? 'token id_token' : 'code',
        scope: this.$oidc.SCOPE,
        loadUserInfo: false,
      }),
      showLoginForm: false,
    };
  },
  beforeMount() {
    let enabled_url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/public/general/welcome.message.enabled`;
    axios
      .get(enabled_url)
      .then((response) => {
        this.isWelcomeMessage = common.toBoolean(response.data.propertyValue);
      })
      .then(() => {
        if (this.isWelcomeMessage) {
          let message_url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/public/general/welcome.message.html`;
          axios.get(message_url).then((response) => {
            this.welcomeMessage = DOMPurify.sanitize(
              decodeURIComponent(response.data.propertyValue),
            );
          });
        }
      });
  },
  methods: {
    login() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      const url = this.$api.BASE_URL + '/' + this.$api.URL_LOGIN;
      const requestBody = {
        username: this.input.username,
        password: this.input.password,
      };
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      // redirect to url from query param but only if it is save for redirection
      const redirectTo = getRedirectUrl(this.$router);
      axios
        .post(url, qs.stringify(requestBody), config)
        .then((result) => {
          if (result.status === 200) {
            return this.fetchAndCheckPermissions(result.data, redirectTo);
          }
        })
        .catch((err) => {
          if (!err.response) return;
          if (err.response.status === 401) {
            if (err.response.data === this.$api.FORCE_PASSWORD_CHANGE) {
              this.$router.replace({
                name: 'PasswordForceChange',
                query: { redirect: redirectTo },
              });
              return;
            }
            this.$bvModal.show('modal-informational');
            this.loginError = this.$t('message.login_unauthorized');
          } else if (err.response.status === 403) {
            this.$bvModal.show('modal-informational');
            this.loginError = this.$t('message.login_forbidden');
          }
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
    fetchAndCheckPermissions(token, redirectTo) {
      const permUrl =
        this.$api.BASE_URL + '/' + this.$api.URL_USER_SELF_PERMISSIONS;
      return axios
        .get(permUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then((result) => {
          if (!Array.isArray(result.data)) {
            throw new Error(
              `Unexpected permissions response: ${JSON.stringify(result.data)}`,
            );
          }
          if (result.data.includes(permissions.VIEW_PORTFOLIO)) {
            permissions.storePermissions(result.data);
            EventBus.$emit('authenticated', token);
            redirectTo
              ? this.$router.replace(redirectTo)
              : this.$router.replace({ name: 'Dashboard' });
          } else {
            this.$bvModal.show('modal-informational');
            this.loginError = this.$t('message.login_permission_required');
          }
        })
        .catch(() => {
          this.$bvModal.show('modal-informational');
          this.loginError = this.$t('condition.unsuccessful_action');
        });
    },
    isOidcAvailableInFrontend() {
      return (
        this.oidcUserManager.settings.authority &&
        this.oidcUserManager.settings.client_id &&
        this.oidcUserManager.settings.scope
      );
    },
    checkOidcAvailability() {
      if (!this.isOidcAvailableInFrontend()) {
        return Promise.resolve(false);
      }

      const url = this.$api.BASE_URL + '/' + this.$api.URL_OIDC_AVAILABLE;

      return axios
        .get(url)
        .then((result) => {
          var oidcAvailableInBackend = false;
          if (result.status === 200) {
            oidcAvailableInBackend = result.data === true;
          }
          return oidcAvailableInBackend;
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    oidcLogin() {
      this.oidcUserManager
        .signinRedirect({
          state: getRedirectUrl(this.$router),
        })
        .catch((err) => {
          console.log(err);
          this.$toastr.e(this.$t('message.oidc_redirect_failed'));
        });
    },
    oidcCheckLoginButtonTextSetted() {
      return this.$oidc.LOGIN_BUTTON_TEXT.length > 0;
    },
    oidcLoginButtonText() {
      return this.$oidc.LOGIN_BUTTON_TEXT;
    },
    goToLogin() {
      this.isWelcomeMessage = false;
    },
  },
  mounted() {
    this.checkOidcAvailability()
      .then((oidcAvailable) => {
        this.oidcAvailable = oidcAvailable;
        this.showLoginForm = !oidcAvailable;

        if (!oidcAvailable) {
          return;
        }

        this.oidcUserManager.getUser().then((oidcUser) => {
          // oidcUser will only be set when coming from oidc-callback.html
          if (oidcUser === null) {
            return;
          }

          // Exchange OAuth2 Access Token for a session token issued by Dependency-Track
          const url = this.$api.BASE_URL + '/' + this.$api.URL_USER_OIDC_LOGIN;
          const requestBody = {
            accessToken: oidcUser.access_token,
            idToken: oidcUser.id_token,
          };
          const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          };

          this.axios
            .post(url, qs.stringify(requestBody), config)
            .then((result) => {
              if (result.status === 200) {
                const redirectTo = getRedirectUrl(this.$router);
                return this.fetchAndCheckPermissions(result.data, redirectTo);
              }
            })
            .catch((err) => {
              if (err.response.status === 401) {
                this.$bvModal.show('modal-informational');
                this.loginError = this.$t('message.login_unauthorized');
              } else if (err.response.status === 403) {
                this.$bvModal.show('modal-informational');
                this.loginError = this.$t('message.login_forbidden');
              }
            })
            .finally(() => {
              this.oidcUserManager.removeUser();
            });
        });
      })
      .catch(() => {
        // automatic fallback to login form when oidc availability check failed
        this.showLoginForm = true;
        this.$toastr.e(this.$t('message.oidc_availability_check_failed'));
      });
  },
};
</script>
