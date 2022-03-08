export const setDifference: <T>(a: Set<T>, b: Set<T>) => Set<T> = (a, b) => new Set(Array.from(a).filter(elem => !b.has(elem)));
