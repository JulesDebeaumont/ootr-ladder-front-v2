<script setup lang="ts">
import { watch, ref, toRef, onMounted, computed } from 'vue';
import { notifyError } from 'src/utils/notify';
import { api } from 'src/boot/axios';
import { IUserProfile, IAchievement, IRace } from 'src/components/models';
import { useUserStore } from 'src/stores/user-store';
import { useRoute } from 'vue-router';
// components
import AchievementItem from 'src/components/general/AchievementItem.vue';
import RaceTable from 'src/components/session/RaceTable.vue';

// consts
const userStore = useUserStore();
const route = useRoute();
const usernameParams = String(route.params.username);
const infosType = ['achievements', 'races'];

// refs
const isLoading = ref(false);
const profile = ref<IUserProfile | null>(null);
const profilesRaces = ref<IRace[] | null>(null);
const profileAchievements = ref<IAchievement[] | null>(null);
const myProfileNotFound = ref(false);
const storeHasCheckProfile = toRef(userStore, 'hasSetupProfile');
const isMyProfileMode = ref(true);
const profileNotFound = ref(false);
const infosMode = ref(infosType.at(0));

// functions
async function getMyProfile() {
  isLoading.value = true;
  try {
    const ladderProfile = await api.get(`player/${userStoreUserName.value}`);
    profile.value = ladderProfile?.data ?? null;
  } catch (error: any) {
    if ((error.response?.status ?? 0) === 404) {
      myProfileNotFound.value = true;
      userStore.hasRegister = false;
    } else {
      console.error(error);
      notifyError();
    }
  } finally {
    isLoading.value = false;
  }
}
async function getProfileByUsername(username: string) {
  isLoading.value = true;
  try {
    const userProfile = await api.get(
      `player/${formatDiscordUsername(username)}`
    );
    profile.value = userProfile?.data ?? null;
  } catch (error: any) {
    if ((error.response?.status ?? 0) === 404) {
      profileNotFound.value = true;
    } else {
      console.error(error);
      notifyError();
    }
  } finally {
    isLoading.value = false;
  }
}
async function getRacesByUsername(username: string) {
  isLoading.value = true;
  try {
    const sessionResponse = await api.get(`player/${formatDiscordUsername(username)}/races`);
    profilesRaces.value = sessionResponse.data;
  } catch (error) {
    console.error(error);
    notifyError();
  } finally {
    isLoading.value = false;
  }
}
async function getAchievementsByUsername(username: string) {
  isLoading.value = true;
  try {
    const achievementsResponse = await api.get(
      `player/${formatDiscordUsername(username)}/achievements`
    );
    const achievements = achievementsResponse.data as IAchievement[];
    let achievementsDone = achievements.filter((achievFilter) => {
      return achievFilter.active === true;
    });
    achievementsDone = achievementsDone.sort((achievA, achievB) => {
      return achievB.code.localeCompare(achievA.code);
    });
    let achievementsUndone = achievements.filter((achievFilter) => {
      return achievFilter.active !== true;
    });
    achievementsUndone = achievementsUndone.sort((achievA, achievB) => {
      return (
        (achievB.data?.prog ?? 0) / (achievB.data?.max ?? 1) -
        (achievA.data?.prog ?? 0) / (achievA.data?.max ?? 1)
      );
    });
    profileAchievements.value = achievementsDone.concat(achievementsUndone);
  } catch (error) {
    console.error(error);
    notifyError();
  } finally {
    isLoading.value = false;
  }
}
function formatDiscordUsername(username: string) {
  return username.replace('-', '#').toLocaleLowerCase();
}
function openDiscordLink() {
  window.open('https://discord.gg/yXzzR8mdaf', '_blank')?.focus();
}
function openTwitchLink(username: string) {
  window.open(`https://www.twitch.tv/${username}`, '_blank')?.focus();
}

// computeds
const userStoreUserName = computed(() => {
  return userStore.isOldDiscordUser
    ? `${userStore.discordProfil?.username}#${userStore.discordProfil?.discriminator}`
    : `${userStore.discordProfil?.username}`;
});

// watchs
watch(storeHasCheckProfile, async (newState, _oldState) => {
  if (newState === true && usernameParams === String(undefined)) {
    await getMyProfile();
  }
});

// lifeCycle
onMounted(async () => {
  if (usernameParams !== String(undefined)) {
    isMyProfileMode.value = false;
    await getProfileByUsername(usernameParams);
    if (profileNotFound.value === false) {
      await getRacesByUsername(usernameParams);
      await getAchievementsByUsername(usernameParams);
    }
  } else {
    if (userStore.hasSetupProfile === true) {
      await getMyProfile();
      if (myProfileNotFound.value === false) {
        await getRacesByUsername(userStoreUserName.value); 
        await getAchievementsByUsername(userStoreUserName.value);
      }
    }
  }
});
</script>

<template>
  <div class="full-width full-height flex flex-center q-pb-xl">
    <div v-if="profile" class="full-width flex flex-center column">
      <div class="flex row no-wrap item-center q-gutter-x-md q-pb-xl">
        <q-avatar style="height: 100px; width: 100px">
          <q-img
            :src="profile.avatarUrl ?? '/images/triforce.png'"
          />
        </q-avatar>
        <div class="flex column q-pt-md">
          <div class="text-h4 text-dark-bis">{{ profile.name }}</div>
          <div class="flex row no-wrap items-center q-pt-sm q-gutter-x-sm">
            <q-icon
              v-if="profile.discordName"
              class="cursor-pointer"
              size="sm"
              name="discord"
              color="discord-light"
            >
              <q-tooltip>{{ profile.discordName }}</q-tooltip>
            </q-icon>
            <q-icon
              v-if="profile.twitch"
              class="cursor-pointer"
              size="sm"
              @click="openTwitchLink(profile.twitch)"
            >
              <q-img src="/images/twitch.png" />
              <q-tooltip>
                {{ profile.twitch }}
              </q-tooltip>
            </q-icon>
          </div>
        </div>
      </div>

      <q-intersection once transition="fade">
        <div class="flex-center row no-wrap q-gutter-x-md q-pb-md full-width">
          <q-btn
            v-for="info in infosType"
            @click="infosMode = info"
            :key="info"
            :label="info"
            :color="info === infosMode ? 'accent' : 'primary'"
            text-color="dark-bis"
          />
        </div>
      </q-intersection>

      <template v-if="profileAchievements && infosMode === infosType.at(0)">
        <q-card class="bg-leaderboard" style="max-width: 600px; width: 100%">
          <q-list
            v-if="isLoading === false && profileAchievements.length > 0"
            separator
          >
            <AchievementItem
              v-for="achievement in profileAchievements"
              :achievement="achievement"
              :key="achievement.id"
            />
          </q-list>
          <div v-else class="text-body1 text-center">No achievement.</div>
        </q-card>
      </template>

      <template v-if="profilesRaces && infosMode === infosType.at(1)">
        <RaceTable :races-props="profilesRaces" />
      </template>
    </div>
    <div v-show="isLoading" class="flex flex-center">
      <q-spinner v-show="isLoading" size="md" color="accent" />
    </div>

    <template v-if="myProfileNotFound">
      <q-card class="bg-leaderboard flex column flex-center">
        <h5 class="text-warning text-center q-px-lg q-my-lg">
          You are not registered as a runner. <br />
          Please register in the OoTR Ladder Discord using the !register command
          with LadderBot.
        </h5>
        <q-icon
          name="discord"
          @click="openDiscordLink"
          size="xl"
          color="discord-light"
          class="cursor-pointer q-mb-md"
        />
      </q-card>
    </template>

    <div v-show="profileNotFound === true" class="flex flex-center">
      <q-card class="bg-leaderboard">
        <h5 class="text-warning text-center q-px-lg q-my-lg">
          Profile not found
        </h5>
      </q-card>
    </div>

    <div
      v-show="!userStore.isConnected && isMyProfileMode === true"
      class="flex flex-center"
    >
      <q-card class="bg-leaderboard">
        <h5 class="text-warning text-center q-px-lg q-my-lg">
          You must be logged in to see your profile
        </h5>
      </q-card>
    </div>
  </div>
</template>
