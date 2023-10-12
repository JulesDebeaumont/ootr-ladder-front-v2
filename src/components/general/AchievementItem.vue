<script setup lang="ts">
import { IAchievement } from 'src/components/models';
import { onMounted, ref } from 'vue';

// props
const props = defineProps<{
  achievement: IAchievement;
}>();

// refs
const setToZero = ref(true);

// functions
function getProgression(): number {
  return Math.round(
    (100 * (props.achievement.data?.prog ?? 0)) /
      (props.achievement.data?.max ?? 1) /
      100
  );
}

// lifeCycle
onMounted(() => {
  setTimeout(() => {
    setToZero.value = false;
  }, 200);
});
</script>

<template>
  <q-intersection once transition="fade">
    <q-item clickable>
      <q-item-section>
        <q-item-label
          :class="props.achievement.active ? 'text-dark-bis' : 'text-grey-6'"
          >{{ props.achievement?.code }}
        </q-item-label>
        <q-item-label
          caption
          :class="props.achievement.active ? 'text-grey-4' : 'text-grey-8'"
          class="text-weight-medium"
          >{{ props.achievement?.description }}</q-item-label
        >
        <div class="flex row no-wrap items-center">
          <q-linear-progress
            :value="setToZero ? 0 : getProgression()"
            class="q-mt-md"
            color="warning"
            rounded
          />
          <div class="text-warning q-mt-md q-pl-sm">
            {{ getProgression() * 100 }}%
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-intersection>
</template>
