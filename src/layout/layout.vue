<template>
  <div id="layout">
    <SideMenu class="layout-sidemenu" />
    <div id="page-header-target" />
    <div class="layout-main-content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
#layout {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 3.75rem 1fr;
}

.layout-main-content {
  position: relative;
  grid-area: 2 / 2 / 3 / 3;
  width: 100%;
  height: calc(100vh - $header-height);
  max-height: calc(100vh - $header-height);
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem 0.75rem 0.25rem 0.75rem;
}

.layout-sidemenu {
  grid-area: 1 / 1 / 3 / 2;
}

#page-header-target {
  min-height: $header-height;
  grid-area: 1 / 2 / 2 / 3;
}
</style>
