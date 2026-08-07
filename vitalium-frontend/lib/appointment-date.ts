/** Início do dia local (00:00:00.000). */
export function startOfLocalDay(date = new Date()): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/** True se a data/hora da consulta é hoje ou no futuro (dia local). */
export function isOnOrAfterToday(scheduledAt: string | Date): boolean {
  return new Date(scheduledAt).getTime() >= startOfLocalDay().getTime()
}
