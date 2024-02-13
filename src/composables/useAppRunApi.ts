import { ref } from 'vue';
import { useApi } from './useApi';
import {
  DELETE_APP_RUN,
  GET_APP_RUN,
  GET_LAST_APP_RUN,
  GET_APP_RUN_STEPS,
  GET_APP_RUNS,
  PATCH_APP_RUN,
  POST_APP_RUN,
} from '@/composables/routes';
import { useToasts } from '@/composables/useToasts';
import { storeToRefs } from 'pinia';
import { useAppStore, usePipelineStore, useProjectStore, useResourceStore } from '@/store';
import type { AppRunDto, AppRunStepDto } from '@/types/dto';

export function useAppRunApi() {
  const { del, get, getList, patch, post, loading, isRequestSuccessful, requestError } = useApi();
  const { successToast, errorToast } = useToasts();

  const { projectId } = storeToRefs(useProjectStore());
  const { pipelineId } = storeToRefs(usePipelineStore());
  const { appId: applicationId } = storeToRefs(useAppStore());
  const { name: resourceName } = storeToRefs(useResourceStore());
  const appRun = ref<AppRunDto>();
  const appRunSteps = ref<AppRunStepDto[]>([]);
  const lastOptimizationAppRun = ref<AppRunDto>();

  const updateAppRun = (appRunId: string, appRunName: string) => {
    const payload = { name: appRunName };
    return patch(
      PATCH_APP_RUN(projectId.value, pipelineId.value, appRunId),
      payload,
      'App Run updated',
      'Error while updating the App Run'
    );
  };

  const removeAppRun = (appRunId: string) =>
    del(
      DELETE_APP_RUN(projectId.value, pipelineId.value, appRunId),
      'App Run deleted!',
      'Error while deleting the App Run'
    );

  const createAppRunForecast = (payload: any) =>
    post(
      POST_APP_RUN(projectId.value, pipelineId.value),
      payload,
      'Forecast created !',
      'Error while creating the Forecast.'
    );

  const removeAppRuns = async (idsToDelete: string[]) => {
    const allData = await Promise.all(
      idsToDelete.map((appRunId) => del(DELETE_APP_RUN(projectId.value, pipelineId.value, appRunId)))
    );
    const appRunErrorsNumber = allData.reduce((acc, data) => (data?.id ? acc : acc + 1), 0);
    if (appRunErrorsNumber) {
      errorToast(`Error while deleting ${idsToDelete.length - appRunErrorsNumber} App Runs. ${requestError.value}`);
    } else {
      successToast(`All ${idsToDelete?.length} App Runs deleted`);
    }
  };

  const getAppRun = async (appId: string, appRunId: string) => {
    const data = await get<AppRunDto>(GET_APP_RUN(projectId.value, appId, appRunId));
    if (data) {
      resourceName.value = data.name;
      appRun.value = { ...data };
    } else {
      appRun.value = undefined;
    }
    return appRun.value;
  };

  const getLastAppRun = async (appId: string) => {
    const data = await get<AppRunDto>(GET_LAST_APP_RUN(projectId.value, appId));
    if (data) {
      resourceName.value = data.name;
      appRun.value = { ...data };
    } else {
      appRun.value = undefined;
    }
    return appRun.value;
  };

  const fetchAppRunSteps = async (appRunId: string) => {
    const data = await getList<AppRunStepDto>(GET_APP_RUN_STEPS(projectId.value, applicationId.value, appRunId));
    appRunSteps.value = data;
    return data;
  };

  async function getLastOptimization() {
    const data = await get<AppRunDto>(GET_APP_RUNS(projectId.value, applicationId.value), { last_optimization: true });
    lastOptimizationAppRun.value = data;
    return data;
  }

  return {
    createAppRunForecast,
    updateAppRun,
    removeAppRun,
    removeAppRuns,
    getAppRun,
    getLastAppRun,
    getLastOptimization,
    fetchAppRunSteps,
    lastOptimizationAppRun,
    appRun,
    appRunSteps,
    loading,
    isRequestSuccessful,
  };
}
