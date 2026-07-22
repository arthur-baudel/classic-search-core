# 🔌 Guide des connecteurs — Classic AI

Un connecteur est le pont entre votre CMS et Classic AI. Il récupère vos produits, les transforme au format standard, et les indexe dans Qdrant.

---

## Connecteurs disponibles

| CMS | Statut | Fichier |
|---|---|---|
| PrestaShop | ✅ Disponible | `packages/connectors/prestashop/onboard.js` |
| WooCommerce | ✅ Disponible | `packages/connectors/woocommerce/onboard.js` |
| Shopify | 🚧 En cours | `packages/connectors/shopify/onboard.js` |
| Magento | 🚧 En cours | `packages/connectors/magento/onboard.js` |
| Autre CMS | 📖 Voir ci-dessous | Créez le vôtre |

---

## Format produit standard

Quel que soit le CMS, chaque produit doit être transformé vers ce format avant indexation :

```js
{
  id: 12345,              // Identifiant unique (entier)
  nom: "Lave-linge 9kg", // Nom complet du produit
  description: "...",    // Description courte, HTML nettoyé, max 300 chars
  prix_num: 399.90,      // Prix en nombre (pour le tri)
  prix: "399.90 €",      // Prix formaté (pour l'affichage)
  category_id: 813,      // ID de la catégorie principale
  active: true,          // Produit visible et en vente
  image_url: "https://...", // URL de l'image principale
  url: "https://...",    // URL de la fiche produit
  reference: "SKU-123",  // Référence / SKU
}
```

La fonction `createStandardProduct()` dans `packages/core/interfaces/product.js` vous aide à créer des objets conformes avec des valeurs par défaut sécurisées.

---

## Créer un connecteur pour un nouveau CMS

### Structure minimale

```
packages/connectors/votre-cms/
├── onboard.js      # Script d'indexation initiale
├── sync.js         # Script de synchronisation (optionnel)
└── README.md       # Documentation spécifique
```

### Template de base

```js
// packages/connectors/votre-cms/onboard.js
const { createStandardProduct } = require("../../core/interfaces/product");

// 1. Récupérer les produits depuis votre CMS
async function fetchProducts() {
  // Appelez l'API de votre CMS ici
  // Retournez un tableau de produits bruts
}

// 2. Transformer vers le format standard Classic AI
function transformProduct(rawProduct) {
  return createStandardProduct({
    id: rawProduct.id,
    nom: rawProduct.title,
    description: rawProduct.body_html,
    prix_num: parseFloat(rawProduct.price),
    category_id: rawProduct.category_id,
    active: rawProduct.status === "active",
    image_url: rawProduct.image?.src,
    url: rawProduct.url,
    reference: rawProduct.sku,
  });
}
```

### Les 3 règles d'un bon connecteur

1. **Transformez tout** — utilisez toujours `createStandardProduct()`
2. **Gérez les erreurs** — un produit qui échoue ne doit pas arrêter l'indexation
3. **Respectez les limites API** — ajoutez des pauses si votre CMS les impose

---

## Connecteur PrestaShop

### Prérequis

1. Activez le Webservice : Back-office → Paramètres avancés → Webservice
2. Créez une clé API avec uniquement ces permissions en lecture :

| Ressource | GET |
|---|---|
| products | ✅ |
| categories | ✅ |
| images | ✅ |

⚠️ N'activez PAS les permissions sur : customers, orders, addresses, payments

### Usage

```bash
node packages/connectors/prestashop/onboard.js \
  --url https://votre-boutique.com \
  --key VOTRE_CLE_API \
  --name nom-client
```

---

## Connecteur WooCommerce

### Prérequis

1. Activez l'API REST : WooCommerce → Paramètres → Avancé → API REST
2. Créez une clé avec les permissions **Lecture seule**

### Usage

```bash
node packages/connectors/woocommerce/onboard.js \
  --url https://votre-boutique.com \
  --key ck_votre_consumer_key \
  --secret cs_votre_consumer_secret \
  --name nom-client
```

---

## Mise à jour automatique du catalogue

Après l'indexation initiale, une mise à jour automatique hebdomadaire maintient le catalogue à jour.

Le fichier `.github/workflows/sync.yml` est déjà configuré — ajoutez simplement vos variables dans GitHub → Settings → Secrets.

---

## Contribuer un connecteur

Vous avez créé un connecteur pour un CMS non supporté ? Ouvrez une Pull Request.

Structure attendue :
- `onboard.js` fonctionnel et testé
- `README.md` avec les prérequis et instructions
- Utilisation de `createStandardProduct()` obligatoire
