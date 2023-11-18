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
    <q-item clickable>
      <q-item-section>
        <q-item-label
          class="text-body2"
          :class="props.achievement.active ? 'text-dark-bis' : 'text-grey-6'"
          >{{ props.achievement?.achievementData?.name }}
        </q-item-label>
        <q-item-label
          caption
          :class="props.achievement.active ? 'text-grey-5' : 'text-grey-9'"
          class="text-weight-medium"
          >{{ props.achievement?.achievementData?.condition }}</q-item-label
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
</template>
