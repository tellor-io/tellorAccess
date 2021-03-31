// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";


library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }


    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

contract TellorAccess is AccessControl {

    using SafeMath for uint256;
    
    event NewValue(uint256 _requestId, uint256 _time, uint256 _value);
    
    mapping(uint256 => mapping(uint256 => uint256)) public values; //requestId -> timestamp -> value
//    mapping(uint256 => mapping(uint256 => bool)) public isDisputed; //requestId -> timestamp -> value
    mapping(uint256 => uint256[]) public timestamps;
    
    bytes32 public constant REPORTER_ROLE = keccak256("reporter");



    constructor () {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(REPORTER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    /**
     * @dev Modifier to restrict only to the admin role.
     */
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Restricted to admins.");
        _;
    }

    /**
     * @dev Restricted to members of the reporter role.
     */
    modifier onlyReporter() {
        require(isReporter(msg.sender), "Restricted to reporters.");
        _;
    }

    /**
    @dev Add an account to the admin role. Restricted to admins.
    */
    function addAdmin(address account) public virtual onlyAdmin {
        grantRole(DEFAULT_ADMIN_ROLE, account);
    }

    /**
     * @dev Add an account to the reporter role. Restricted to admins.
     * @param account is the address of the reporter to give permissions to submit data
     */
    function addReporter(address account) public virtual onlyAdmin  {
        grantRole(REPORTER_ROLE, account);
    }

    /** 
     * @dev Remove an account from the reporter role. Restricted to admins.
     */
    function removeReporter(address account) public virtual onlyAdmin  {
        revokeRole(REPORTER_ROLE, account);
    }

    /** 
     * @dev Remove oneself from the admin role.
     */
    function renounceAdmin() public virtual {
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Return `true` if the account belongs to the admin role.
     */
    function isAdmin(address account) public virtual view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /**
     * @dev Return `true` if the account belongs to the reporter role.
     */
    function isReporter(address account) public virtual view returns (bool)  {
        return hasRole(REPORTER_ROLE, account);
    }

    /**
    * @dev A mock function to submit a value to be read withoun miners needed
    * @param _requestId The tellorId to associate the value to
    * @param _value the value for the requestId
    */
    function submitValue(uint256 _requestId,uint256 _value)  external {
        require(isReporter(msg.sender) || isAdmin(msg.sender), "Sender must be an Admin or Reporter to submitValue");
        values[_requestId][block.timestamp] = _value;
        timestamps[_requestId].push(block.timestamp);
        emit NewValue(_requestId, block.timestamp, _value);
    }


     /**
    * @dev Retreive value from oracle based on requestId/timestamp
    * @param _requestId being requested
    * @param _timestamp to retreive data/value from
    * @return uint value for requestId/timestamp submitted
    */
    function retrieveData(uint256 _requestId, uint256 _timestamp) public view returns(uint256){
        return values[_requestId][_timestamp];
    }


    /**
    * @dev Counts the number of values that have been submited for the request
    * @param _requestId the requestId to look up
    * @return uint count of the number of values received for the requestId
    */
    function getNewValueCountbyRequestId(uint256 _requestId) public view returns(uint) {
        return timestamps[_requestId].length;
    }

    /**
    * @dev Gets the timestamp for the value based on their index
    * @param _requestId is the requestId to look up
    * @param index is the value index to look up
    * @return uint timestamp
    */
    function getTimestampbyRequestIDandIndex(uint256 _requestId, uint256 index) public view returns(uint256) {
        uint len = timestamps[_requestId].length;
        if(len == 0 || len <= index) return 0; 
        return timestamps[_requestId][index];
    }

}