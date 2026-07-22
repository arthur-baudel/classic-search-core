# 🚀 Guide de démarrage — Classic AI

Ce guide vous permet d'installer Classic AI sur votre boutique en moins d'une heure.

---

## Prérequis

Avant de commencer, créez un compte gratuit sur chacun de ces services :

| Service | Rôle | Lien |
|---|---|---|
| [Qdrant Cloud](https://cloud.qdrant.io) | Stockage des produits indexés | Gratuit jusqu'à 1 Go |
| [Voyage AI](https://www.voyageai.com) | Compréhension du langage | Gratuit jusqu'à 50M tokens |
| [Anthropic](https://www.anthropic.com) | Intelligence conversationnelle | Pay-as-you-go |
| [Vercel](https://vercel.com) | Hébergement de l'API | Gratuit |
| [Upstash](https://upstash.com) | Protection anti-abus | Gratuit jusqu'à 10 000 req/jour |

---

## Étape 1 — Cloner le projet

```bash
git clone https://github.com/votre-compte/classic-ai.git
cd classic-ai
npm install
```

---

## Étape 2 — Configurer les variables d'environnement

Copiez le fichier modèle :

```bash
cp .env.example .env
```

Ouvrez `.env` et remplissez chaque valeur :

```env
QDRANT_URL=https://votre-cluster.qdrant.io
QDRANT_API_KEY=votre_cle_qdrant
VOYAGE_API_KEY=votre_cle_voyage
ANTHROPIC_API_KEY=votre_cle_anthropic
UPSTASH_REDIS_REST_URL=https://votre-base.upstash.io
UPSTASH_REDIS_REST_TOKEN=votre_token_upstash
WIDGET_SECRET=une_chaine_aleatoire_longue
```

> ⚠️ Ne commitez jamais le fichier `.env` — il est déjà dans `.gitignore`

---

## Étape 3 — Indexer votre catalogue

Choisissez le connecteur correspondant à votre CMS :

### PrestaShop

```bash
node packages/connectors/prestashop/onboard.js \
  --url https://votre-boutique.com \
  --key VOTRE_CLE_API_PRESTASHOP \
  --name nom-client
```

### WooCommerce

```bash
node packages/connectors/woocommerce/onboard.js \
  --url https://votre-boutique.com \
  --key CONSUMER_KEY \
  --secret CONSUMER_SECRET \
  --name nom-client
```

> ⏱️ L'indexation prend entre 20 et 60 minutes selon la taille du catalogue.

Une fois terminé, vous verrez :
```
🎉 Terminé en 45 minutes — 12 500 produits indexés
```

---

## Étape 4 — Déployer sur Vercel

### Via GitHub (recommandé)

1. Poussez votre code sur GitHub
2. Connectez votre repo sur [vercel.com](https://vercel.com)
3. Ajoutez vos variables d'environnement dans Vercel → Settings → Environment Variables
4. Déployez

### Via CLI

```bash
npm install -g vercel
vercel --prod
```

---

## Étape 5 — Intégrer le widget sur votre site

Ajoutez une seule ligne avant la fermeture de `</body>` :

```html
<script src="https://votre-api.vercel.app/widget.js"></script>
```

Le widget apparaît automatiquement en bas à droite de votre site.

---

## Étape 6 — Tester

Ouvrez votre site et testez avec des requêtes en langage naturel :

- `lave linge pas cher`
- `télé 55 pouces 4k`
- `vous avez des miroirs ?`

---

## Maintenir le catalogue à jour

Planifiez une synchronisation hebdomadaire via GitHub Actions pour que les produits désactivés disparaissent automatiquement des résultats :

Le fichier `.github/workflows/sync.yml` est déjà inclus dans le projet — ajoutez simplement vos secrets dans GitHub → Settings → Secrets and variables → Actions.

---

## Problèmes fréquents

**Le widget n'apparaît pas**
Vérifiez que l'URL dans `widget.js` correspond à votre déploiement Vercel.

**Les résultats sont vides**
Vérifiez que l'indexation s'est bien terminée et que `QDRANT_URL` est correct dans Vercel.

**Erreur 401**
Vérifiez que `WIDGET_SECRET` est identique dans Vercel et dans `widget.js`.

**Erreur 429**
Trop de requêtes — le rate limiting est actif. Normal en cas de test intensif.

---

## Besoin d'aide ?

Ouvrez une [issue sur GitHub](https://github.com/votre-compte/classic-ai/issues) ou consultez la [documentation complète](./connectors.md).
