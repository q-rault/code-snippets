<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useAppRunApi } from '@/composables/api';
import router from '@/router';
import { useAppStore } from '@/store';
import { Permission } from '@/types/Permission';
import { paramToString } from '@/utils/typeConversion';

const shouldRefresh = ref(false);

const loadingAppRun = ref(true);
const showModal = ref(false);
const showHistory = ref(false);
const route = useRoute();
const { app } = storeToRefs(useAppStore());

const pageTitle = computed(() => appRun.value?.name ?? '');

const {
  getAppRun,
  getLastAppRun,
  appRun,
  getLastOptimization,
  lastOptimizationAppRun,
} = useAppRunApi();

const hasRecipe = computed(() => !!app.value?.parameters?.recipe);

const showForecast = computed(() => {
  return !!app.value?.parameters?.forecast?.enabled;
});

const showOptimization = computed(() => {
  return !!app.value?.parameters?.optimization?.enabled;
});

async function fetchAndRerouteToLastAppRun() {
  await getLastAppRun(paramToString(route.params.app_id));
  if (appRun.value?.id) {
    router.push({
      params: {
        ...route.params,
        app_run_id: appRun.value.id,
      },
    });
  }
}

async function getAppRunByIdOrLast() {
  loadingAppRun.value = true;
  if (paramToString(route.params.app_run_id)) {
    await getAppRun(
      paramToString(route.params.app_id),
      paramToString(route.params.app_run_id)
    );
  } else {
    await fetchAndRerouteToLastAppRun();
  }
  loadingAppRun.value = false;
}

function handleRefresh() {
  fetchAndRerouteToLastAppRun();
  shouldRefresh.value = true;
}

watch(
  () => route.params.app_run_id,
  () => {
    if (
      paramToString(route.params.app_run_id) &&
      appRun.value?.id !== paramToString(route.params.app_run_id)
    ) {
      getAppRunByIdOrLast();
    }
  }
);

getLastOptimization();
getAppRunByIdOrLast();
</script>

<template>
  <Loader v-if="loadingAppRun"></Loader>
  <PageHeader :title="pageTitle" :link-to="{ name: 'apps' }">
    <RecipeConfig
      v-if="app?.parameters?.recipe"
      v-permission="Permission.ED_business_case"
      :recipe-id="app.parameters.recipe"
    />
    <IconButton
      v-if="app"
      v-permission="Permission.ED_business_case"
      type="settings"
      @click="showModal = !showModal"
    />
    <b-button
      v-if="app"
      class="btn-label history-toggle"
      @click="showHistory = !showHistory"
    >
      <i-mdi-history style="font-size: 18px" />
    </b-button>
    <ForecastModal
      v-if="showForecast"
      v-permission="Permission.launch_business_case_forecast"
      @refresh-table="handleRefresh"
    />
    <RecipeModal v-if="hasRecipe" @refresh-table="handleRefresh" />
    <OptimizationModal
      v-if="showOptimization"
      v-permission="Permission.launch_business_case_optimisation"
      step="app_run"
      :latest-optimization="lastOptimizationAppRun"
      @refresh-table="handleRefresh"
    />
  </PageHeader>
  <template v-if="paramToString(route.params.app_run_id)">
    <AppRunDisplayedResultsTabs v-if="hasRecipe" />
    <AppRunLegacyTabs v-else-if="app" />
  </template>
  <div v-else>
    <div
      class="d-flex justify-content-center align-items-center"
      style="height: 100vh"
    >
      <div class="text-center">
        <span>
          No run yet:
          <b-button variant="primary" @click="showModal = !showModal">
            Launch a run
          </b-button>
          or
          <b-link :to="{ name: 'apps' }">Go back to apps</b-link>
        </span>
      </div>
    </div>
  </div>
  <AppRunsMenu v-if="showHistory" v-model:should-refresh="shouldRefresh" />
  <AppModal v-model="showModal" v-if="app" :is-edit="true" :app="app" />
</template>
