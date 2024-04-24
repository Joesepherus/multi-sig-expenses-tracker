<h1>Multi Signature Expenses Tracker</h1>
<h2>What's this dApp about?</h2>
It's a Multi Signature Wallet for Sharing Expenses Among A Group that's traveling. This way it's easier to keep track of who paid what and how much it cost. No more need to use excel or other apps.
In this app you first have the owner who creates the contract and can then add proposals to:
add other owners, set the required owners for a proposal to be approved which is default 1, set deposit minimum, remove owners and lastly withdraw the funds to all owners that have deposited atleast minimum deposit.

<h2>Technology Used:</h2>
<ul>
<li>
Solidity
</li>
<li>
React
</li>
<li>
Foundry
</li>
</ul>

<h2>How To Start This App:</h2>
<ol>
<li>
go into contract/ and npm i
</li>
<li>
go into app/ and npm i
</li>
<li>
start anvil at contract/
</li>
<li>
npm start at app/
</li>
<li>
forge create MultiSig --constructor-args "$public_key"  --rpc-url http://127.0.0.1:8545 --interactive
</li>
<li>
interact with the react app using metamask on http://localhost:3000
</li>
</ol>

<h2>The Initial Plan Broken Into Steps</h2>

<h3>What I want it to do Smart Contract Wise:</h3>

<div>✅ Implement Multi Signature Wallet</div>
<div>✅ Make it possible to Receive Funds to the Wallet</div>
<div>✅ Make it so that 4 people have to agree on a purchase or have it be variable, so that higher amounts need more people to agree</div>
<div>✅ Make it so that at the end rest of the money is divided equally and sent back to the contributors</div>
<div>✅ Add possibility to blacklist a wallet or disable it, in case the users private key was lost</div>
<div>✅ Add possibility to add a new contributor, but only if max number of contributors is not reached yet</div>
<div>✅ Force them to contribute equally, so when more funds are needed, they sign how much each has to add more and if some dont add more then at withdraw they wont get anything</div>

<h3>What I need to do on the Frontend:</h3>
<div>✅ See funds of the wallet</div>
<div>✅ Show contributors</div>
<div>✅ Add contributor and see signatures of others</div>
<div>✅ Remove contributor and see signatures of others</div>
<div>✅ Add funds</div>
<div>✅ Sign to withdraw money equally and see signatures of others</div>
<div>✅ Sign on the amount each contributor has to add</div>
<div>✅ Add some kind of confirmation on the actions so the app responsive and not having to refresh it</div>
