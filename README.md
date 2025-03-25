# Projet : DApp de Vote sur Ethereum

## Présentation

Ce projet vise la création d’une application décentralisée (DApp) permettant d’organiser un vote en toute transparence et sécurité grâce à un contrat intelligent déployé sur la blockchain Ethereum. Seuls les électeurs inscrits sur une liste blanche peuvent soumettre des propositions et voter.

---

## Structure Backend
```env
backend/
├── contracts/
│   └── Voting.sol            → Contrat principal de vote
├── scripts/
│   └── deploy.ts             → Script de déploiement du contrat
├── ignition/
│   └── modules/
│       └── VotingModule.ts   → Module Ignition (alternative à deploy.ts)
├── hardhat.config.ts         → Configuration Hardhat
├── typechain-types/          → Typages générés pour TypeScript
└── .env                      → Fichier des variables d’environnement
```
---
## Fonctionnalités du contrat Voting

Le contrat Voting permet de gérer un système de vote décentralisé avec les fonctionnalités suivantes :
voici le lien contennant les détails des fonctionnalités : []

---
## Tests

Les tests sont définis pour vérifier que le contrat fonctionne correctement.(Ils sont documentés ici : [])

---
## Déploiement Backend

#### En local (Hardhat)
1.	Lancer un nœud local :

```env
npx hardhat node
```

2. Déployer le contrat :
```env
   npx hardhat run scripts/deploy.ts --network localhost
```

#### Sur Sepolia

```env
npx hardhat run scripts/deploy.ts --network sepolia
```
###### Deuxième possibilité en utilisant avec ignition
```env
npx hardhat ignition deploy ignition/modules/VotingModule.ts --network sepolia
```
---
## Utilitaires
#### Afficher les comptes disponibles :
```env
npx hardhat accounts
```
#### Vérifier le solde d’un compte Sepolia :

Par défaut, la tâche balance affiche le solde du premier compte configuré (PRIVATE_KEY dans .env si sur Sepolia).
```env
npx hardhat balance --network sepolia
```

---

## Déploiement Frontend

#### En local (Hardhat)
1.	Installer les dépendances :

```
npm install
```
2.	Run le projet :

```
npm run dev
```

### Développement du Frontend (Next.js / React)

- Création d’une interface responsive et dynamique avec TypeScript & Next.js.

- Connexion avec le smart contract.

- Affichage en temps réel des données de la blockchain.

- Déroulement du Vote

- Inscription des électeurs : l’administrateur ajoute des électeurs à la liste blanche.

- Propositions : les électeurs soumettent leurs propositions.

- Clôture des propositions : l’administrateur ferme cette phase.

- Ouverture du vote : les électeurs peuvent voter pour une proposition.

- Fermeture du vote : les votes sont comptabilisés automatiquement.

- Annonce des résultats : la proposition gagnante est affichée.

### Détails Techniques

- **Langage Smart Contract :** Solidity

- **Frameworks et Outils :** Hardhat 

- **Frontend :** Next.js, TypeScript, Ethers.js

- **Tests :** Hardhat Test Environment

## Liens Importants

Vidéo de démonstration : []

DApp Déployée : []


