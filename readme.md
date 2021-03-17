<p align="center">
  <a href='https://www.tellor.io/'>
    <img src= 'https://raw.githubusercontent.com/tellor-io/TellorBrandMaterials/master/LightBkrnd_RGB.png' width="250" height="200" alt='tellor.io' />
  </a>
</p>

<p align="center">
  <a href='https://twitter.com/WeAreTellor'>
    <img src= 'https://img.shields.io/twitter/url/http/shields.io.svg?style=social' alt='Twitter WeAreTellor' />
  </a> 
</p>


# TL:DR
Tellor Access allows the fellowship (a specified group chosen by the community) to provide numerical data to any chain. 



## Why use Tellor Access
Use this repository if your project needs: 

1. Faster Data Availability 
2. Higher security than a centralized party
3. Allow your community to vote in or designate data providers transparently

## How to use

### Reading values

The first setup is to inherit the TellorAccess contract, passing the TellorAccess address as a constructor argument: 

Here's an example
```solidity 
contract BtcPriceContract is TellorAccess {

  //This Contract now have access to all functions on TellorAccess

  uint256 btcPrice;
  uint256 btcRequetId = 2;

  constructor(address payable _tellorAddress) TellorAcess(_tellorAddress) public {}

  ...
}
```

### Submitting values to tellorAccess

1. Allow the list of reporters to provide data by running the function addReporter for each one of them.

```solidity
    /**
     * @dev Add an account to the reporter role. Restricted to admins.
     * @param account is the address of the reporter to give permissions to submit data
     */
    function addReporter(address account) public virtual onlyAdmin;

```

2. Have reporters submit data by running the function submitValue 


```solidity
    /**
    * @dev A mock function to submit a value to be read withoun miners needed
    * @param _requestId The tellorId to associate the value to
    * @param _value the value for the requestId
    */
    function submitValue(uint256 _requestId,uint256 _value)  external;
```

