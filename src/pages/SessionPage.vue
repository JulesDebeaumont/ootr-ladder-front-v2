<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { notifyError } from 'src/utils/notify';
import { api } from 'src/boot/axios';
import { ISession } from 'src/components/models';
// components
import SessionTable from 'src/components/session/SessionTable.vue';

// refs
const sessions = ref<ISession[]>([]);

// functions
async function getSessions() {
  try {
    const responseSessions = await api.get('session');
    sessions.value = responseSessions.data;
    sessions.value = sessions.value.filter((sessionFilter) => {
      return sessionFilter.nbRacers > 0
    })
  } catch (error) {
    console.error(error);
    notifyError();
  }
}

// lifeCycle
onMounted(async () => {
  await getSessions();
});
</script>

<template>
  <SessionTable :sessions="sessions" />
</template>
