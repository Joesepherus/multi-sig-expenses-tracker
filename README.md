What's this dApp about?
It's a Multi Signature Wallet for Sharing Expenses Among A Group that's traveling. This way it's easier to keep track of who paid what and how much it cost. No more need to use excel or other apps.
In this app you first have the owner who creates the contract and can then add proposals to:
add other owners, set the required owners for a proposal to be approved which is default 1, set deposit minimum, remove owners and lastly withdraw the funds to all owners that have deposited atleast minimum deposit.

Technology Used:
Solidity
React
Foundry

How To Start This App:
1. go into contract/ and npm i
2. go into app/ and npm i
3. start anvil at contract/
4. npm start at app/
5. forge create MultiSig --constructor-args "$public_key"  --rpc-url http://127.0.0.1:8545 --interactive
6. interact with the react app using metamask

The Initial Plan Broken Into Steps

What I want it to do Smart Contract Wise:

✅ Implement Multi Signature Wallet

✅ Make it possible to Receive Funds to the Wallet

✅ Define number of contributors, lets say 5

✅ Make it so that 4 people have to agree on a purchase or have it be variable, so that higher amounts need more people to agree

✅ Make it so that at the end rest of the money is divided equally and sent back to the contributors

✅ Add possibility to blacklist a wallet or disable it, in case the users private key was lost

✅ Add possibility to add a new contributor, but only if max number of contributors is not reached yet

✅ Force them to contribute equally, so when more funds are needed, they sign how much each has to add more and if some dont add more then at withdraw they wont get anything

What I need to do on the Frontend:

✅ See funds of the wallet

✅ Show contributors

✅ Add contributor and see signatures of others

✅ Remove contributor and see signatures of others

✅ Add funds

✅ Sign to withdraw money equally and see signatures of others

✅ Sign on the amount each contributor has to add

✅ Add some kind of confirmation on the actions so the app responsive and not having to refresh it
