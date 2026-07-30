export const tables = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  capacity: i % 3 === 0 ? 6 : 4,
}));
