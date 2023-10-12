<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
// components
import AnnoyingCucco from 'src/components/other/AnnoyingCucco.vue';

// consts
const cuccoCount = 20;
const timeAvailable = 60;
const cuccoPoint = 50;
const cojiroPoint = 100;
const secondPoint = 100;

// refs
const timer = ref(timeAvailable);
const cuccoCatch = ref({
  cucco: 0,
  cojiro: 0,
});

// functions
function addCuccoCatch(cojiro: boolean) {
  if (cojiro) {
    cuccoCatch.value.cojiro = 1;
  } else {
    cuccoCatch.value.cucco = cuccoCatch.value.cucco + 1;
  }
}
function timerGoesOn() {
  setTimeout(() => {
    if (timer.value > 0 && !isDone.value) {
      timer.value = timer.value - 1;
      timerGoesOn();
    }
  }, 1000);
}

// computeds
const isDone = computed(() => {
  return (
    (cuccoCatch.value.cojiro === 1 && cuccoCatch.value.cucco === cuccoCount - 1) || timer.value === 0
  );
});

// lifeCycle
onMounted(() => {
  timerGoesOn();
});
</script>

<template>
  <div class="flex flex-center column full-width absolute q-pr-md" style="height: calc(100vh - 100px)">
    <h6 v-if="!isDone" class="q-mt-xs q-pt-xs text-white">
      {{ timer }}
    </h6>

    <template v-if="!isDone">
      <div class="flex flex-center column full-width full-height absolute">
        <AnnoyingCucco
          v-for="index in cuccoCount"
          :key="index"
          :isCojiro="index + 1 === cuccoCount"
          @addCuccoCatch="addCuccoCatch"
        />
      </div>
    </template>

    <div v-else class="q-pb-xl q-mb-xl flex column items-center text-body1 text-white">
      <h4>
        {{
          cuccoCatch.cojiro * cojiroPoint +
          cuccoCatch.cucco * cuccoPoint +
          timer * secondPoint
        }}
        points
      </h4>
      <div>- Cuccos caught : {{ cuccoCatch.cucco }} x {{ cuccoPoint }}</div>
      <div>- Cojiro caught : {{ cuccoCatch.cojiro }} x {{ cojiroPoint }}</div>
      <div>- Time left : {{ timer }} x {{ secondPoint }}</div>
    </div>
  </div>
</template>
