/**
 * Service Open Food Facts
 * API gratuite, 3M+ produits, très bonne couverture FR
 * Doc : https://world.openfoodfacts.org/data
 */

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

/**
 * Recherche un produit par code-barres (EAN-13, QR, etc.)
 * Retourne un objet normalisé ou null si non trouvé
 */
export async function fetchProductByBarcode(barcode) {
  try {
    const response = await fetch(`${BASE_URL}/product/${barcode}?fields=product_name,brands,nutriments,serving_size,serving_quantity,image_front_small_url,quantity`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (data.status === 0 || !data.product) return null;

    return normalizeProduct(data.product, barcode);
  } catch (error) {
    console.error('[OpenFoodFacts] Erreur barcode:', error.message);
    throw error;
  }
}

/**
 * Recherche textuelle (nom du produit)
 */
export async function searchProducts(query, page = 1) {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: 1,
      action: 'process',
      json: 1,
      page_size: 20,
      page,
      fields: 'product_name,brands,nutriments,serving_size,serving_quantity,image_front_small_url,quantity,code',
      lc: 'fr',
      cc: 'fr',
    });

    const response = await fetch(`https://fr.openfoodfacts.org/cgi/search.pl?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return (data.products || []).map(p => normalizeProduct(p, p.code)).filter(Boolean);
  } catch (error) {
    console.error('[OpenFoodFacts] Erreur recherche:', error.message);
    throw error;
  }
}

/**
 * Normalise un produit brut Open Food Facts
 * en un objet propre pour l'app
 */
function normalizeProduct(raw, barcode) {
  const n = raw.nutriments || {};

  // Valeurs pour 100g
  const per100 = {
    calories: Math.round(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? (n['energy_100g'] ?? 0) / 4.184),
    protein:  Math.round((n['proteins_100g'] ?? 0) * 10) / 10,
    carbs:    Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
    fat:      Math.round((n['fat_100g'] ?? 0) * 10) / 10,
    fiber:    Math.round((n['fiber_100g'] ?? 0) * 10) / 10,
    sugar:    Math.round((n['sugars_100g'] ?? 0) * 10) / 10,
  };

  // Taille de portion par défaut (serving ou 100g)
  const servingQty = parseFloat(raw.serving_quantity) || 100;
  const servingLabel = raw.serving_size || `${servingQty}g`;

  // Valeurs pour la portion
  const perServing = scaleNutrition(per100, servingQty / 100);

  const name = raw.product_name || 'Produit inconnu';
  const brand = raw.brands?.split(',')[0]?.trim() || '';

  if (per100.calories === 0 && per100.protein === 0) return null; // Données manquantes

  return {
    barcode: barcode || '',
    name,
    brand,
    displayName: brand ? `${name} — ${brand}` : name,
    image: raw.image_front_small_url || null,
    quantity: raw.quantity || '',
    per100,
    serving: {
      qty: servingQty,
      label: servingLabel,
      ...perServing,
    },
  };
}

/**
 * Multiplie les valeurs nutritionnelles par un facteur
 */
export function scaleNutrition(per100, factor) {
  return {
    calories: Math.round(per100.calories * factor),
    protein:  Math.round(per100.protein  * factor * 10) / 10,
    carbs:    Math.round(per100.carbs    * factor * 10) / 10,
    fat:      Math.round(per100.fat      * factor * 10) / 10,
    fiber:    Math.round(per100.fiber    * factor * 10) / 10,
    sugar:    Math.round(per100.sugar    * factor * 10) / 10,
  };
}
