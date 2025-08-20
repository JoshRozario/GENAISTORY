import { Event } from '../../../shared/types/index';

let events: Event[] = [];

export function addEvent(e: Event) {
  events.push(e);
  return e;
}

export function getStats() {
  const total = events.length;
  const uniqueUsers = new Set(events.map((x) => x.userId)).size;
  return { total, uniqueUsers };
}
