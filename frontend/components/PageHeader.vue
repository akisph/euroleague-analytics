<template>
  <div class="page-header mb-6">
    <div class="d-flex align-center justify-space-between flex-wrap">
      <div>
        <v-breadcrumbs
          v-if="breadcrumbs && breadcrumbs.length > 0"
          :items="breadcrumbs"
          class="pa-0 mb-1"
          density="compact"
        />
        <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
        <p v-if="subtitle" class="text-body-1 text-medium-emphasis mt-1">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots.actions" class="mt-2 mt-md-0">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  title: string
  to?: string
  disabled?: boolean
}

interface Props {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
}

defineProps<Props>()
</script>
