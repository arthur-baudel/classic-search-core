// packages/core/interfaces/product.js
// ===================== CLASSIC AI — Format Produit Standard =====================
// Ce fichier définit le format universel qu'un produit doit avoir
// quel que soit le CMS source (PrestaShop, WooCommerce, Shopify, Magento).
// Chaque connecteur est responsable de transformer ses données vers ce format.
// ===============================================================================

/**
 * Format produit standard Classic AI
 * Tous les connecteurs doivent produire des objets conformes à cette structure.
 *
 * @typedef {Object} StandardProduct
 * @property {number}  id          - Identifiant unique du produit (entier)
 * @property {string}  nom         - Nom complet du produit
 * @property {string}  description - Description courte, HTML nettoyé, max 300 chars
 * @property {number}  prix_num    - Prix en nombre flottant (ex: 299.90)
 * @property {string}  prix        - Prix formaté pour affichage (ex: "299.90 €")
 * @property {number}  category_id - ID de la catégorie principale
 * @property {boolean} active      - Produit visible et en vente
 * @property {string}  image_url   - URL complète de l'image principale
 * @property {string}  url         - URL complète de la fiche produit
 * @property {string}  reference   - Référence/SKU du produit
 */

/**
 * Valide qu'un objet est conforme au format Standard Product
 * @param {Object} product
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateProduct(product) {
  const errors = [];

  if (!product || typeof product !== "object") {
    return { valid: false, errors: ["L'objet produit est invalide"] };
  }

  if (typeof product.id !== "number" || product.id <= 0) {
    errors.push("id doit être un entier positif");
  }
  if (!product.nom || typeof product.nom !== "string" || product.nom.trim().length === 0) {
    errors.push("nom est requis");
  }
  if (typeof product.prix_num !== "number" || product.prix_num < 0) {
    errors.push("prix_num doit être un nombre positif");
  }
  if (typeof product.active !== "boolean") {
    errors.push("active doit être un booléen");
  }
  if (!product.url || typeof product.url !== "string") {
    errors.push("url est requise");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Crée un produit standard avec des valeurs par défaut sécurisées
 * @param {Partial<StandardProduct>} data
 * @returns {StandardProduct}
 */
function createStandardProduct(data = {}) {
  const prix = parseFloat(data.prix_num || data.price || 0);

  return {
    id: parseInt(data.id) || 0,
    nom: String(data.nom || data.name || "").trim().slice(0, 500),
    description: String(data.description || "").replace(/<[^>]+>/g, "").trim().slice(0, 300),
    prix_num: prix,
    prix: prix.toFixed(2) + " €",
    category_id: parseInt(data.category_id) || null,
    active: Boolean(data.active !== false && data.active !== 0 && data.active !== "0"),
    image_url: String(data.image_url || ""),
    url: String(data.url || ""),
    reference: String(data.reference || ""),
  };
}

module.exports = { validateProduct, createStandardProduct };
