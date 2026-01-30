<template>
  <PageHeader
    title="Standings"
    subtitle="Current season standings and rankings"
  />

  <LoadingState :loading="false" message="Loading standings...">
    <CurrentStandings
      title="Current Standings"
      subtitle="Regular Season"
    />
  </LoadingState>
</template>

<script setup lang="ts">
// Component handles all standings logic
</script>

<style scoped>
:deep(.standings-section) {
  background-color: #1a2742;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.v-card) {
  background-color: #1a2742 !important;
  color: #ffffff;
  border: none !important;
}

:deep(.v-data-table) {
  background-color: #1a2742 !important;
  color: #ffffff !important;
}

:deep(.v-data-table th) {
  background-color: #F05323 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
}

:deep(.v-data-table td) {
  background-color: #1a2742 !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: #2a3f5f !important;
}
</style>
