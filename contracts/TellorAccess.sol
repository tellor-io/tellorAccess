// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./SafeMath.sol";

contract TellorAccess is AccessControl {

    using SafeMath for uint256;
    
    /*Storage*/
    mapping(uint256 => mapping(uint256 => uint256)) public values; //requestId -> timestamp -> value
    mapping(uint256 => uint256[]) public timestamps; //timestamp to array of values
    bytes32 public constant REPORTER_ROLE = keccak256("reporter");//used in access contract, the role of a given party

    /*Events*/
    event NewValue(uint256 _requestId, uint256 _time, uint256 _value);
    
    /*Functions*/
    /**
     * @dev Constructor which sets the sender as the default admin and the base roles
    */
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
     * @dev Add an address to the admin role. Restricted to admins.
     * @param _admin_address is the admin address to add 
    */
    function addAdmin(address _admin_address) external virtual onlyAdmin {
        grantRole(DEFAULT_ADMIN_ROLE, _admin_address);
    }

    /**
     * @dev Add an account to the reporter role. Restricted to admins.
     * @param _reporter_address is the address of the reporter to give permissions to submit data
    */
    function addReporter(address _reporter_address) external virtual onlyAdmin  {
        grantRole(REPORTER_ROLE, _reporter_address);
    }

    /**
     * @dev Allows the user to get the latest value for the requestId specified
     * @param _requestId is the requestId to look up the value for
     * @return ifRetrieve bool true if it is able to retreive a value, the value, and the value's timestamp
     * @return value the value retrieved
     * @return timestampRetrieved the value's timestamp
    */
    function getCurrentValue(uint256 _requestId) external view returns (bool, uint256, uint256) {
        uint256 _count = getNewValueCountbyRequestId(_requestId);
        uint256 _time =
            getTimestampbyRequestIDandIndex(_requestId, _count - 1);
        uint256 _value = retrieveData(_requestId, _time);
        if (_value > 0) return (true, _value, _time);
        return (false, 0, _time);
    }


    /**
     * @dev Allows the user to get the first value for the requestId before the specified timestamp
     * @param _requestId is the requestId to look up the value for
     * @param _timestamp before which to search for first verified value
     * @return ifRetrieve bool true if it is able to retreive a value, the value, and the value's timestamp
     * @return value the value retrieved
     * @return timestampRetrieved the value's timestamp
    */
    function getDataBefore(uint256 _requestId, uint256 _timestamp) external view returns (bool, uint256, uint256) {
        (bool _found, uint256 _index) =
            _getIndexForDataBefore(_requestId, _timestamp);
        if (!_found) return (false, 0, 0);
        uint256 _time =
            getTimestampbyRequestIDandIndex(_requestId, _index);
        uint256 _value = retrieveData(_requestId, _time);
        //If value is diputed it'll return zero
        if (_value > 0) return (true, _value, _time);
        return (false, 0, 0);
    }

    /** 
     * @dev Remove an account from the reporter role. Restricted to admins.
     * @param _reporter_address is the address of the reporter to remove permissions to submit data
    */
    function removeReporter(address _reporter_address) external virtual onlyAdmin  {
        revokeRole(REPORTER_ROLE, _reporter_address);
    }

    /** 
     * @dev Remove oneself from the admin role.
    */
    function renounceAdmin() external virtual {
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Function for reporters to submit a value
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
     * @param _index is the value index to look up
     * @return uint timestamp
    */
    function getTimestampbyRequestIDandIndex(uint256 _requestId, uint256 _index) public view returns(uint256) {
        uint len = timestamps[_requestId].length;
        if(len == 0 || len <= _index) return 0; 
        return timestamps[_requestId][_index];
    }

    /**
     * @dev Return `true` if the account belongs to the admin role.
     * @param _admin_address is the admin address to check if they have an admin role
     * @return true if the address has an admin role
     */
    function isAdmin(address _admin_address) public virtual view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _admin_address);
    }

    /**
     * @dev Return `true` if the account belongs to the reporter role.
     * @param _reporter_address is the address to check if they have a reporter role
     */
    function isReporter(address _reporter_address) public virtual view returns (bool)  {
        return hasRole(REPORTER_ROLE, _reporter_address);
    }

    /**
     * @dev Retrieve value from oracle based on requestId/timestamp
     * @param _requestId being requested
     * @param _timestamp to retrieve data/value from
     * @return uint value for requestId/timestamp submitted
    */
    function retrieveData(uint256 _requestId, uint256 _timestamp) public view returns(uint256){
        return values[_requestId][_timestamp];
    }

    /**
     * @dev Allows the user to get the index for the requestId for the specified timestamp
     * @param _requestId is the requestId to look up the idex based on the _timestamp provided
     * @param _timestamp before which to search for the index
     * @return found true for index found
     * @return index of the timestamp
     */
    function _getIndexForDataBefore(uint256 _requestId, uint256 _timestamp) internal view returns (bool, uint256) {
        uint256 _count = getNewValueCountbyRequestId(_requestId);
        if (_count > 0) {
            uint256 middle;
            uint256 start = 0;
            uint256 end = _count - 1;
            uint256 _time;
            //Checking Boundaries to short-circuit the algorithm
            _time = getTimestampbyRequestIDandIndex(_requestId, start);
            if (_time >= _timestamp) return (false, 0);
            _time = getTimestampbyRequestIDandIndex(_requestId, end);
            if (_time < _timestamp) return (true, end);
            //Since the value is within our boundaries, do a binary search
            while (true) {
                middle = (end - start) / 2 + 1 + start;
                _time = getTimestampbyRequestIDandIndex(
                    _requestId,
                    middle
                );
                if (_time < _timestamp) {
                    //get next value
                    uint256 _nextTime =
                        getTimestampbyRequestIDandIndex(
                            _requestId,
                            middle + 1
                        );
                    if (_nextTime >= _timestamp) {
                        //_time is correct
                        return (true, middle);
                    } else {
                        //look from middle + 1(next value) to end
                        start = middle + 1;
                    }
                } else {
                    uint256 _prevTime =
                        getTimestampbyRequestIDandIndex(
                            _requestId,
                            middle - 1
                        );
                    if (_prevTime < _timestamp) {
                        // _prevtime is correct
                        return (true, middle - 1);
                    } else {
                        //look from start to middle -1(prev value)
                        end = middle - 1;
                    }
                }
            }
        }
        return (false, 0);
    }

}