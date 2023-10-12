<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { notifyError } from 'src/utils/notify';
import { api } from 'src/boot/axios';
import { ILadderType, IRunner } from 'src/components/models';
import { QTableColumn } from 'quasar';
// components
import UsernameLink from 'src/components/profile/UsernameLink.vue';

// consts
const columnsLeaderboardTable: QTableColumn[] = [
  {
    name: 'index',
    label: '#',
    align: 'left',
    field: 'index',
    sortable: true,
  },
  {
    name: 'user_name',
    label: 'Player name',
    align: 'left',
    field: 'userName',
    sortable: true,
  },
  {
    name: 'races_played',
    label: 'Races played',
    align: 'left',
    field: 'nbRaces',
    sortable: true,
  },
  {
    name: 'current_score',
    label: 'Current Score',
    align: 'left',
    field: 'currentElo',
    sortable: true,
  },
];

// refs
const isLoading = ref(false);
const ladderTypes = ref<ILadderType[]>([]);
const runners = ref<IRunner[] | null>(null);
const selectedLeaderBoard = ref<ILadderType | null>(null);

// functions
async function getLeaderBoardTypes() {
  isLoading.value = true;
  try {
    const responseTypes = await api.get('data/ladderTypes');
    ladderTypes.value = responseTypes.data;
    ladderTypes.value = ladderTypes.value.reverse();
  } catch (error) {
    console.error(error);
    notifyError();
  } finally {
    isLoading.value = false;
  }
}
async function getRunnersByLeaderboard(leaderboardType: ILadderType) {
  selectedLeaderBoard.value = leaderboardType;
  try {
    const responseRunners = await api.get(
      `leaderboard?ladderType=${leaderboardType.label}`
    );
    runners.value = responseRunners.data as IRunner[];
    runners.value = runners.value.map((runner, indexMap) => {
      runner.index = indexMap + 1;
      return runner;
    });
  } catch (error) {
    console.error(error);
    notifyError();
  }
}
function getBadgeByIndex(index: number) {
  return ['quiver50', 'quiver40', 'quiver30'][index];
}

// lifeCycle
onMounted(async () => {
  await getLeaderBoardTypes();
  if (ladderTypes.value.length > 0) {
    await getRunnersByLeaderboard(ladderTypes.value.at(0) as ILadderType);
  }
});
</script>

<template>
  <div class="full-width full-height">
    <div v-if="ladderTypes.length > 0" class="flex column">
      <q-intersection once transition="fade">
        <div class="flex-center row no-wrap q-gutter-x-md q-pb-md full-width">
          <q-btn
            v-for="ladderType in ladderTypes"
            @click="getRunnersByLeaderboard(ladderType)"
            :key="ladderType.id"
            :label="ladderType.label"
            :color="
              selectedLeaderBoard?.id === ladderType.id ? 'accent' : 'primary'
            "
            text-color="dark-bis"
          />
        </div>
      </q-intersection>

      <q-intersection once transition="fade">
        <q-table
          :rows="runners ?? []"
          :columns="columnsLeaderboardTable"
          :pagination="{ rowsPerPage: 1000 }"
          class="full-width"
          row-key="userId"
          style="background-color: var(--q-leaderboard-bg)"
          table-header-class="bg-secondary text-uppercase"
          hide-bottom
        >
          <template v-slot:body-cell-index="props">
            <q-td :props="props">
              <span v-if="props.row.index > 3" class="q-pl-sm">{{
                props.row.index
              }}</span>
              <q-icon
                v-else
                :name="`img:images/${getBadgeByIndex(props.row.index - 1)}.png`"
                size="sm"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-user_name="props">
            <q-td :props="props">
              <UsernameLink
                :discordUsername="props.row.userDiscordName"
                :username="props.row.userName"
              />
            </q-td>
          </template>
        </q-table>
      </q-intersection>

      <div v-show="isLoading" class="flex flex-center">
        <q-spinner v-show="isLoading" size="md" color="accent" />
      </div>
    </div>

    <div class="flex flex-center">
      <q-card
        v-show="ladderTypes.length === 0 && isLoading === false"
        class="bg-leaderboard"
      >
        <h5 class="text-warning text-center q-px-lg q-my-lg">
          No leaderboard available
        </h5>
      </q-card>
    </div>
  </div>
</template>
