# 🔒 Sécurité — Classic AI

Ce document décrit toutes les mesures de sécurité mises en place dans Classic AI.

---

## 1. Protection des données clients

### Ce que le chatbot peut voir
- ✅ Noms des produits
- ✅ Prix des produits
- ✅ Photos des produits
- ✅ Liens vers les fiches produits

### Ce que le chatbot ne peut pas voir
- ❌ Comptes clients
- ❌ Mots de passe
- ❌ Commandes
- ❌ Données de paiement
- ❌ Adresses de livraison
- ❌ Historique d'achat

L'accès à votre CMS est configuré en **lecture seule sur le catalogue uniquement**. Toute tentative d'accès à d'autres ressources retourne une erreur.

### Conformité RGPD

Classic AI ne collecte aucune donnée personnelle :

- Aucun nom, email ou identifiant client n'est transmis à l'API
- Les conversations disparaissent complètement à la fermeture de la fenêtre
- Aucune conversation n'est sauvegardée en base de données
- Le seul stockage temporaire est un compteur anonyme de requêtes (rate limiting) qui s'efface automatiquement après 60 secondes

---

## 2. Protection de l'API

### Authentification
Toutes les routes API sont protégées par un token secret. Une requête sans token valide reçoit une réponse `401 Unauthorized`.

### Rate limiting
Un système de limitation partagé (Redis) bloque automatiquement les abus :
- Maximum **20 messages/minute** par IP pour le chatbot
- Maximum **60 requêtes/minute** par IP pour la recherche
- Protection contre les bots et les attaques par force brute

### CORS strict
L'API n'accepte les requêtes que depuis votre domaine configuré. Toute requête depuis un autre domaine est bloquée automatiquement.

### Validation des inputs
Tous les paramètres sont vérifiés et nettoyés avant traitement :
- Longueur maximale des messages : 500 caractères
- Format des paramètres de recherche validé
- Protection contre les injections de code

### Headers de sécurité HTTP
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
```

### Erreurs sécurisées
Les messages d'erreur ne révèlent aucune information technique sur l'infrastructure. Un attaquant ne peut pas déduire la structure du système depuis les réponses d'erreur.

---

## 3. Protection de l'infrastructure

### Clés API
- Toutes les clés sont stockées dans les variables d'environnement Vercel
- Jamais dans le code source
- Jamais dans le repo GitHub
- Invisibles même pour quelqu'un ayant accès au code

### Accès base de données
- La clé Qdrant utilisée en production est en **lecture seule**
- Personne ne peut modifier le catalogue via le chatbot
- Les scripts de maintenance utilisent une clé séparée avec droits d'écriture

### Repo GitHub
- Le repo de production est **privé**
- Accessible uniquement aux personnes autorisées
- Le fichier `.gitignore` empêche tout commit accidentel de données sensibles

### Double authentification
La double authentification (2FA) est activée sur tous les comptes :
- Vercel (hébergement)
- GitHub (code source)
- Qdrant Cloud (base vectorielle)
- Upstash (rate limiting)
- Anthropic (IA)

### Rotation des clés
En cas de compromission suspectée, toutes les clés peuvent être changées en quelques minutes sans interruption de service.

---

## 4. Isolation du widget

Le widget fonctionne dans une bulle complètement isolée sur votre site :

- Il ne lit pas les cookies de vos clients
- Il ne sauvegarde rien dans le navigateur (localStorage, sessionStorage)
- Il n'interagit avec aucun autre élément de votre site
- Il ne peut pas accéder aux formulaires, champs de saisie ou données de session

---

## 5. Mise à jour automatique du catalogue

Un système de mise à jour automatique hebdomadaire maintient votre catalogue toujours à jour :

- Les produits désactivés dans votre CMS disparaissent automatiquement des résultats
- Les nouveaux produits sont pris en compte
- L'automatisation tourne sur une infrastructure isolée, sans accès à votre site en production

---

## 6. Signaler une vulnérabilité

Si vous découvrez une faille de sécurité, contactez-nous directement par email plutôt que d'ouvrir une issue publique.

Nous nous engageons à répondre sous 48h et à corriger toute vulnérabilité confirmée.
