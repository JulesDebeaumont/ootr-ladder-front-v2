<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { notifyError } from 'src/utils/notify';
import { api } from 'src/boot/axios';
import { IWiki } from 'src/components/models';
import { markdownToHtml } from 'src/utils/markdown-to-html';
import { useQuasar, copyToClipboard, scroll } from 'quasar';
import { useRoute } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
// components
import DelayedCard from 'src/components/general/DelayedCard.vue';

// consts
const userStore = useUserStore();
const $q = useQuasar();
const route = useRoute();
const defaultWiki: IWiki = {
  title: 'New wiki',
  markdownBody: '## Wiki markdown content here',
  lastModifiedDate: new Date().toLocaleDateString(),
};
const routeSsrWiki = `${process.env.DOMAIN}/${process.env.URL_SEGMENT_FOR_WIKI}`;

// refs
const isLoading = ref(false);
const wikiTypes = ref<string[]>([]);
const wiki = ref<IWiki | null>(null);
const selectedWiki = ref<string | null>(null);
const editMode = ref(false);
const dialogDeleteWiki = ref(false);
const backupWikiForCancel = ref<IWiki | null>(null);

// functions
async function getWikiTypes() {
  try {
    const responseTypes = await api.get(routeSsrWiki);
    wikiTypes.value = responseTypes.data as string[];
  } catch (error) {
    console.error(error);
    notifyError();
  }
}
async function getWikiByType(wikiType: string) {
  isLoading.value = true;
  selectedWiki.value = wikiType;
  try {
    const responseLeaderboard = await api.get(
      `${routeSsrWiki}?type=${wikiType}`
    );
    wiki.value = responseLeaderboard.data as IWiki;
    setTimeout(() => {
      setupAnchor();
    }, 100);
  } catch (error) {
    console.error(error);
    notifyError();
  } finally {
    isLoading.value = false;
  }
}
async function saveWiki() {
  try {
    if (selectedWiki.value === null) {
      await api.post(`${routeSsrWiki}?type=${wiki.value?.title}`, wiki.value);
      if (wiki.value) {
        wikiTypes.value.push(wiki.value.title);
        selectedWiki.value = wiki.value.title;
      }
    } else {
      await api.patch(
        `${process.env.DOMAIN}/${process.env.URL_SEGMENT_FOR_WIKI}?type=${selectedWiki.value}`,
        wiki.value
      );
      if (wiki.value) {
        wiki.value.lastModifiedDate = new Date().toLocaleDateString();
        if (wiki.value.title !== selectedWiki.value) {
          const typeWikiIndexToRename = wikiTypes.value.indexOf(
            selectedWiki.value as string
          );
          wikiTypes.value[typeWikiIndexToRename] = wiki.value.title;
          selectedWiki.value = wiki.value.title;
        }
      }
    }
    toggleEditMode();
    $q.notify({
      type: 'positive',
      message: 'Wiki saved',
    });
    setTimeout(() => {
      setupAnchor();
    }, 100);
  } catch (error) {
    console.error(error);
    notifyError();
  }
}
async function deleteWiki(wikiTypeArg: string) {
  try {
    await api.delete(`${routeSsrWiki}?type=${wikiTypeArg}`);
    wiki.value = null;
    wikiTypes.value = wikiTypes.value.filter((wikiTypeFilter) => {
      return wikiTypeFilter !== wikiTypeArg;
    });
    if (wikiTypes.value.length > 0) {
      selectedWiki.value = wikiTypes.value.at(0) as string;
      await getWikiByType(selectedWiki.value);
    }
    $q.notify({
      type: 'positive',
      message: 'Wiki removed',
    });
  } catch (error) {
    console.error(error);
    notifyError();
  }
}
function addWikiType() {
  wiki.value = JSON.parse(JSON.stringify(defaultWiki));
  selectedWiki.value = null;
  toggleEditMode();
}
function setupAnchor() {
  const anchors = document.querySelectorAll('.sharp-anchor');
  anchors.forEach((element) => {
    element.addEventListener('click', (event) => {
      const link =
        (process.env.DOMAIN as string) +
        route.fullPath.split('?').at(0) +
        '?type=' +
        selectedWiki.value +
        '#' +
        (element.getAttribute('id') ?? '');
      copyToClipboard(link).then(() => {
        $q.notify({
          message: 'Anchor has been copied to clipboard',
        });
      });
    });
  });
}
function scrollToAnchor() {
  const { getScrollTarget, setVerticalScrollPosition } = scroll;
  const element = document.getElementById(
    route.fullPath.split('#').at(1) ?? 'none'
  );
  if (element) {
    setVerticalScrollPosition(
      getScrollTarget(element),
      element.offsetTop - 200,
      500
    );
    const parent = element.parentElement;
    if (parent) {
      hightlightSection(parent);
    }
  }
}
function hightlightSection(element: HTMLElement) {
  element.className += ' highlight-anchor';
  setTimeout(() => {
    element.className = element.className.replaceAll(' highlight-anchor', '');
  }, 6000);
  const nextElement = element.nextElementSibling as HTMLElement;
  if (
    nextElement !== null &&
    !['H1', 'H2', 'H3', 'HR'].includes(nextElement.tagName)
  ) {
    hightlightSection(nextElement);
  }
}
function toggleEditMode() {
  editMode.value = !editMode.value;
  if (wiki.value) {
    backupWikiForCancel.value = JSON.parse(JSON.stringify(wiki.value)) as IWiki;
  }
}
function cancelEditMode() {
  if (wiki.value === null) {
    return;
  }
  if (selectedWiki.value === null) {
    selectedWiki.value = wikiTypes.value.at(0) ?? null;
    if (selectedWiki.value !== null) {
      getWikiByType(selectedWiki.value);
    }
  }
  if (backupWikiForCancel.value !== null) {
    wiki.value = backupWikiForCancel.value;
    backupWikiForCancel.value = null;
  }
  toggleEditMode();
}

// lifeCycle
onMounted(async () => {
  await getWikiTypes();
  if (wikiTypes.value.length > 0) {
    const queryTypeParam = route.query['type'] as string;
    if (
      queryTypeParam !== '' &&
      wikiTypes.value.indexOf(queryTypeParam) !== -1
    ) {
      await getWikiByType(queryTypeParam);
    } else {
      await getWikiByType(wikiTypes.value.at(0) as string);
    }
    setTimeout(() => {
      if (route.fullPath.includes('#')) {
        scrollToAnchor();
      }
    }, 100);
  }
});
</script>

<template>
  <div class="full-width full-height">
    <div v-if="wikiTypes.length > 0" class="flex column flex-center">
      <div class="flex-center row no-wrap q-gutter-x-md q-pb-md full-width">
        <q-btn
          v-for="wikiType in wikiTypes"
          :key="wikiType"
          @click="getWikiByType(wikiType)"
          :label="wikiType"
          :color="selectedWiki === wikiType ? 'accent' : 'primary'"
          text-color="dark-bis"
        />
        <q-btn
          v-if="userStore.isAdmin"
          @click="addWikiType"
          icon="add"
          color="primary"
        >
          <q-tooltip>Add</q-tooltip>
        </q-btn>
      </div>

      <div v-show="isLoading" class="flex flex-center">
        <q-spinner v-show="isLoading" size="md" color="accent" />
      </div>
      <q-card
        v-if="wiki !== null"
        class="flex flex-center column markdown-display q-pa-lg"
        style="
          background-color: var(--q-leaderboard-bg);
          max-width: 650px;
          width: 100%;
        "
      >
        <q-dialog v-model="dialogDeleteWiki">
          <DelayedCard
            @button-action="deleteWiki(selectedWiki as string)"
            message="Do you really want to delete this wiki ?"
            :delay-in-second="3"
            label-button-action="Delete"
          />
        </q-dialog>

        <span class="q-pb-xs flex row no-wrap items-center">
          <i class="text-grey-7" style="font-size: 14px"
            >LAST UPDATE: {{ wiki.lastModifiedDate }}
          </i>
          <template v-if="userStore.isAdmin">
            <q-icon
              v-if="!editMode"
              name="edit"
              @click="toggleEditMode"
              color="accent"
              class="q-ml-sm cursor-pointer"
              size="sm"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-icon>
            <q-icon
              v-if="!editMode"
              name="delete"
              @click="dialogDeleteWiki = true"
              color="negative"
              class="cursor-pointer"
              size="sm"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-icon>

            <span v-else class="flex row no-wrap items-center">
              <q-icon
                name="close"
                @click="cancelEditMode"
                color="accent"
                class="q-ml-sm cursor-pointer"
                size="sm"
              >
                <q-tooltip>Cancel</q-tooltip>
              </q-icon>
              <q-icon
                name="check"
                @click="saveWiki"
                color="accent"
                class="cursor-pointer"
                size="sm"
              >
                <q-tooltip>Save</q-tooltip>
              </q-icon>
            </span>
          </template>
        </span>
        <template v-if="editMode">
          <q-intersection once transition="fade" class="full-width">
            <q-input
              v-model="wiki.title"
              filled
              label="Title"
              class="q-mb-md"
            />
            <q-input
              v-model="wiki.markdownBody"
              label="Content"
              type="textarea"
              autogrow
              filled
            />
          </q-intersection>
        </template>

        <div
          v-show="!editMode"
          v-html="markdownToHtml(wiki.markdownBody)"
        ></div>
        <hr class="hidden" />
      </q-card>
    </div>

    <div class="flex flex-center">
      <q-card
        v-show="wikiTypes.length === 0 && isLoading === false"
        class="bg-leaderboard"
      >
        <h5 class="text-warning text-center q-px-lg q-my-lg">
          No wiki available
        </h5>
      </q-card>
    </div>
  </div>
</template>

<style>
.markdown-display * {
  font-size: 17px;
  color: var(--q-dark-bis);
}
.markdown-display h1 {
  display: block;
  font-size: 2em;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
  color: var(--q-dark-bis);
}
.markdown-display h2 {
  display: block;
  font-size: 1.8em;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
  color: var(--q-dark-bis);
}
.markdown-display h3 {
  display: block;
  font-size: 1.17em;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
  color: var(--q-dark-bis);
}
.markdown-display hr {
  margin-top: 50px;
  margin-bottom: 30px;
  border: 0.1px #999 solid !important;
}
.sharp-anchor {
  margin-left: 10px;
  font-size: 20px;
  opacity: 0;
  color: var(--q-warning);
}
.title-anchor {
  transition: color 1s;
}
.title-anchor:hover .sharp-anchor {
  opacity: 1;
}

@keyframes highlight-anchor {
  0% {
    color: var(--q-warning);
  }
  70% {
    color: var(--q-warning);
  }
  100% {
    color: inherit;
  }
}

.highlight-anchor {
  animation: highlight-anchor 6s;
}
.highlight-anchor * {
  animation: highlight-anchor 6s;
}
</style>
