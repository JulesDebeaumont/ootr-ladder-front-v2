<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  getDarkModeStateStorage,
  setDarkModeStorage,
} from 'src/utils/local-storage';
import { useUserStore } from 'src/stores/user-store';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
// components
import ButtonHeader from 'src/components/layout/ButtonHeader.vue';

// interface
interface IButtonInfo {
  targetRoute: string;
  label: string;
  icon: string;
}

// consts
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const headerButtonInfos: IButtonInfo[] = [
  {
    targetRoute: 'schedule',
    label: 'Schedule',
    icon: 'home',
  },
  {
    targetRoute: 'leaderboard',
    label: 'Leaderboard',
    icon: 'leaderboard',
  },
  {
    targetRoute: 'session',
    label: 'Past sessions',
    icon: 'table_rows',
  },
  {
    targetRoute: 'wiki',
    label: 'Wiki',
    icon: 'import_contacts',
  },
];

// refs
const darkModeRef = ref(false);
const isLoadingMode = ref(true);

// functions
function toggleDarkMode() {
  darkModeRef.value = !darkModeRef.value;
  setDarkModeStorage(darkModeRef.value);
}
function openDiscordLink() {
  window.open('https://discord.gg/yXzzR8mdaf', '_blank')?.focus();
}
async function logout() {
  await userStore.logout();
  if (route.name === 'profile') {
    router.push({ name: 'schedule' });
  }
}

// computeds
const getBgImagebyRoute = computed(() => {
  if (route.name === 'annoying-cucco') {
    return `background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('/images/background_cucco.png');`;
  }
  return darkModeRef.value
    ? `background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('/images/background_dark.png');`
    : `background-image: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
    url('/images/background_light.png');`;
});
const isMobileMode = computed(() => {
  return $q.screen.width < 1000;
});

// lifeCycle
onMounted(async () => {
  darkModeRef.value = getDarkModeStateStorage();
  setDarkModeStorage(darkModeRef.value);
  isLoadingMode.value = false;
  await userStore.getProfiles();
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-primary" style="height: 52px" :elevated="!darkModeRef">
      <q-toolbar v-if="isLoadingMode === false">
        <div class="flex row no-wrap items-center justify-between full-width">
          <div
            class="flex row no-wrap justify-between"
            :class="isMobileMode ? 'full-width' : ''"
          >
            <div class="q-gutter-x-md flex row no-wrap items-center">
              <q-img
                src="/images/triforce.png"
                style="height: 35px; width: 35px"
                spinner-color="dark"
              />
              <q-toolbar-title
                style="flex: none"
                class="q-pl-xs q-ml-sm text-h6 text-title"
              >
                OoTR Ladder
              </q-toolbar-title>
            </div>
            <div v-if="!isMobileMode" class="flex row no-wrap items-center q-gutter-x-sm q-pl-lg">
              <ButtonHeader
                v-for="buttonInfo in headerButtonInfos"
                :key="buttonInfo.label"
                :targetRoute="buttonInfo.targetRoute"
                :label="buttonInfo.label"
                :icon="buttonInfo.icon"
                :mobile-mode="false"
              />
            </div>

            <!-- Menu mobile -->
            <div v-else class="flex row">
              <q-btn-dropdown color="accent" label="Menu">
                <q-list>
                  <ButtonHeader
                    v-for="buttonInfo in headerButtonInfos"
                    :key="buttonInfo.label"
                    :targetRoute="buttonInfo.targetRoute"
                    :label="buttonInfo.label"
                    :icon="buttonInfo.icon"
                    :mobileMode="true"
                  />
                  <q-separator />
                  <q-item
                    clickable
                    class="flex row items-center bg-primary"
                    @click="toggleDarkMode"
                  >
                    <span class="text-dark-bis">{{
                      darkModeRef ? 'Light mode' : 'Dark mode'
                    }}</span>
                  </q-item>
                  <q-item
                    clickable
                    class="flex row items-center bg-primary"
                    @click="openDiscordLink"
                  >
                    Discord OoTR Ladder
                  </q-item>
                  <q-separator />
                  <template v-if="userStore.isConnected">
                    <q-item
                      clickable
                      class="flex row items-center bg-primary"
                      :to="{ name: 'my-profile' }"
                    >
                      My profile
                    </q-item>
                    <q-item
                      clickable
                      class="flex row items-center bg-primary"
                      @click="logout()"
                    >
                      Sign out
                    </q-item>
                  </template>

                  <template v-else>
                    <q-item
                      clickable
                      class="flex row items-center bg-primary"
                      @click="userStore.login()"
                    >
                      Sign in
                    </q-item>
                  </template>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>

          <div
            v-if="!isMobileMode"
            class="q-gutter-x-sm flex row no-wrap items-center"
          >
            <q-icon
              size="xs"
              class="cursor-pointer"
              :color="darkModeRef ? 'warning' : 'info'"
              :name="darkModeRef ? 'light_mode' : 'dark_mode'"
              @click="toggleDarkMode"
              ><q-tooltip>{{
                darkModeRef ? 'Light mode' : 'Dark mode'
              }}</q-tooltip>
            </q-icon>

            <q-icon
              name="discord"
              @click="openDiscordLink"
              size="xs"
              color="discord-light"
              class="cursor-pointer"
            >
              <q-tooltip>Link discord OoTR Ladder</q-tooltip>
            </q-icon>

            <q-icon
              size="xs"
              class="cursor-pointer"
              @click="router.push({ name: 'annoying-cucco' })"
            >
              <q-img src="/images/cojiro.png" />
              <q-tooltip>Cucco minigame</q-tooltip>
            </q-icon>

            <q-btn-dropdown
              v-if="userStore.isConnected"
              round
              flat
              class="q-ml-md"
              text-color="dark-bis"
            >
              <template v-slot:label>
                <q-avatar size="26px">
                  <q-img
                    :src="`https://cdn.discordapp.com/avatars/${userStore.discordProfil?.id}/${userStore.discordProfil?.avatar}`"
                  />
                </q-avatar>
              </template>

              <q-list class="bg-accent">
                <q-item clickable>
                  <q-item-section>
                    <q-item-label @click="router.push({ name: 'my-profile' })">
                      <template v-if="userStore.isOldDiscordUser">
                        {{ userStore.discordProfil?.global_name }}
                      </template>
                      <template v-else>
                        {{ userStore.discordProfil?.username }}#{{
                          userStore.discordProfil?.discriminator
                        }}
                      </template>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="logout()">
                  <q-item-section>
                    <q-item-label>Sign out</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <q-btn
              v-else
              class="q-ml-md bg-discord"
              no-caps
              @click="userStore.login()"
            >
              <q-icon name="discord" class="q-pr-sm" />
              Sign in
            </q-btn>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container
      v-if="isLoadingMode === false"
      id="ootr-ladder-page-container"
      class="flex flex-center column"
      :style="getBgImagebyRoute"
    >
      <q-page
        class="q-pa-sm text-white q-pt-lg flex column"
        style="max-width: 1500px; width: 100%"
      >
        <router-view :key="route.path" v-slot="{ Component }">
          <transition
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </q-page>
    </q-page-container>

    <q-page-container v-else>
      <q-page class="bg-black full-height full-width"></q-page>
    </q-page-container>
  </q-layout>
</template>

<style>
#ootr-ladder-page-container {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
</style>
