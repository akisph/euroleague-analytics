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
