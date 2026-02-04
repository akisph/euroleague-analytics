<template>
  <div class="dashboard-root">
    <SharedPageHeader
      title="Dashboard"
      subtitle="Current season overview"
    />

    <SharedLoadingState :loading="false" message="Loading dashboard data...">
      <div class="dashboard-section">
        <GamesCurrentRoundGames />
      </div>

      <div class="dashboard-section">
        <StandingsPage
          title="Standings"
          subtitle="Regular Season"
        />
      </div>
    </SharedLoadingState>
  </div>
</template>

<style scoped>
.dashboard-section {
  margin-bottom: 2rem;
}

.dashboard-section:last-child {
  margin-bottom: 0;
}
</style>
