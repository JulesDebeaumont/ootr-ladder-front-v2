<script setup lang="ts">
import { ref, onMounted } from 'vue';

// emits
const emits = defineEmits<{
  (e: 'buttonAction'): void;
}>();

// props
const props = defineProps<{
  message: string;
  delayInSecond: number;
  labelButtonAction: string;
}>();

// refs
const timer = ref(props.delayInSecond);

// functions
function timerGoesOn() {
  if (timer.value > 0) {
    setTimeout(() => {
      timer.value = timer.value - 1;
      timerGoesOn();
    }, 1000);
  }
}

// lifeCycle
onMounted(() => {
  timerGoesOn();
});
</script>

<template>
  <q-card class="bg-primary">
    <q-card-section class="row items-center">
      <div class="text-h6">
        {{ props.message }}
      </div>
    </q-card-section>

    <q-card-actions align="around">
      <q-btn flat label="Cancel" color="accent" v-close-popup />
      <div class="flex row no-wrap items-center">
        <q-btn
          :disable="timer > 0"
          flat
          :label="props.labelButtonAction"
          :color="timer > 0 ? 'red-3' : 'red'"
          v-close-popup
          @click="emits('buttonAction')"
        />
        <div v-if="timer > 0" class="flex row no-wrap items-center">
          <q-spinner-hourglass color="red-3" size="1.8em" />
          <span class="text-red-3">{{ timer }}</span>
        </div>
      </div>
    </q-card-actions>
  </q-card>
</template>
