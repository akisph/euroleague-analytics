<template>
  <div class="dashboard-root">
    <SharedPageHeader
      title="Dashboard"
      subtitle="Current season overview"
    />

    <DashboardCurrentRoundSection />
    <div class="dashboard-spacer"></div>
    <DashboardLeadersSection />

    <SharedLoadingState :loading="false" message="Loading dashboard data...">
      <SharedEmptyState
        title="More widgets coming"
        message="We are rebuilding the dashboard experience."
        icon="mdi-view-dashboard-outline"
      />
    </SharedLoadingState>
  </div>
</template>

<style scoped>
.dashboard-root :deep(.empty-state) {
  margin-top: 1rem;
}

.dashboard-spacer {
  height: 1rem;
}
</style>
