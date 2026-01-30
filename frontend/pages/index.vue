<template>
  <PageHeader
    title="Dashboard"
    subtitle="Current season overview"
  />

    <LoadingState :loading="false" message="Loading dashboard data...">
      <!-- Current Round Games -->
      <v-row class="mb-6">
        <v-col cols="12">
          <CurrentRoundGames />
        </v-col>
      </v-row>

      <!-- Standings -->
      <v-row>
        <v-col cols="12">
          <CurrentStandings
            title="Standings"
            subtitle="Regular Season"
          />
        </v-col>
      </v-row>
    </LoadingState>
</template>

<script setup lang="ts">
// Dashboard uses CurrentRoundGames and CurrentStandings components
// Each component handles its own data loading independently
</script>
