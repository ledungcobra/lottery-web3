pragma solidity >=0.4.17;

contract Lottery {
    
    address public manager;
    address[]  public players;

    event LogNewPlayer(address player);
    event LogPlayerWin(address player, uint amount);
    event ResetLottery();
    event BalanceChange(uint value);

    constructor() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value >= 0.01 ether, "You must send ether along with participate the game");
        players.push(msg.sender);
        emit LogNewPlayer(msg.sender);
        emit BalanceChange(getBalance());
    }

    function random() public view returns (uint) {
        return uint(keccak256(abi.encodePacked(toString(block.timestamp))));
    }

    function getBalance() public view returns (uint) {
        return uint(address(this).balance);
    }

    modifier isOwner() {
        require(msg.sender == manager, "You are not the owner");
        _;
    }

    function pickAWinner() public payable isOwner {
        uint balance = getBalance();
        uint randomIndex = random() % players.length;
        players[randomIndex].transfer(balance);
        players = new address[](0);
        emit LogPlayerWin(players[randomIndex],balance);
        emit ResetLottery();
        emit BalanceChange(0);
    }

    function getPlayers () public view returns (address[] memory){
        return players;
    }

    function toString(uint256 value) internal pure returns (string memory) {

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

}