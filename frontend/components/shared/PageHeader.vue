<template>
  <div class="page-header">
    <div class="header-top">
      <div class="header-left">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="header-actions">
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

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #1a2742;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.page-subtitle {
  margin: 0;
  color: #8a92a2;
  font-size: 1rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .page-header {
    margin-bottom: 1.5rem;
  }

  .header-top {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }
}
</style>
