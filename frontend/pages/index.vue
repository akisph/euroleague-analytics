<template>
  <PageHeader
    title="Dashboard"
    subtitle="Current season overview"
  />

  <LoadingState :loading="false" message="Loading dashboard data...">
    <!-- Current Round Games -->
    <div class="dashboard-section">
      <CurrentRoundGames />
    </div>

    <!-- Standings -->
    <div class="dashboard-section">
      <CurrentStandings
        title="Standings"
        subtitle="Regular Season"
      />
    </div>
  </LoadingState>
</template>

<script setup lang="ts">
// Dashboard uses CurrentRoundGames and CurrentStandings components
// Each component handles its own data loading independently
</script>

<style scoped>
.dashboard-section {
  margin-bottom: 2rem;
}

.dashboard-section:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .dashboard-section {
    margin-bottom: 1.5rem;
  }
}
</style>
