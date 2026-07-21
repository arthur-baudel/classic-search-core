# Classic AI — Moteur de recherche IA pour l'e-commerce

> Transformez n'importe quelle boutique en ligne en une expérience de recherche conversationnelle. Vos clients trouvent ce qu'ils cherchent en langage naturel — même avec des fautes de frappe, des synonymes ou des descriptions floues.

[![Demo](https://img.shields.io/badge/Démo%20live-maorediscount--api.vercel.app-blue)](https://maorediscount-api.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen)](https://nodejs.org)

---

## 🎯 Ce que c'est

Classic AI est un moteur de recherche sémantique open-source conçu pour les boutiques e-commerce. Il comprend le sens de ce que cherche votre client, pas juste les mots exacts.

**Exemple concret :**

| Requête client | Recherche classique | Classic AI |
|---|---|---|
| "frigo pas cher" | Cherche "frigo" + "pas" + "cher" | Trouve les réfrigérateurs triés par prix croissant |
| "quelque chose pour laver mon linge" | Aucun résultat | Trouve les lave-linges disponibles |
| "tv 55 pouces 4k moins de 600€" | Résultats approximatifs | Filtre exact : 55", 4K, < 600€ |
| "avez-vous des miroirs" | "Produit non trouvé" | Trouve les coiffeuses avec miroir |

---

## ✨ Fonctionnalités

- 🔍 **Recherche sémantique** — comprend l'intention, pas juste les mots
- 💬 **Interface conversationnelle** — le client dialogue naturellement avec sa boutique
- 🏷️ **Filtres intelligents** — prix, marque, capacité, dimensions, specs techniques
- 📄 **Pagination automatique** — "montrez m'en d'autres" fonctionne nativement
- 🌍 **Multi-langues** — répond dans la langue du client
- ⚡ **Temps réel** — résultats en moins d'une seconde
- 🔒 **Sécurisé** — rate limiting, CORS strict, validation des inputs, RGPD compliant
- 🔌 **Multi-plateformes** — PrestaShop, WooCommerce, Shopify, Magento

---

## 🏗️ Architecture

```
classic-ai/
├── packages/
│   ├── core/                    # Moteur de recherche agnostique
│   │   ├── search/              # Recherche vectorielle + filtres attributs
│   │   ├── interfaces/          # Format produit standard (tous CMS)
│   │   └── filters/             # Filtres prix, marque, specs, dimensions
│   └── connectors/              # Adaptateurs par plateforme
│       ├── prestashop/          # Connecteur PrestaShop (disponible)
│       ├── woocommerce/         # Connecteur WooCommerce (en cours)
│       ├── shopify/             # Connecteur Shopify (en cours)
│       └── magento/             # Connecteur Magento (en cours)
├── api/                         # Handlers serverless (Vercel)
│   ├── search.js                # Endpoint de recherche
│   └── chat.js                  # Endpoint conversationnel (Claude)
├── widget/                      # Widget intégrable (une ligne de code)
│   └── widget.js
├── examples/                    # Exemples par plateforme
│   └── prestashop-demo/
└── docs/                        # Documentation complète
    ├── getting-started.md
    ├── connectors.md
    └── security.md
```

### Stack technique

| Composant | Technologie |
|---|---|
| Embeddings | Voyage AI (voyage-3-lite) |
| Base vectorielle | Qdrant Cloud |
| LLM | Claude Haiku (Anthropic) |
| API | Node.js — Vercel Serverless |
| Rate limiting | Upstash Redis |
| CMS supportés | PrestaShop, WooCommerce, Shopify, Magento |

---

## 🚀 Démo live

Une boutique réelle de 50 000 produits tourne sur Classic AI en production.

👉 **[Voir la démo](https://maorediscount-api.vercel.app)**

Testez par exemple :
- `lave linge 9kg pas cher`
- `télé 55 pouces 4k`
- `pc portable i5 512go`
- `canapé d'angle convertible`

---

## ⚡ Démarrage rapide

### Prérequis

- Node.js 20+
- Compte [Qdrant Cloud](https://cloud.qdrant.io) (gratuit)
- Compte [Voyage AI](https://www.voyageai.com) (gratuit)
- Compte [Anthropic](https://www.anthropic.com) (Claude)
- Compte [Vercel](https://vercel.com) (gratuit)

### Installation

```bash
git clone https://github.com/votre-compte/classic-ai.git
cd classic-ai
npm install
```

### Configuration

Copiez le fichier d'exemple et remplissez vos clés :

```bash
cp .env.example .env
```

```env
QDRANT_URL=https://votre-cluster.qdrant.io
QDRANT_API_KEY=votre_cle_qdrant
VOYAGE_API_KEY=votre_cle_voyage
ANTHROPIC_API_KEY=votre_cle_anthropic
PRESTASHOP_URL=https://votre-boutique.com
PRESTASHOP_API_KEY=votre_cle_prestashop
WIDGET_SECRET=votre_secret_widget
```

### Indexation du catalogue

```bash
# PrestaShop
node packages/connectors/prestashop/onboard.js \
  --url https://votre-boutique.com \
  --key VOTRE_CLE_API \
  --name nom-client
```

### Intégration du widget

Une seule ligne à ajouter sur votre site :

```html
<script src="https://votre-api.vercel.app/widget.js"></script>
```

---

## 🔒 Sécurité

Classic AI a été conçu avec la sécurité comme priorité :

- **CORS strict** — seul votre domaine peut appeler l'API
- **Rate limiting Redis** — protection contre les abus et les bots
- **Validation des inputs** — tous les paramètres sont vérifiés et nettoyés
- **Zéro donnée client** — aucune donnée personnelle collectée ou stockée (RGPD)
- **Clés sécurisées** — jamais dans le code, uniquement en variables d'environnement
- **Lecture seule** — le chatbot ne peut pas modifier votre catalogue

---

## 🔌 Connecteurs disponibles

### PrestaShop ✅
Indexation complète, synchronisation automatique, toutes versions.

### WooCommerce 🚧
En cours de développement.

### Shopify 🚧
En cours de développement.

### Magento 🚧
En cours de développement.

**Vous utilisez un autre CMS ?** Ouvrez une issue ou consultez la [documentation des connecteurs](docs/connectors.md) pour créer le vôtre.

---

## 📊 Performances

Testé en production sur un catalogue de 50 000 produits :

- ⚡ Temps de réponse moyen : < 800ms
- 🎯 Précision de recherche : supérieure aux moteurs textuels classiques
- 📈 Catalogue supporté : jusqu'à 500 000 produits

---

## 🤝 Contribuer

Les contributions sont les bienvenues. Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour commencer.

Les domaines prioritaires :
- Nouveaux connecteurs CMS
- Amélioration des filtres
- Support de nouvelles langues
- Documentation

---

## 📄 Licence

MIT — libre d'utilisation, y compris commerciale.

---

## 👤 Auteur

Développé par **Classic AI**

- Démo : [maorediscount-api.vercel.app](https://maorediscount-api.vercel.app)
- Contact : [votre email]

---

*Classic AI — La recherche IA pour votre boutique, sans compromis sur la sécurité.*
