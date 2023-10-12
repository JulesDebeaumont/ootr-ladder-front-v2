<script setup lang="ts">
import { useRoute } from 'vue-router';

// props
const props = defineProps<{
  targetRoute: string;
  label: string;
  icon: string;
  mobileMode: boolean;
}>();

// consts
const route = useRoute();

// functions
function routeMatchtarget(targetRoute: string) {
  return route.name?.toString()?.includes(targetRoute) ?? false;
}
</script>

<template>
  <q-btn
    v-if="!props.mobileMode"
    :to="{ name: props.targetRoute }"
    :label="props.label"
    :icon="props.icon"
    :color="routeMatchtarget(props.targetRoute) ? 'accent' : 'primary'"
    :text-color="routeMatchtarget(props.targetRoute) ? 'dark-bis' : 'dark-bis'"
    no-caps
  />
  <q-item
    v-else
    clickable
    v-close-popup
    class="flex row items-center"
    :class="routeMatchtarget(props.targetRoute) ? 'bg-accent' : 'bg-primary'"
    :to="{ name: props.targetRoute }"
  >
    <span class="text-dark-bis">{{ props.label }}</span>
  </q-item>
</template>
