// packages/connectors/woocommerce/onboard.js
// ===================== CLASSIC AI — Connecteur WooCommerce =====================
// Indexe un catalogue WooCommerce dans Qdrant via l'API REST WooCommerce v3
// Usage : node packages/connectors/woocommerce/onboard.js \
//           --url https://votre-boutique.com \
//           --key CONSUMER_KEY \
//           --secret CONSUMER_SECRET \
//           --name nom-client
// ==============================================================================

const { createStandardProduct } = require("../../core/interfaces/product");

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VECTOR_SIZE = 512;
const BATCH_SIZE = 100;
const PER_PAGE = 100;

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : null;
}

const WOO_URL = getArg("url")?.replace(/\/$/, "");
const CONSUMER_KEY = getArg("key");
const CONSUMER_SECRET = getArg("secret");
const CLIENT_NAME = getArg("name")?.toLowerCase().replace(/[^a-z0-9]/g, "-");
const COLLECTION_NAME = `products_${CLIENT_NAME}`;

if (!WOO_URL || !CONSUMER_KEY || !CONSUMER_SECRET || !CLIENT_NAME) {
  console.error("❌ Usage : node onboard.js --url https://boutique.com --key CK_xxx --secret CS_xxx --name nom-client");
  process.exit(1);
}

// Authentification WooCommerce via Basic Auth (Consumer Key + Secret)
function getAuthHeader() {
  return "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
}

async function fetchWithRetry(url, options = {}, maxRetries = 4) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (err) {
      if (attempt === maxRetries) return null;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/**
 * Récupère tous les produits WooCommerce via pagination
 */
async function fetchAllWooProducts() {
  console.log("📦 Récupération des produits WooCommerce...");
  let allProducts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${WOO_URL}/wp-json/wc/v3/products?per_page=${PER_PAGE}&page=${page}&status=publish`;
    const response = await fetchWithRetry(url, {
      headers: { Authorization: getAuthHeader() },
    });

    if (!response) break;

    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) {
      hasMore = false;
    } else {
      allProducts = allProducts.concat(products);
      hasMore = products.length === PER_PAGE;
      page++;
      process.stdout.write(`\r   ${allProducts.length} produits récupérés...`);
    }
  }

  console.log(`\n✅ ${allProducts.length} produits WooCommerce récupérés`);
  return allProducts;
}

/**
 * Transforme un produit WooCommerce vers le format Standard Classic AI
 */
function transformWooProduct(p) {
  const categoryId = p.categories?.[0]?.id || null;
  const imageUrl = p.images?.[0]?.src || "";
  const price = parseFloat(p.price || p.regular_price || 0);
  const description = (p.short_description || p.description || "")
    .replace(/<[^>]+>/g, "")
    .trim()
    .slice(0, 300);

  return createStandardProduct({
    id: p.id,
    nom: p.name,
    description,
    prix_num: price,
    category_id: categoryId,
    active: p.status === "publish" && p.stock_status !== "outofstock",
    image_url: imageUrl,
    url: p.permalink,
    reference: p.sku || "",
  });
}

async function getEmbedding(text) {
  const response = await fetchWithRetry("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${VOYAGE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "voyage-3-lite", input: [text] }),
  });
  if (!response) return null;
  const data = await response.json();
  return data.data?.[0]?.embedding || null;
}

async function createCollection() {
  const check = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    headers: { "api-key": QDRANT_API_KEY },
  });
  if (check.ok) {
    console.log(`⚠️  Collection "${COLLECTION_NAME}" existe déjà`);
    return;
  }
  await fetchWithRetry(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "api-key": QDRANT_API_KEY },
    body: JSON.stringify({ vectors: { size: VECTOR_SIZE, distance: "Cosine" } }),
  });
  const indexes = [
    { field_name: "category_id", field_schema: "keyword" },
    { field_name: "active", field_schema: "bool" },
    { field_name: "prix_num", field_schema: "float" },
    { field_name: "reference", field_schema: "keyword" },
  ];
  for (const idx of indexes) {
    await fetchWithRetry(`${QDRANT_URL}/collections/${COLLECTION_NAME}/index`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "api-key": QDRANT_API_KEY },
      body: JSON.stringify(idx),
    });
  }
  console.log(`✅ Collection "${COLLECTION_NAME}" créée`);
}

async function upsertPoints(points) {
  await fetchWithRetry(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points?wait=true`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "api-key": QDRANT_API_KEY },
    body: JSON.stringify({ points }),
  });
}

async function main() {
  console.log(`\n🚀 Classic AI — Onboarding WooCommerce : ${CLIENT_NAME}`);
  console.log(`   Boutique : ${WOO_URL}`);
  console.log(`   Collection : ${COLLECTION_NAME}\n`);

  const startTime = Date.now();

  await createCollection();

  const wooProducts = await fetchAllWooProducts();
  const standardProducts = wooProducts.map(transformWooProduct);

  console.log("\n🔢 Indexation dans Qdrant...");
  let done = 0;
  let errors = 0;
  const chunks = chunk(standardProducts, 20);

  for (const batch of chunks) {
    const points = [];
    for (const p of batch) {
      const text = `${p.nom} ${p.description}`.trim();
      const vector = await getEmbedding(text);
      if (!vector) { errors++; continue; }
      points.push({ id: p.id, vector, payload: p });
    }
    if (points.length > 0) {
      for (const b of chunk(points, BATCH_SIZE)) await upsertPoints(b);
    }
    done += batch.length;
    process.stdout.write(`\r   ${done}/${standardProducts.length} indexés — ${errors} erreurs`);
  }

  const totalMin = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n\n🎉 Terminé en ${totalMin} minutes — ${done - errors} produits indexés`);
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale:", err.message);
  process.exit(1);
});
