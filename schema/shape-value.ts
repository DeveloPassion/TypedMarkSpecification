/** Project parsed YAML into JSON-shape checks without rewriting the input.
 * Native tagged values match no JSON type, but an unconstrained schema still
 * accepts them. Identity is retained so aliases and distinct values stay distinct.
 */
export function shapeValue(value: unknown): unknown {
  const seen = new WeakMap<object, unknown>();
  const pending: Array<{ source: object; target: object }> = [];
  const project = (item: unknown): unknown => {
    if (item === null || typeof item !== "object") return item;
    if (seen.has(item)) return seen.get(item);
    const array = Array.isArray(item);
    const prototype = Object.getPrototypeOf(item);
    if (!array && prototype !== null && prototype !== Object.prototype) {
      const marker = Symbol("non-JSON YAML value");
      seen.set(item, marker);
      return marker;
    }
    const target = array ? new Array(item.length) : Object.create(prototype);
    seen.set(item, target);
    pending.push({ source: item, target });
    return target;
  };
  const result = project(value);
  // Iteration handles deep opaque metadata without a JavaScript call-stack cap.
  while (pending.length) {
    const { source, target } = pending.pop()!;
    for (const [key, child] of Object.entries(source)) {
      // Assignment could treat an authored __proto__ key as a prototype write.
      Object.defineProperty(target, key, {
        value: project(child), enumerable: true, writable: true, configurable: true,
      });
    }
  }
  return result;
}
