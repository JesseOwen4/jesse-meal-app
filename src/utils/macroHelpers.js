/**
 * Find meals from MEAL_IDEAS that are similar in macros to a target meal.
 * Returns sorted array (best match first).
 */
export function findSimilarMeals(targetCals, targetProtein, mealIdeas, limit = 5) {
  const allMeals = [];

  for (const cat of mealIdeas) {
    for (const idea of cat.items) {
      // Parse macros string like "680 cal · 52g P"
      const calMatch = idea.macros.match(/([\d,~]+)\s*cal/);
      const protMatch = idea.macros.match(/(\d+)g\s*P/);
      if (!calMatch) continue;

      const cals = parseInt(calMatch[1].replace(/[,~]/g, "")) || 0;
      const prot = protMatch ? parseInt(protMatch[1]) : 0;

      const calDiff = Math.abs(cals - targetCals);
      const protDiff = Math.abs(prot - targetProtein);
      // Score: lower is better. Weight calories more than protein.
      const score = calDiff + protDiff * 2;

      allMeals.push({ ...idea, parsedCals: cals, parsedProt: prot, score, category: cat.cat });
    }
  }

  return allMeals
    .filter(m => Math.abs(m.parsedCals - targetCals) <= 300) // within 300 cal
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}
