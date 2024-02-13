<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useProjectStore } from '@/store/project';
import { usePipelineStore } from '@/store/pipeline';
import { storeToRefs } from 'pinia';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  mainTitle: {
    type: Boolean,
    default: false,
  },
  linkTo: {
    type: Object,
    default: () => {},
  },
});

const route = useRoute();
const { menuIcon, color } = useTheme();
const { project } = storeToRefs(useProjectStore());
const { pipelineName } = storeToRefs(usePipelineStore());

const projectDisplayName = computed(() =>
  route.fullPath.includes('projects/') ? project.value?.name : ''
);
const pipelineDisplayName = computed(() =>
  route.fullPath.includes('pipelines/') || route.fullPath.includes('apps/')
    ? pipelineName.value
    : ''
);

const fontColor = computed(() => ({
  color: props.mainTitle ? color.value : '#364968',
}));
</script>

<template>
  <Teleport to="#page-header-target">
    <div class="page-header">
      <div class="d-flex">
        <template v-if="menuIcon && mainTitle">
          <i-menu-icons-apps
            v-if="menuIcon === 'apps'"
            height="24px"
            width="26px"
          />
          <i-menu-icons-pipelines
            v-else-if="menuIcon === 'pipelines'"
            height="24px"
            width="26px"
          />
          <i-menu-icons-recipes
            v-else-if="menuIcon === 'recipes'"
            height="24px"
            width="26px"
          />
          <i-menu-icons-data
            v-else-if="menuIcon === 'data'"
            height="24px"
            width="26px"
          />
          <i-menu-icons-team
            v-else-if="menuIcon === 'team'"
            height="24px"
            width="26px"
          />
        </template>
        <router-link v-else-if="linkTo?.name" :to="linkTo">
          <i-mdi-arrow-left color="#364968" height="18px" width="20px" />
        </router-link>
      </div>
      <div class="d-flex flex-column hide-long-titles">
        <div>
          <span v-if="projectDisplayName" class="breadcrumb-project">
            {{ projectDisplayName
            }}{{ pipelineDisplayName ? ` / ${pipelineDisplayName}` : '' }}
          </span>
        </div>
        <div class="d-flex align-items-center">
          <p :style="fontColor">
            {{ mainTitle ? title?.toUpperCase() : title }}
          </p>
        </div>
        <BaseBadge
          v-dev-feature
          v-if="project?.parameters?.tag && project.parameters.tag !== 'latest'"
          :label="project.parameters.tag"
        />
      </div>
      <div class="ms-auto pe-2 row-nowrap">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.page-header {
  position: relative;
  @include reset_margin;
  @include goFlex(row, no-wrap, flex-start, center);
  width: 100%;
  height: $header-height;
  padding: 0 10px;
  border-bottom: 1px solid rgba(black, 0.1);
  background-color: #ffffff;

  .breadcrumb-project {
    margin-top: -8px;
    font-size: 11px;
  }

  svg,
  i {
    margin-left: 8px;
    margin-right: 14px;
  }

  p {
    @include sassRem(normal, 1rem, $raleway, 100%);
    margin-bottom: 0;
    color: $colorVerteego;
  }

  i {
    color: $colorVerteego;

    &:before {
      width: 19px;
    }
  }

  svg {
    display: block;
  }
}

.hide-long-titles {
  overflow: hidden;
  white-space: nowrap;
}

.row-nowrap {
  @include goFlex(row, no-wrap, flex-start, center);
  gap: 10px;
}
</style>
