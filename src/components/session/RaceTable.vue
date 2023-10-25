<script setup lang="ts">
import { ISession, IRace } from 'src/components/models';
import { onMounted, ref } from 'vue';
import { notifyError } from 'src/utils/notify';
import { api } from 'src/boot/axios';
import { QTableColumn } from 'quasar';
import { getRaceTime } from 'src/utils/misc';
import { useUserStore } from 'src/stores/user-store';
// components
import UsernameLink from 'src/components/profile/UsernameLink.vue';

// props
const propsComponent = defineProps<{
  session?: ISession;
  racesProps?: IRace[];
}>();

// consts
const userStore = useUserStore();
const resultsOptions: IRace['racer1Result'][] = [
  'forfeit',
  'finish',
  'timeout',
];
const routeSsrMatchEdit = `${process.env.DOMAIN}/${process.env.URL_SEGMENT_FOR_MATCH_EDITION}`;
const columnsRaceTable: QTableColumn[] = [
  {
    name: 'winner',
    label: 'Winner',
    align: 'left',
    field: (row) => getWinnerFromRace(row),
    sortable: true,
    sort: (_a, _b, rowA: IRace, rowB: IRace) => {
      const rowAWinner =
        rowA.winner === rowA.racer1DiscordName ? rowA.racer1 : rowA.racer2;
      const rowBWinner =
        rowB.winner === rowB.racer1DiscordName ? rowB.racer1 : rowB.racer2;
      return rowBWinner.localeCompare(rowAWinner);
    },
  },
  {
    name: 'winner_time',
    label: 'Winner Time',
    align: 'left',
    field: (row) => getWinnerTimeFromRace(row),
    sortable: true,
    sort: (_a, _b, rowA: IRace, rowB: IRace) => {
      const rowAWinnerTime =
        rowA.winner === rowA.racer1DiscordName
          ? rowA.racer1EndTime
          : rowA.racer2EndTime;
      const rowBWinnerTime =
        rowB.winner === rowB.racer1DiscordName
          ? rowB.racer1EndTime
          : rowB.racer2EndTime;
      return (
        new Date(rowBWinnerTime).valueOf() - new Date(rowAWinnerTime).valueOf()
      );
    },
  },
  {
    name: 'looser_time',
    label: 'Looser Time',
    align: 'left',
    field: (row) => getLooserTimeFromRace(row),
    sortable: true,
    sort: (_a, _b, rowA: IRace, rowB: IRace) => {
      const rowALooserTime =
        rowA.winner === rowA.racer1DiscordName
          ? rowA.racer2EndTime
          : rowA.racer1EndTime;
      const rowBLooserTime =
        rowB.winner === rowB.racer1DiscordName
          ? rowB.racer2EndTime
          : rowB.racer1EndTime;
      return (
        new Date(rowBLooserTime).valueOf() - new Date(rowALooserTime).valueOf()
      );
    },
  },
  {
    name: 'looser',
    label: 'Looser',
    align: 'left',
    field: (row) => getLooserFromRace(row),
    sortable: true,
    sort: (_a, _b, rowA: IRace, rowB: IRace) => {
      const rowALooser =
        rowA.winner === rowA.racer1DiscordName ? rowA.racer2 : rowA.racer1;
      const rowBLooser =
        rowB.winner === rowB.racer1DiscordName ? rowB.racer2 : rowB.racer1;
      return rowBLooser.localeCompare(rowALooser);
    },
  },
];

// refs
const isLoading = ref(false);
const races = ref<IRace[] | null>(null);
const dialogEditRace = ref(false);
const dialogEditRaceSetup = ref<IRace | null>(null);

// functions
async function getRacesBySession(sessionArg: ISession) {
  isLoading.value = true;
  try {
    const responsesRaces = await api.get(`session/${sessionArg.id}/races`);
    races.value = responsesRaces.data;
  } catch (error) {
    console.error(error);
    notifyError();
  } finally {
    isLoading.value = false;
  }
}
async function saveRace(raceArg: IRace) {
  try {
    const responseRace = await api.post(
      `${routeSsrMatchEdit}?id=${raceArg.id}`,
      {
        racer1EndTime: raceArg.racer1EndTime,
        racer1Result: raceArg.racer1Result,
        racer2EndTime: raceArg.racer2EndTime,
        racer2Result: raceArg.racer2Result
      }
    );
    let raceRef = races.value?.find((raceFind) => {
      return raceFind.id === raceArg.id;
    });
    if (raceRef) {
      raceRef = responseRace.data;
    }
  } catch (error) {
    console.error(error);
    notifyError();
  } finally {
    dialogEditRaceSetup.value = null;
    dialogEditRace.value = false;
  }
}
function getSessionStartTime(race: IRace) {
  if (propsComponent.session) {
    return propsComponent.session.start;
  }
  return race.sessionStartTime ?? '';
}
function getWinnerFromRace(race: IRace) {
  return race.winner === race.racer1DiscordName ? race.racer1 : race.racer2;
}
function getWinnerDiscordFromRace(race: IRace) {
  return race.winner === race.racer1DiscordName
    ? race.racer1DiscordName
    : race.racer2DiscordName;
}
function getLooserFromRace(race: IRace) {
  return race.winner === race.racer1DiscordName ? race.racer2 : race.racer1;
}
function getLooserDiscordFromRace(race: IRace) {
  return race.winner === race.racer1DiscordName
    ? race.racer2DiscordName
    : race.racer1DiscordName;
}
function getWinnerTimeFromRace(race: IRace) {
  const sessionStart = getSessionStartTime(race);
  return race.winner === race.racer1DiscordName
    ? `${getRaceTime(race.racer1EndTime, sessionStart)} (${race.racer1Result})`
    : `${getRaceTime(race.racer2EndTime, sessionStart)} (${race.racer2Result})`;
}
function getLooserTimeFromRace(race: IRace) {
  const sessionStart = getSessionStartTime(race);
  return race.winner === race.racer1DiscordName
    ? `${getRaceTime(race.racer2EndTime, sessionStart)} (${race.racer2Result})`
    : `${getRaceTime(race.racer1EndTime, sessionStart)} (${race.racer1Result})`;
}
function setupDialogForEditRace(race: IRace) {
  dialogEditRaceSetup.value = race;
  dialogEditRace.value = true;
}
function raceCanBeEdited(race: IRace) {
  const sessionStartTimestamp = new Date(getSessionStartTime(race)).valueOf();
  const todayTimeStamp = new Date().valueOf();
  const dayDelta = Math.abs(Math.round((todayTimeStamp - sessionStartTimestamp) / (1000  * 60 * 60 * 24)))
  return dayDelta <= 7
}

// lifeCycle
onMounted(async () => {
  if (propsComponent.session) {
    await getRacesBySession(propsComponent.session);
  }
  if (propsComponent.racesProps) {
    races.value = propsComponent.racesProps;
  }
});
</script>

<template>
  <div class="flex flex-center full-width column">
    <q-dialog v-model="dialogEditRace">
      <q-card
        v-if="dialogEditRaceSetup !== null"
        class="bg-primary"
        style="max-width: 350px; width: 100%"
      >
        <div v-if="raceCanBeEdited(dialogEditRaceSetup)" class="flex column q-gutter-y-md q-pa-lg">
          <div class="flex row no-wrap flex-center q-gutter-x-md">
            <div class="text-h5 text-center q-py-md">Edit a race</div>
            <q-img
              src="/images/running_man.png"
              style="height: 80px; width: 24px"
            >
              <q-tooltip>Yah!</q-tooltip>
            </q-img>
          </div>

          <div class="flex column q-gutter-y-xs">
            <div class="text-body1 text-weight-bold">Racer 1</div>
            <q-input
              filled
              v-model="dialogEditRaceSetup.racer1EndTime"
              label="Endtime"
            />
            <q-select
              filled
              v-model="dialogEditRaceSetup.racer1Result"
              :options="resultsOptions"
              label="Result"
              options-selected-class="text-accent"
            />
          </div>

          <div class="flex column q-gutter-y-xs">
            <div class="text-body1 text-weight-bold">Racer 2</div>
            <q-input
              filled
              v-model="dialogEditRaceSetup.racer2EndTime"
              label="Endtime"
            />
            <q-select
              filled
              v-model="dialogEditRaceSetup.racer2Result"
              :options="resultsOptions"
              label="Result"
              options-selected-class="text-accent"
            />
          </div>

          <div class="flex flex-center row no-wrap q-gutter-x-sm">
            <q-btn v-close-popup label="Cancel" color="info" />
            <q-btn
              @click="saveRace(dialogEditRaceSetup)"
              label="Save"
              color="accent"
            />
          </div>
        </div>

        <div v-else class="flex column q-pa-lg text-center">
          Races can only be edited at most seven days after the end of the session.
        </div>
      </q-card>
    </q-dialog>

    <div v-if="races !== null" class="q-gutter-y-sm full-width">
      <q-table
        :rows="races"
        :columns="columnsRaceTable"
        :pagination="{ rowsPerPage: 1000 }"
        class="full-width"
        row-key="id"
        no-data-label="No race found"
        style="background-color: var(--q-leaderboard-bg)"
        hide-pagination
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
          <q-tr :props="props">
            <q-td key="winner" :props="props" class="text-positive">
              <UsernameLink
                :discordUsername="getWinnerDiscordFromRace(props.row)"
                :username="getWinnerFromRace(props.row)"
              />
            </q-td>
            <q-td key="winner_time" :props="props" class="text-positive">{{
              getWinnerTimeFromRace(props.row)
            }}</q-td>
            <q-td key="looser_time" :props="props" class="text-negative">{{
              getLooserTimeFromRace(props.row)
            }}</q-td>
            <q-td key="looser" :props="props" class="text-negative">
              <UsernameLink
                :discordUsername="getLooserDiscordFromRace(props.row)"
                :username="getLooserFromRace(props.row)"
              />
            </q-td>
            <q-td auto-width>
              <q-icon
                v-if="userStore.isAdmin"
                name="edit"
                class="cursor-pointer q-mr-xs"
                color="accent"
                size="sm"
                @click="setupDialogForEditRace(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-icon>
              <q-icon
                name="info"
                color="accent"
                size="sm"
                class="cursor-pointer"
              >
                <q-popup-proxy>
                  <q-list class="bg-secondary">
                    <a :href="props.row.seedUrl">
                      <q-item clickable v-close-popup>
                        <q-item-section class="flex row no-wrap justify-start">
                          <span
                            ><q-icon size="1.5rem" class="q-mr-sm">
                              <q-img src="/images/seed.png" /> </q-icon
                            >Download seed
                          </span>
                        </q-item-section>
                      </q-item>
                    </a>

                    <q-separator />

                    <a :href="props.row.spoilerUrl">
                      <q-item clickable v-close-popup>
                        <q-item-section class="flex row no-wrap items-center">
                          <span
                            ><q-icon size="1.5rem" class="q-mr-sm">
                              <q-img src="/images/prescription.png" /> </q-icon
                            >Download spoiler log
                          </span>
                        </q-item-section>
                      </q-item>
                    </a>
                  </q-list>
                </q-popup-proxy>
              </q-icon>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div v-show="isLoading" class="flex flex-center">
      <q-spinner v-show="isLoading" size="md" color="accent" />
    </div>
  </div>
</template>
