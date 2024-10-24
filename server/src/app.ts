// Load the express module to create a web application

import express from "express";

const app = express();

// Configure it

/* ************************************************************************* */

// CORS Handling: Pourquoi le code actuel est-il présent et dois-je définir les origines spécifiques autorisées de mon projet ?

// CORS (Cross-Origin Resource Sharing) est un mécanisme de sécurité dans les navigateurs web qui bloque les demandes provenant d’un domaine différent du serveur.
// Vous trouverez la phrase magique suivante dans les forums :

// app.use(cors());

// Vous ne devriez PAS faire cela : un tel code utilise le module « cors » pour permettre toutes les origines, ce qui peut poser des problèmes de sécurité.
// Pour ce modèle pédagogique, le code CORS permet CLIENT_URL en mode développement (lorsque process.env.CLIENT_URL est défini).

import cors from "cors";

if (process.env.CLIENT_URL != null) {
  app.use(cors({ origin: [process.env.CLIENT_URL] }));
}

// Si vous devez autoriser des origines supplémentaires, vous pouvez ajouter quelque chose comme ceci :

/*
app.use(
  cors({
    origin: ["http://mysite.com", "http://another-domain.com"],
  }),
);
*/

// With ["http://mysite.com", "http://another-domain.com"]
// to be replaced with an array of your trusted origins

/* ************************************************************************* */

// Analyse des requêtes : comprendre le but de cette partie

// L'analyse des requêtes est nécessaire pour extraire les données envoyées par le client dans une requête HTTP.
// Par exemple pour accéder au corps d’une requête POST.
// Le code actuel contient différentes options d'analyse sous forme de commentaires pour démontrer différentes manières d'extraire des données.

// 1. `express.json()`: Analyse les requêtes avec les données JSON.
// 2. `express.urlencoded()`: Parses requests with URL-encoded data.
// 3. `express.text()`: Parses requests with raw text data.
// 4. `express.raw()`: Parses requests with raw binary data.

// Décommentez une ou plusieurs de ces options selon le format des données envoyées par votre client :

app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.text());
// app.use(express.raw());

/* ************************************************************************* */

// Importer l'API routeur
import router from "./router";

// Montez l'API routeur sous le point de terminaison "/api"
app.use(router);

/* ************************************************************************* */
/*  
    Configuration prête pour la production : à quoi ça sert ?
    Le code comprend des sections pour mettre en place un environnement de production où le client et le serveur sont exécutés à partir du même processus.

    A quoi ça sert :
        - Servir les fichiers statiques du client à partir du serveur, ce qui est utile lors de la création d'une application d'une seule page avec React.
        - Redirection des requêtes non gérées (par exemple, toutes les requêtes ne correspondant pas à une route API définie) vers le fichier index.html du client. 
        Cela permet au client de gérer le routage côté client.

*/
import fs from "node:fs";
import path from "node:path";

// Servir les ressources du serveur

const publicFolderPath = path.join(__dirname, "../../server/public");

if (fs.existsSync(publicFolderPath)) {
  app.use(express.static(publicFolderPath));
}

// Servir les ressources des clients

const clientBuildPath = path.join(__dirname, "../../client/dist");

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Rediriger les requêtes non gérées vers le fichier d'index client

  app.get("*", (_, res) => {
    res.sendFile("index.html", { root: clientBuildPath });
  });
}

/* ************************************************************************* */

// Middleware pour la journalisation des erreurs
// Important : le middleware de gestion des erreurs doit être défini en dernier, après les autres appels app.use() et routes.

import type { ErrorRequestHandler } from "express";

// Définir une fonction middleware pour enregistrer les erreurs
const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  // Enregistrez l'erreur sur la console à des fins de débogage
  console.error(err);
  console.error("on req:", req.method, req.path);

  // Transmettez l'erreur au prochain middleware de la pile
  next(err);
};

// Monter le middleware logErrors globalement
app.use(logErrors);

/* ************************************************************************* */

export default app;
