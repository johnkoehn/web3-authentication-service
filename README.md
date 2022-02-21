
### Goal

In web3, we have two types of applications.

*Pure Web3 Apps* - A "pure" web3 app is one that only interacts with smart contracts and various blockchains, thus no backend servers are required. Good examples of this are defi apps (aave, uniswap, etc.).
| Pros | Cons |
|--|--|
| Truly decentralized | Transaction costs |
| Users are in full control | Slow to finalize an action|
| Immune to censorship | |

Pure web3 apps are truly awesome, however building a game that purely runs on a blockchain or social media app is not feasible. This is where a "semi" web3 app comes in. This is a blend of using traditional backend technologies with blockchain.

*Semi Web3 Apps* - In a "semi" web3 app, we utilize traditional backend technologies with blockchains. Let's take a card trading game for example. When two players are playing each other online, a server would manage the game state. However, the cards that the player owned would live on the blockchain and be associated with each player's public key.

Now, what often annoys me in the case of semi web 3 apps, is sometimes I still have to create an account with an email/password. This is a big no no in my eyes. My identity is my private/public keypair and we should be able to do authorization and authentication using that. The goal  of this repo is to show a way of doing authorization and authentication using a crypto wallet.

### Design

A different solution is to do authentication in a unique web 3 way. Have an OAuth like server that generates a JWT for the user. That JWT will expire in x amount of time and is signed by a private key that only the authentication server knows.

Once the JWT is created, the user must sign that JWT with their private key. This would happen with the user's wallet. Using that signed JWT, they would make API requests using the signed JWT in the Authorization header. In addition, they would pass two more headers, Public-Key and Base-Token, where Public-Key contains the public key and Base-Token contains the "unsigned" or default JWT. The APIs will validate the JWT was signed by the authentication server, that it was signed with the users public key, and check in the decoded JWT that the "sub" field (the subject) equals the public key passed in the Public-Key header. Now we have authentication/authorization with no email and password. Bless be.

See image below

<img  src="./images/Basics.png">