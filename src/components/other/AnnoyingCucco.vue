<script setup lang="ts">
import { onMounted, ref } from 'vue';

// props
const props = defineProps<{
  isCojiro: boolean;
}>();

// emits
const emits = defineEmits<{
  (e: 'addCuccoCatch', cojiro: boolean): void;
}>();

// const
const minimumRunAway = 100;
const cuccoSizeInPx = 70;
const maxWidth = (window.innerWidth - cuccoSizeInPx) / 2 - minimumRunAway;
const maxHeight = (window.innerHeight - cuccoSizeInPx) / 2 - minimumRunAway;
const direction = [1, -1];

// refs
const position = ref({ x: 0, y: 0 });
const isClicked = ref(false);
const goingLeft = ref(randomBoolean());
const isRunningAway = ref(false);

// functions
function runAway() {
  let nextPositionX = generateNewPosition(maxWidth);
  let tryCount = 0;
  while (
    nextPositionX < position.value.x + minimumRunAway &&
    nextPositionX > position.value.x - minimumRunAway
  ) {
    tryCount += 1;
    nextPositionX = generateNewPosition(maxWidth);
    if (tryCount > 5) {
      break;
    }
  }
  let nextPositionY = generateNewPosition(maxHeight);
  while (
    nextPositionY < position.value.y + minimumRunAway &&
    nextPositionY > position.value.y - minimumRunAway
  ) {
    tryCount += 1;
    nextPositionY = generateNewPosition(maxHeight);
    if (tryCount > 5) {
      break;
    }
  }
  setTimeout(() => {
    isRunningAway.value = false;
    position.value = { x: nextPositionX, y: nextPositionY };
    setTimeout(() => {
      isRunningAway.value = false;
    }, 600);
  }, 110);
}
function generateNewPosition(maxValue: number) {
  return (
    (Math.floor(Math.random() * (maxValue - minimumRunAway + 1)) +
      minimumRunAway) *
    direction[Math.floor(Math.random() * direction.length)]
  );
}
function getCuccoImage() {
  if (props.isCojiro) {
    return 'cojiro.png';
  }
  return 'cucco.png';
}
function randomBoolean() {
  return Math.random() < 0.5;
}
function getCuccoClass() {
  if (isRunningAway.value === true) {
    return ' ';
  }
  if (goingLeft.value === true) {
    const leftClasses = [' annoying-cucco-left-1', ' annoying-cucco-left-2'];
    return leftClasses.at(Math.floor(Math.random() * leftClasses.length));
  } else {
    const rightClasses = [' annoying-cucco-right-1', ' annoying-cucco-right-2'];
    return rightClasses.at(Math.floor(Math.random() * rightClasses.length));
  }
}
function addPoint() {
  if (props.isCojiro) {
    emits('addCuccoCatch', true);
  } else {
    emits('addCuccoCatch', false);
  }
  isClicked.value = true;
}

// lifeCycle
onMounted(() => {
  runAway();
});
</script>

<template>
  <div
    v-if="!isClicked"
    @mouseover="runAway"
    @click="addPoint"
    class="annoying-cucco-container absolute"
    :style="{
      transform:
        'translateX(' + position.x + 'px) translateY(' + position.y + 'px)',
      width: cuccoSizeInPx + 'px',
      height: cuccoSizeInPx + 'px',
    }"
  >
    <img
      class="annoying-cucco"
      :class="getCuccoClass()"
      :src="`images/${getCuccoImage()}`"
      :style="{
        width: cuccoSizeInPx + 'px',
        height: cuccoSizeInPx + 'px',
      }"
    />
  </div>
</template>

<style scoped>
@keyframes cucco-walking-left-1 {
  0% {
    transform: translateX(0px) translateY(0px);
  }
  4% {
    transform: translateX(-3px) translateY(-5px);
  }
  8% {
    transform: translateX(-6px) translateY(0px);
  }
  12% {
    transform: translateX(-6px) translateY(0px);
  }
  16% {
    transform: translateX(-9px) translateY(-5px);
  }
  20% {
    transform: translateX(-12px) translateY(0px);
  }
  29% {
    transform: translateX(-12px) translateY(0px);
  }
  33% {
    transform: translateX(-15px) translateY(-5px);
  }
  37% {
    transform: translateX(-18px) translateY(0px);
  }
  41% {
    transform: translateX(-18px) translateY(0px);
  }
  45% {
    transform: scaleX(-1) translateX(18px) translateY(0px);
  }
  50% {
    transform: scaleX(-1) translateX(18px) translateY(0px);
  }
  54% {
    transform: scaleX(-1) translateX(15px) translateY(-5px);
  }
  58% {
    transform: scaleX(-1) translateX(12px) translateY(0px);
  }
  62% {
    transform: scaleX(-1) translateX(12px) translateY(0px);
  }
  66% {
    transform: scaleX(-1) translateX(9px) translateY(-5px);
  }
  70% {
    transform: scaleX(-1) translateX(6px) translateY(0px);
  }
  79% {
    transform: scaleX(-1) translateX(6px) translateY(0px);
  }
  83% {
    transform: scaleX(-1) translateX(3px) translateY(-5px);
  }
  87% {
    transform: scaleX(-1) translateX(0px) translateY(0px);
  }
  91% {
    transform: scaleX(-1) translateX(0px) translateY(0px);
  }
  95% {
    transform: scaleX(-1) translateX(0px) translateY(0px);
  }
  100% {
    transform: translateX(0px) translateY(0px);
  }
}
@keyframes cucco-walking-left-2 {
  0% {
    transform: translateX(0px) translateY(0px);
  }
  5% {
    transform: translateX(-3px) translateY(-5px);
  }
  10% {
    transform: translateX(-6px) translateY(0px);
  }
  20% {
    transform: translateX(-6px) translateY(0px);
  }
  25% {
    transform: translateX(-9px) translateY(-5px);
  }
  30% {
    transform: translateX(-12px) translateY(0px);
  }
  60% {
    transform: translateX(-12px) translateY(0px);
  }
  63% {
    transform: scaleX(-1) translateX(12px) translateY(0px);
  }
  65% {
    transform: scaleX(-1) translateX(12px) translateY(0px);
  }
  70% {
    transform: scaleX(-1) translateX(9px) translateY(-5px);
  }
  75% {
    transform: scaleX(-1) translateX(6px) translateY(0px);
  }
  80% {
    transform: scaleX(-1) translateX(6px) translateY(0px);
  }
  85% {
    transform: scaleX(-1) translateX(3px) translateY(-5px);
  }
  90% {
    transform: scaleX(-1) translateX(0px) translateY(0px);
  }
  95% {
    transform: scaleX(1) translateX(0px) translateY(0px);
  }
  100% {
    transform: translateX(0px) translateY(0px);
  }
}
@keyframes cucco-walking-right-1 {
  0% {
    transform: scaleX(-1) translateX(0px) translateY(0px);
  }
  4% {
    transform: scaleX(-1) translateX(-3px) translateY(-5px);
  }
  8% {
    transform: scaleX(-1) translateX(-6px) translateY(0px);
  }
  12% {
    transform: scaleX(-1) translateX(-6px) translateY(0px);
  }
  16% {
    transform: scaleX(-1) translateX(-9px) translateY(-5px);
  }
  20% {
    transform: scaleX(-1) translateX(-12px) translateY(0px);
  }
  29% {
    transform: scaleX(-1) translateX(-12px) translateY(0px);
  }
  33% {
    transform: scaleX(-1) translateX(-15px) translateY(-5px);
  }
  37% {
    transform: scaleX(-1) translateX(-18px) translateY(0px);
  }
  41% {
    transform: scaleX(-1) translateX(-18px) translateY(0px);
  }
  45% {
    transform: scaleX(1) translateX(18px) translateY(0px);
  }
  50% {
    transform: scaleX(1) translateX(18px) translateY(0px);
  }
  54% {
    transform: scaleX(1) translateX(15px) translateY(-5px);
  }
  58% {
    transform: scaleX(1) translateX(12px) translateY(0px);
  }
  62% {
    transform: scaleX(1) translateX(12px) translateY(0px);
  }
  66% {
    transform: scaleX(1) translateX(9px) translateY(-5px);
  }
  70% {
    transform: scaleX(1) translateX(6px) translateY(0px);
  }
  79% {
    transform: scaleX(1) translateX(6px) translateY(0px);
  }
  83% {
    transform: scaleX(1) translateX(3px) translateY(-5px);
  }
  87% {
    transform: scaleX(1) translateX(0px) translateY(0px);
  }
  91% {
    transform: scaleX(1) translateX(0px) translateY(0px);
  }
  95% {
    transform: scaleX(1) translateX(0px) translateY(0px);
  }
  100% {
    transform: scaleX(-1) translateX(0px) translateY(0px);
  }
}
@keyframes cucco-walking-right-2 {
  0% {
    transform: scaleX(-1) translateX(0px) translateY(0px);
  }
  5% {
    transform: scaleX(-1) translateX(-3px) translateY(-5px);
  }
  10% {
    transform: scaleX(-1) translateX(-6px) translateY(0px);
  }
  20% {
    transform: scaleX(-1) translateX(-6px) translateY(0px);
  }
  25% {
    transform: scaleX(-1) translateX(-9px) translateY(-5px);
  }
  30% {
    transform: scaleX(-1) translateX(-12px) translateY(0px);
  }
  60% {
    transform: scaleX(-1) translateX(-12px) translateY(0px);
  }
  63% {
    transform: scaleX(1) translateX(12px) translateY(0px);
  }
  65% {
    transform: scaleX(1) translateX(12px) translateY(0px);
  }
  70% {
    transform: scaleX(1) translateX(9px) translateY(-5px);
  }
  75% {
    transform: scaleX(1) translateX(6px) translateY(0px);
  }
  80% {
    transform: scaleX(1) translateX(6px) translateY(0px);
  }
  85% {
    transform: scaleX(1) translateX(3px) translateY(-5px);
  }
  90% {
    transform: scaleX(1) translateX(0px) translateY(0px);
  }
  95% {
    transform: scaleX(1) translateX(0px) translateY(0px);
  }
  100% {
    transform: scaleX(-1) translateX(0px) translateY(0px);
  }
}

.annoying-cucco-container {
  transition: all 0.6s;
}
.annoying-cucco {
  transition: all 0.2s;
}
.annoying-cucco-left-1 {
  animation: cucco-walking-left-1 4s infinite;
}
.annoying-cucco-left-2 {
  animation: cucco-walking-left-2 2s infinite;
}
.annoying-cucco-right-1 {
  animation: cucco-walking-right-1 3.5s infinite;
}
.annoying-cucco-right-2 {
  animation: cucco-walking-right-2 2.5s infinite;
}
</style>
