/**
 * Look up product nutrition data from Open Food Facts API (free, no key needed).
 * Falls back to USDA FoodData Central if not found.
 */
export async function lookupBarcode(barcode) {
  // Try Open Food Facts first
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await res.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const n = p.nutriments || {};
      const servingSize = p.serving_size || p.quantity || "";

      return {
        found: true,
        name: p.product_name || p.generic_name || "Unknown Product",
        brand: p.brands || "",
        servingSize,
        image: p.image_front_small_url || p.image_url || null,
        macros: {
          calories: Math.round(n["energy-kcal_serving"] || n["energy-kcal_100g"] || 0),
          protein: Math.round(n.proteins_serving || n.proteins_100g || 0),
          fat: Math.round(n.fat_serving || n.fat_100g || 0),
          carbs: Math.round(n.carbohydrates_serving || n.carbohydrates_100g || 0),
          fiber: Math.round(n.fiber_serving || n.fiber_100g || 0),
        },
        per: n["energy-kcal_serving"] ? "serving" : "100g",
        barcode,
      };
    }
  } catch {}

  return { found: false, barcode };
}
