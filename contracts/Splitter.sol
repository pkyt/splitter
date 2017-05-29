pragma solidity ^0.4.8;
import "./Owned.sol";
import "./ConvertLib.sol";

contract Splitter is Owned {
	address bob;
	address carol;
	bool killed = false;

	event LogSplitted(uint value);
	event LogKilled();

	modifier valid() {
		if (killed)
		if (msg.value == 0) {
				throw;
		}
		if (msg.value % 2 > 0) {
			throw;
		}
		_;
	}

	function Splitter(address _bob, address _carol) {
		bob = _bob;
		carol = _carol;
	}

	function() payable { }
	
	function getSplitterBalance() constant returns(uint) {
		return this.balance;
	}

	function payToBobAndCarol(uint splitValue) payable 
	returns (bool successful){
		if (!bob.send(splitValue)) {throw;}
		if (!carol.send(splitValue)) {throw;}
		return true;
	}

	function split() 
	payable
	fromOwner()
	valid()
	returns (bool successful) {
		uint splitValue = msg.value / 2;
		if (!this.send(msg.value)) {throw;}
		if (!this.payToBobAndCarol(splitValue)) {throw;}
		LogSplitted(msg.value);
		return true;
	}

	function kill()
	fromOwner()
	returns (bool successful) {
		killed = true;
		LogKilled();
		selfdestruct(msg.sender);
	}
}
