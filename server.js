const express = require('express')
const app = express()
const cors = require('cors')
// const server = require('http').createServer(app, {
//     cors: {
//         origin: "http://localhost:3000",
//     }
// })
const bodyParser = require('body-parser')

require('dotenv').config()

const port = process.env.PORT || 5000

app.listen(port, () => 
    console.log(`Listening on port ${port}`)
)

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

let whitelistAddresses = [
    "0xFCb31b17eaB846e337138eA8964B76A5f02E71e0",
    "0x54944829363e1dEE06db70D338Dc25B23b6E5C1e",
    "0xC9f11C34beB51791A50E77425BDC5A55d55567C4",
    "0xa456EceD4b13452bcebFA754b14cF8Bd1904b3c5",
    "0x78Bc8ddeDB3cC89C439447ac540eD910E1AE7B85",
]

const leafNodes = whitelistAddresses.map(addr => keccak256(addr), {})
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
const rootHash = merkleTree.getRoot().toString('hex')

console.log(rootHash);

app.post('/api/getProof', (req, res) => {

    const claimingAddress = keccak256(req.body.address)
    const hexProof = merkleTree.getHexProof(claimingAddress)
    const isWhitelistMember = merkleTree.verify(hexProof, claimingAddress, rootHash)

    console.log(hexProof)

    res.set('Access-Control-Allow-Origin', '*')
    res.send({
        hexProof,
        isWhitelistMember
    })
})