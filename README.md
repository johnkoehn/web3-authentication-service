### Goal ###
In web3, we have two types of applications.

Pure Web3 Apps - These applications only interact with smart contracts. They are truly decentralized and anyone can build apps on top of the smart contract endpoints. I consider this the ideal web3 application. However, not all applications can be purely web3. For example, it is not realistic to create a pure web3 social media application. The costs to do anything useful would be to high.

Semi Web3 Apps - Parts of the appliation run on a blockchain and utilize smart contracts. However parts of the application require a central authority. A prime example of this is games being built that utilize web3 but still have a central authority/server.

What often annoys me in the case of semi web 3 apps, is I still have to create an account with my email address and come up with some stupid passowrd. HUH? Really???

A different solution is to do authentication in a unqiue web 3 way. Have an OAuth like server that generates a JWT for the user. That JWT will expire in x amount of time and is signed by a private key that only the authentication server knows.

Once the JWT is created, the user must sign that JWT with their private key. This would happen with the user's wallet. Using that signed JWT, they would make API requests using the signed JWT in the Authorization header. In addition, they would pass two more headers, Public-Key and Base-Token, where Public-Key contains the public key and Base-Token contains the "unsigned" or default JWT. The APIs will validate the JWT was signed by the authentication server, that it was signed with the users public key, and check in the decoded JWT that the "sub" field (the subject) equals the public key passed in the Public-Key header. Now we have authentication/authorization with no email and password. Bless be.

See image below
<img src="./images/Basics.png">