/**
 * Service de reconnaissance alimentaire via Claude Vision (Anthropic)
 * Analyse une photo de repas et retourne les macros estimées
 */

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Tu es un expert en nutrition. Quand on te montre une photo de repas, tu identifies les aliments visibles et tu estimes les macronutriments.

Réponds UNIQUEMENT en JSON valide, sans texte autour, avec ce format exact :
{
  "name": "Nom court du repas (ex: Poulet rôti avec légumes)",
  "confidence": "high" | "medium" | "low",
  "items": [
    { "name": "Aliment 1", "quantity": "150g", "calories": 250, "protein": 30, "carbs": 0, "fat": 8 },
    { "name": "Aliment 2", "quantity": "100g", "calories": 80, "protein": 2, "carbs": 18, "fat": 0 }
  ],
  "total": {
    "calories": 330,
    "protein": 32,
    "carbs": 18,
    "fat": 8
  },
  "note": "Estimation basée sur les portions visibles. Ajustez selon vos quantités réelles."
}

Règles :
- Estime les portions visuellement (assiette standard = ~25cm de diamètre comme référence)
- Si tu ne peux pas identifier un aliment, note-le comme "Aliment non identifié"
- Sois conservateur dans les estimations plutôt que d'exagérer
- confidence = "high" si le plat est clairement visible, "low" si flou ou ambigu`;

/**
 * Analyse une image de repas depuis son URI local
 * Retourne les données nutritionnelles estimées
 */
export async function analyzeFood(imageUri) {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'VOTRE_CLE_API_ICI') {
    throw new Error('CLE_MANQUANTE');
  }

  // Convertir l'image en base64
  const base64 = await uriToBase64(imageUri);
  const mediaType = getMediaType(imageUri);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Analyse ce repas et donne-moi les macronutriments en JSON.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Erreur API ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';

  try {
    // Extraire le JSON de la réponse (parfois entouré de ```json)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON introuvable');
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Réponse IA invalide');
  }
}

/**
 * Convertit un URI local en base64
 */
async function uriToBase64(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.split(',')[1];
      if (base64) resolve(base64);
      else reject(new Error('Conversion base64 échouée'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getMediaType(uri) {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
}
