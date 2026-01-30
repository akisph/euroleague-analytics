<template>
  <div class="page-light-surface">
    <SharedPageHeader
      title="Standings"
      subtitle="Current season standings and rankings"
    />

    <SharedLoadingState :loading="false" message="Loading standings...">
      <StandingsCurrentStandings
        title="Current Standings"
        subtitle="Regular Season"
      />
    </SharedLoadingState>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '~/components/shared/PageHeader.vue'
import LoadingState from '~/components/shared/LoadingState.vue'
import CurrentStandings from '~/components/standings/CurrentStandings.vue'
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
