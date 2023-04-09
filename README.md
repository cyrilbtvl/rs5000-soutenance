


# Alyra - Parcours Développeur Blockchain

📌  Créer une Dapps de gestion de garantie autour du smart contract GuarantifyNFTContract


## Guide d'utilisation du MVP

Vous trouverez une vidéo de présentation du projet sur l'URL suivant : [Vidéo de démo](https://)

Il existe une exemple deployé sur le testnet de Polygon, Mumbai ici :
```0x12FE08b22168b7F3FC2847aBD85AE8A79f9ECd1b```

Vous avez une version du front sur Vercel en ligne [ici](https://rs5000-soutenance-3f8fwakub-cyrilbtvl.vercel.app/) / https://rs5000-soutenance-3f8fwakub-cyrilbtvl.vercel.app/

## Besoin du projet

📌  Qui de nos jours, sait exactement parmi les objets qu’il possède, lesquels sont toujours sous garantie constructeur ou sous extension de garantie ? Oui, pas grand monde.

L'idée du projet est de proposer une application décentralisée qui devra répondre à différentes problématiques dont en voici
quelques exemples.

Pour les bénéficiaires :
1. La difficulté à conserver et à suivre les garanties papier : Les bénéficiaires peuvent
avoir du mal à conserver les garanties papier de même que les preuves d'achat associées
à leurs produits, ce qui peut rendre difficile la prise de décision quant à la réclamation
d'une garantie.
2. L’absence de moyen efficace pour centraliser les garanties de façon numérique :
Les bénéficiaires peuvent avoir du mal à centraliser et à gérer leurs garanties de manière
numérique, ce qui peut rendre difficile la compréhension de l'étendue de leur garantie en
cas de besoin.
3. L’absence de bénéfice pour le nouvel acheteur en termes de portabilité de la
garantie à un autre : Les bénéficiaires de garanties peuvent rencontrer des problèmes
lorsqu'ils essaient de transférer la garantie à un nouvel acheteur, ce qui peut entraîner une
perte de valeur pour la garantie et peut freiner l’acquisition d’une extension.
4. Le besoin de rappel à la fin de la période de garantie pour bénéficier d'une
éventuelle prolongation : Les bénéficiaires peuvent avoir besoin d'un rappel à la fin de la
période de garantie pour bénéficier d'une éventuelle prolongation de la garantie, ce qui
peut nécessiter des efforts supplémentaires pour le suivi des garanties.

Pour les fournisseurs :
1. La fraude : Les fournisseurs de garanties doivent faire face à la fraude, qui peut prendre
de nombreuses formes, notamment des réclamations de garantie frauduleuses ou des
garanties falsifiées.
2. La complexité de gestion des garanties : Les garanties peuvent être complexes à gérer
en raison du grand nombre de produits et de variantes de produits disponibles sur le
marché, ce qui peut rendre difficile la gestion des garanties et des réclamations.
3. La difficulté à suivre les garanties et gérer les coûts associés : Les fournisseurs
peuvent avoir du mal à suivre les garanties associées à leurs produits, ce qui peut
entraîner des coûts élevés ce qui peut avoir un impact sur leur rentabilité globale. Les
coûts comprennent souvent les réparations, les remplacements de produits et la gestion
des réclamations.
4. L’absence de relation continue entre le fournisseur et le client une fois la vente
terminée : Les fournisseurs de garanties peuvent avoir du mal à maintenir une relation
continue avec les clients une fois la vente terminée, ce qui peut rendre difficile la fourniture
de services de garantie personnalisés et adaptés aux besoins des clients.
.

## Scénarios du MVP

- Un utilisateur de la Dapp doit pouvoir se créer un compte avec son wallet (founisseur ou client).
- Un fournisseur doit pouvoir créer une garantie qui prendra la forme d'un NFT.
- Un client doit pouvoir récupérer cette garantie.
- Un client doit pouvoir transmettre cette garantie à un autre client.

- Les informations de la garantie NFT seront en partie stocker dans le smart contract et le reste sur IPFS via Pinata.


### Progression du MVP

```Livré```  🚀

IDE : ``` Remix, Visual Studio Code```  🖥️

Langage : ```Solidy, JS```

Framework : ```Truffle unbox React``` 

 Network : ```Ganache, Mumbai```

## Démarrage

Les instructions suivantes vous permettrons d'installer le projet :
- Afin de cloner le projet, entrez la ligne de commande suivante : 
```npm clone git@github.com:cyrilbtvl/rs5000-soutenance.git```
- Afin d'installer les dépendances de test et de solidity, dans le dossier racince du projet, effectuez la commande : 
```npm install ```
- Afin d'installer les dépendances react, dans le dossier client du projet, effectuez la commande : 
```npm install```
- Pour lancer le déploiement de la Dapps, modifiez le fichier truffle-config.js avec le network approprié
- Pour déployer hors ganache, pensez à renseigner dans un fichier .env les variables environnement suivante :
```MNEMONIC , ALCHEMY_POLYGON_API_KEY ...```
- Lancez ensuite la migration avec la commande : 
```truffle migrate --network 'votre network'```
- Effectuez ensuite la commande suivante dans le dossier client : 
```npm run start```
- Rendez-vous sur votre http://localhost:3000/ pour interagir avec votre contrat

## Pré requis

- Node.js installé
- Truffle installé
- Ganache installé

Afin d'installer toutes les dépendances (ganache, truffle ...), veuillez faire ce qui suit

## Installation

First ensure you are in an empty directory.

Run the `unbox` command using 1 of 2 ways.

```sh
# Install Truffle globally and run `truffle unbox`
$ npm install -g truffle
$ truffle unbox react
```

```sh
# Alternatively, run `truffle unbox` via npx
$ npx truffle unbox react
```

Start the react dev server.

```sh
$ cd client
$ npm start
```


## Tests

To run the project tests suite, do the following

```sh
#Lancer ganache : 
ganache
```

```sh
#Lancer les migrations
truffle migrate
```
```sh
#Lancer les test
truffle test
```

- 25 test passing / 25 (8s)


## Couverture de code

Via hardhat-truffle5, 
```sh
#lancement de la couverture de test : 

cd test 
rm -rf coverage/
npx hardhat coverage
```

```
----------------------------|----------|----------|----------|----------|----------------|
File                        |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------------------------|----------|----------|----------|----------|----------------|
 contracts/                 |    80.72 |    74.07 |     87.5 |    79.44 |                |
  GuarantifyNFTContract.sol |    80.72 |    74.07 |     87.5 |    79.44 |... 288,376,447 |
----------------------------|----------|----------|----------|----------|----------------|
All files                   |    80.72 |    74.07 |     87.5 |    79.44 |                |
----------------------------|----------|----------|----------|----------|----------------|

```
## Contributeurs

- [Cyril BOUTTEVILLE](https://github.com/cyrilbtvl/rs5000-soutenance)


## License

[MIT](https://choosealicense.com/licenses/mit/)
