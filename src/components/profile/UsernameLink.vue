<script setup lang="ts">
import { computed } from 'vue';

// props
const props = defineProps<{
  discordUsername: string;
  username: string;
}>();

// computeds
const discordUsernameNoSharp = computed(() => {
  return props.discordUsername.replace('#', '-');
});
</script>

<template>
  <div class="flex">
    <div class="cursor-pointer">
      {{ props.username }}
      <q-popup-proxy>
        <q-list class="bg-secondary">
          <q-item
            clickable
            v-close-popup
            :to="{
              name: 'profile-by-username',
              params: { username: discordUsernameNoSharp },
            }"
          >
            <q-item-section class="flex row no-wrap items-center">
              <span
                ><q-icon size="1.5rem" class="q-mr-sm">
                  <q-img src="images/claim_check.png" /> </q-icon
                >Check profile
              </span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-popup-proxy>
    </div>
    <div></div>
  </div>
</template>
