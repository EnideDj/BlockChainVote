# Projet : DApp de Vote sur Ethereum

## Présentation

Ce projet vise la création d’une application décentralisée (DApp) permettant d’organiser un vote en toute transparence et sécurité grâce à un contrat intelligent déployé sur la blockchain Ethereum. Seuls les électeurs inscrits sur une liste blanche peuvent soumettre des propositions et voter.

## Membres du groupe

- **Enide DJENDER**
- **Ousmane DIALLO**
- **Amanie SAID**

## Objectifs

### 1. Développement du Smart Contract (Solidity)

- Implémentation du contrat Voting.sol.

- Définition des structures de données (Voter, Proposal).

- Gestion des états du vote avec l’énumération WorkflowStatus.

- Ajout des événements (VoterRegistered, ProposalRegistered, Voted).

- Documentation avec les commentaires NatSpec.

### 2. Tests et Ajout de Fonctionnalités 

- Implémentation de tests unitaires en JavaScript (Truffle, Hardhat, ou Foundry).

- Vérification des transitions d’état et restrictions d’accès.

- Ajout de deux fonctionnalités innovantes :

- Un système de vote à bulletin secret avec hachage des votes.

- Une option de vote par délégation.

### 3. Déploiement et Sécurité 

- Sécurisation contre les attaques (Reentrancy, Overflows, etc.).

- Déploiement du smart contract sur Ethereum (Goerli, Sepolia, ou Mainnet).

- Hébergement de l’interface sur Vercel / Heroku / AWS.

### 4. Développement du Frontend (Next.js / React)

- Création d’une interface responsive et dynamique avec TypeScript & Next.js.

- Connexion avec le smart contract via Web3.js ou Ethers.js.

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


