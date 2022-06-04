const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
    "reveal lecture retreat chalk gift cruel elevator hill horn bubble scout ready",
    "https://rinkeby.infura.io/v3/6d1d08d271da433f97c78bc9c3c34ce3"
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log("Attempting to deploy from account ", accounts[0]);
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [] })
        .send({ gas: "1000000", from: accounts[0] });

    console.log("Contract deploy to ", result.options.address);
    console.log(interface);
    provider.engine.stop();
};

deploy();
