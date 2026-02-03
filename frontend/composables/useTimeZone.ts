const toTimeZoneDate = (value: Date | string | number, timeZone: string) => {
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return new Date(date.toLocaleString('en-US', { timeZone }))
}

export const useTimeZone = () => {
  const toAthensDate = (value: Date | string | number) =>
    toTimeZoneDate(value, 'Europe/Athens')

  const toAthensTimestamp = (value: Date | string | number) => {
    const date = toAthensDate(value)
    return date ? date.getTime() : Number.NaN
  }

  return {
    toAthensDate,
    toAthensTimestamp,
  }
}
