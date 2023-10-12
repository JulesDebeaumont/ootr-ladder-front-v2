<script setup lang="ts">
import { ref } from 'vue';
import { QTableColumn } from 'quasar';
import { ISession } from 'src/components/models';
// components
import RaceTable from 'src/components/session/RaceTable.vue';

// props
const props = defineProps<{
  sessions?: ISession[];
}>();

// consts
const columnsSessionTable: QTableColumn[] = [
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
  },
  {
    name: 'end',
    label: 'End',
    align: 'left',
    field: 'end',
    sortable: true,
    sort: (rowA, rowB) => new Date(rowB).valueOf() - new Date(rowA).valueOf(),
  },
  {
    name: 'nbRacers',
    label: 'Number of racer',
    align: 'left',
    field: 'nbRacers',
    sortable: true,
  },
];

// refs
const isLoading = ref(false);
</script>

<template>
  <div class="full-width">
    <div v-if="(props.sessions?.length ?? 0) > 0">
      <q-intersection once transition="fade">
        <q-table
          :rows="props.sessions"
          :columns="columnsSessionTable"
          :pagination="{ rowsPerPage: 1000 }"
          class="full-width"
          row-key="id"
          style="background-color: var(--q-leaderboard-bg)"
          hide-bottom
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-secondary text-uppercase">
              <q-th auto-width />
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              :class="props.expand ? 'bg-leaderboard-bis' : ''"
            >
              <q-td auto-width>
                <q-btn
                  v-if="props.row.nbRacers > 0"
                  size="sm"
                  color="accent"
                  round
                  dense
                  @click="props.expand = !props.expand"
                  :icon="props.expand ? 'expand_more' : 'chevron_right'"
                />
              </q-td>
              <q-td key="id" :props="props">{{ props.row.id }}</q-td>
              <q-td key="ladderType" :props="props">{{
                props.row.ladderType
              }}</q-td>
              <q-td key="start" :props="props">{{
                new Date(props.row.start).toLocaleString()
              }}</q-td>
              <q-td key="end" :props="props">{{
                new Date(props.row.end).toLocaleString()
              }}</q-td>
              <q-td key="nbRacers" :props="props">{{
                props.row.nbRacers
              }}</q-td>
            </q-tr>
            <q-tr v-if="props.expand" :props="props" class="bg-leaderboard-bis">
              <q-td colspan="100%" no-hover>
                <q-intersection once transition="fade">
                  <RaceTable :session="props.row" />
                </q-intersection>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-intersection>
    </div>

    <div class="flex flex-center">
      <q-card
        v-show="(props.sessions?.length ?? 0) === 0 && isLoading === false"
        class="bg-leaderboard"
      >
        <h5 class="text-warning text-center q-px-lg q-my-lg">
          No past sessions
        </h5>
      </q-card>
    </div>

    <div class="flex flex-center">
      <q-spinner v-show="isLoading" size="md" color="accent" />
    </div>
  </div>
</template>
