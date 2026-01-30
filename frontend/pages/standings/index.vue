<template>
  <div class="page-light-surface">
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
  </div>
</template>

<script setup lang="ts">
// Component handles all standings logic
</script>

<style scoped>
.standings-page-wrapper {
  /* keep page-level visuals light; specific components control their own surfaces */
}

/* Minimal overrides: ensure headings match theme */
.standings-page-wrapper :deep(.v-data-table th) {
  background-color: #F05323 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
}
</style>
