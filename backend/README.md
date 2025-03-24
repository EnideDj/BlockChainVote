# BlockChain Vote – Backend

Ce dossier contient le **contrat intelligent Voting**, développé en Solidity, permettant de gérer un système de vote décentralisé sécurisé et transparent.

---

## Structure
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
```env
1. Enregistrement des votants
	- registerVoter(address _voterAddress) : Enregistre un votant en ajoutant son adresse à la liste des votants enregistrés.
	- removeVoter(address _voterAddress) : Supprime un votant de la liste des votants enregistrés.

2. Gestion du processus de vote
	- registerProposal(string memory _description) : Permet à un votant enregistré de soumettre une proposition.
	- vote(uint _proposalId) : Permet à un votant enregistré de voter pour une proposition.
	- updateVote(uint _newProposalId) : Permet à un votant de changer son vote.
	- abstain() : Permet à un votant de s’abstenir de voter.

3. Gestion du statut du workflow
	- nextWorkflowStatus() : Permet au propriétaire de faire avancer le processus de vote (ex : de “Enregistrement des votants” à “Début de l’enregistrement des propositions”).
	- workflowStatus : Renvoie le statut actuel du processus de vote (par exemple, Enregistrement des votants, Enregistrement des propositions, etc.).

4. Tallying des votes
	- tallyVotes() : Permet au propriétaire de compter les votes et de déterminer les propositions gagnantes.
	- getWinners() : Retourne les propositions gagnantes après le décompte des votes.
	- getPastResults() : Retourne les résultats précédents des élections.

5. Fonctions de consultation
	- getAllVoters() : Retourne toutes les adresses des votants enregistrés.
	- getVoter(address _addr) : Retourne les informations sur un votant donné.
	- getOneProposal(uint _id) : Retourne une proposition donnée par son ID.
	- getVoterVote(address _addr) : Retourne l’ID de la proposition qu’un votant a choisie.
	- hasVoted() : Vérifie si l’appelant a voté.
```
---
## Tests

Les tests sont définis pour vérifier que le contrat fonctionne correctement. Voici les tests existants :
## Tests

Le fichier test/Voting.test.js contient des tests unitaires basés sur Chai + Hardhat.

```env
npx hardhat test
```

```env
1. Test de déploiement
    - Vérifie que le contrat est correctement déployé.
    - Vérifie que le propriétaire du contrat est bien défini.
2. Test d’enregistrement des votants
    - Vérifie que le propriétaire peut enregistrer des votants.
    - Vérifie que l’enregistrement d’un votant déjà inscrit échoue.
3. Test d’enregistrement des propositions
    Vérifie qu’un votant inscrit peut soumettre une proposition.
    Vérifie qu’un votant non inscrit ne peut pas soumettre une proposition.
4. Test du processus de vote
    Vérifie qu’un votant inscrit peut voter.
    Vérifie que les votes en double sont empêchés.
    Vérifie qu’un votant peut s’abstenir.
5. Test de comptage des votes
    Vérifie que les votes sont correctement comptabilisés et que la proposition gagnante est déterminée.
6. Test de l’historique des résultats
    Vérifie que les résultats des votes précédents sont bien stockés.
```
---
## Configuration

Crée un fichier `.env` à la racine du dossier backend :

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/PROJECT_ID
PRIVATE_KEY=CLÉ_PRIVÉE
ETHERSCAN_API_KEY=CLÉ_ETHERSCAN 
```
---
## Déploiement

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

## Dépendances principales
```env
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- TypeChain
- dotenv
- chai / mocha
```
