const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const { interface, bytecode } = require("../compile");

const web3 = new Web3(ganache.provider());
let accounts;
let lottery;
beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [] })
        .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery contract", () => {
    it("deploy contract ", async () => {
        assert.ok(lottery.options.address);
    });

    it("Allow one account to enter ", async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("0.02", "ether"),
        });
        const players = await lottery.methods.getPlayers().call();
        assert.equal(accounts[0], players[0]);
        assert.equal(players.length, 1);
    });

    it("Allows multiple accounts to enter", async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("0.02", "ether"),
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("0.02", "ether"),
        });
        const players = await lottery.methods.getPlayers().call();
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(players.length, 2);
    });

    it("Require a minimun amount of ehter to enter", async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0,
            });
            assert(false);
        } catch (ex) {
            assert(ex);
        }
    });

    it("Only manager can call pick winner", async () => {
        try {
            await lottery.methods.pickAWinner().send({
                from: accounts[1],
            });
            assert(false);
        } catch (e) {
            assert(e);
        }
    });

    it("sends money to the winner and resets the players arrays", async ()=>{
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("2", "ether"),
      })
      const initialBalance = await web3.eth.getBalance(accounts[0]);
      await lottery.methods.pickAWinner().send({from: accounts[0]});
      const finalBalance = await web3.eth.getBalance(accounts[0]);
      const difference = finalBalance - initialBalance;
      assert(difference > web3.utils.toWei("1.8", "ether"));
    })
});
