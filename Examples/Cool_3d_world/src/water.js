/** True if a ground position sits in a creek water zone. */
export function isInWater(x, z, waterZones) {
  if (!waterZones?.length) return false;
  for (const w of waterZones) {
    if (Math.abs(x - w.x) <= w.halfW && Math.abs(z - w.z) <= w.halfD) {
      return true;
    }
  }
  return false;
}
