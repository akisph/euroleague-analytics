<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-card class="h-100">
        <v-card-title>
          <v-icon icon="mdi-information" class="mr-2" />
          Game Information
        </v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item v-if="game?.gameDate">
              <template #prepend>
                <v-icon icon="mdi-calendar" class="mr-3" />
              </template>
              <v-list-item-title>Date & Time</v-list-item-title>
              <v-list-item-subtitle>{{ formatDateTime(game.gameDate) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="game?.arena">
              <template #prepend>
                <v-icon icon="mdi-stadium" class="mr-3" />
              </template>
              <v-list-item-title>Arena</v-list-item-title>
              <v-list-item-subtitle>{{ game.arena }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="game?.attendance">
              <template #prepend>
                <v-icon icon="mdi-account-group" class="mr-3" />
              </template>
              <v-list-item-title>Attendance</v-list-item-title>
              <v-list-item-subtitle>{{ game.attendance.toLocaleString() }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="game?.status">
              <template #prepend>
                <v-icon icon="mdi-flag" class="mr-3" />
              </template>
              <v-list-item-title>Status</v-list-item-title>
              <v-list-item-subtitle>{{ game.status }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card class="h-100">
        <v-card-title>
          <v-icon icon="mdi-trophy" class="mr-2" />
          Competition Details
        </v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-calendar-text" class="mr-3" />
              </template>
              <v-list-item-title>Season</v-list-item-title>
              <v-list-item-subtitle>{{ game?.seasonCode }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="game?.phaseTypeName">
              <template #prepend>
                <v-icon icon="mdi-flag-checkered" class="mr-3" />
              </template>
              <v-list-item-title>Phase</v-list-item-title>
              <v-list-item-subtitle>{{ game.phaseTypeName }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-numeric" class="mr-3" />
              </template>
              <v-list-item-title>Round</v-list-item-title>
              <v-list-item-subtitle>Round {{ game?.roundNumber }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="game?.groupName">
              <template #prepend>
                <v-icon icon="mdi-group" class="mr-3" />
              </template>
              <v-list-item-title>Group</v-list-item-title>
              <v-list-item-subtitle>{{ game.groupName }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const props = defineProps<{ game?: any }>()

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped></style>
