<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { notifyError } from 'src/utils/notify';
import { api } from 'src/boot/axios';
import { ISession } from 'src/components/models';
import { QTableColumn } from 'quasar';
import { useUserStore } from 'src/stores/user-store';

// consts
const userStore = useUserStore();
const routeSsrAlert = `${process.env.DOMAIN}/${process.env.URL_SEGMENT_FOR_ALERT}`;
const columnsScheduleTable: QTableColumn[] = [
  {
    name: 'id',
    label: '#',
    align: 'left',
    field: 'id',
    sortable: true,
  },
  {
    name: 'ladderType',
    label: 'Ladder type',
    align: 'left',
    field: 'ladderType',
    sortable: true,
  },
  {
    name: 'start',
    label: 'Start',
    align: 'left',
    field: 'start',
    sortable: true,
    sort: (rowA, rowB) => new Date(rowB).valueOf() - new Date(rowA).valueOf(),
  }
];

// refs
const isLoading = ref(false);
const schedules = ref<ISession[]>([]);

// functions
async function getSchedules() {
  isLoading.value = true;
  try {
    const responseSessions = await api.get('session/schedule');
    schedules.value = responseSessions.data;
  } catch (error) {
    console.error(error);
    notifyError();
  } finally {
    isLoading.value = false;
  }
}
async function toggleSessionAlert(sessionId: number) {
  if (!userStore.isConnected) {
    return;
  }
  try {
    await api.post(
      `${routeSsrAlert}?id=${sessionId}&active=${!userHasAlert(sessionId)}`
    );
    if (userHasAlert(sessionId)) {
      if (userStore.user) {
        userStore.user.sessionAlerts = userStore.user.sessionAlerts.filter(
          (sessionIdAlert) => {
            return sessionIdAlert === sessionId;
          }
        );
      }
    } else {
      userStore.user?.sessionAlerts.push(sessionId);
    }
  } catch (error) {
    console.error(error);
    notifyError();
  }
}
function userHasAlert(sessionId: number) {
  return userStore.user?.sessionAlerts.includes(sessionId);
}

// lifeCycle
onMounted(async () => {
  await getSchedules();
});
</script>

<template>
  <div class="full-width">
    <div v-if="(schedules?.length ?? 0) > 0">
      <q-intersection once transition="fade">
        <q-table
          :rows="schedules"
          :columns="columnsScheduleTable"
          :pagination="{ rowsPerPage: 1000 }"
          class="full-width"
          row-key="id"
          style="background-color: var(--q-leaderboard-bg)"
          hide-bottom
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-secondary text-uppercase">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
              <q-th auto-width />
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              :class="props.expand ? 'bg-leaderboard-bis' : ''"
            >
              <q-td key="id" :props="props">{{ props.row.id }}</q-td>
              <q-td key="ladderType" :props="props">{{
                props.row.ladderType
              }}</q-td>
              <q-td key="start" :props="props">{{
                new Date(props.row.start).toLocaleString()
              }}</q-td>
              <q-td auto-width>
                <q-btn
                  v-if="props.row.nbRacers > 0"
                  size="sm"
                  :color="userHasAlert(props.row.id) ? 'warning' : 'accent'"
                  round
                  dense
                  @click="toggleSessionAlert(props.row.id)"
                  icon="alert"
                >
                  <q-tooltip v-if="!userStore.isConnected || !userStore.hasRegister"
                    >You must be logged in and register to toggle session alerts.</q-tooltip
                  >
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-intersection>
    </div>

    <div class="flex flex-center">
      <q-card
        v-show="(schedules?.length ?? 0) === 0 && isLoading === false"
        class="bg-leaderboard"
      >
        <h5 class="text-warning text-center q-px-lg q-my-lg">
          No session planned
        </h5>
      </q-card>
    </div>

    <div class="flex flex-center">
      <q-spinner v-show="isLoading" size="md" color="accent" />
    </div>
  </div>
</template>
