 require("@nomiclabs/hardhat-truffle5");
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("solidity-coverage");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
 require("dotenv").config();


//Run this commands to deploy tellorAccess:
//npx hardhat deploy  --net rinkeby --network rinkeby
//npx hardhat deploy  --net mainnet --network mainnet
//npx hardhat deploy  --net bsc_testnet --network bsc_testnet
//npx hardhat deploy  --net polygon_testnet --network polygon_testnet
//npx hardhat deploy  --net polygon --network polygon
//npx hardhat deploy  --net arbitrum_testnet --network arbitrum_testnet

task("deploy", "Deploy and verify the contracts")
  .addParam("net", "network to deploy in")
  .setAction(async taskArgs => {


    console.log("deploy telloraccess")
    var net = taskArgs.network

    await run("compile");
    const tellorAccess = await ethers.getContractFactory("TellorAccess");
    let tellor = await tellorAccess.deploy();
    console.log("TellorAccess deployed to:", tellor.address);
    await tellor.deployed();

    if (net == "mainnet"){
        console.log("Tellor contract deployed to:", "https://etherscan.io/address/" + tellor.address);
        console.log("    transaction hash:", "https://etherscan.io/tx/" + tellor.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("Tellor contract deployed to:", "https://rinkeby.etherscan.io/address/" + tellor.address);
        console.log("    transaction hash:", "https://rinkeby.etherscan.io/tx/" + tellor.deployTransaction.hash);
    } else if (net == "bsc_testnet") {
        console.log("Tellor contract deployed to:", "https://testnet.bscscan.com/address/" + tellor.address);
        console.log("    transaction hash:", "https://testnet.bscscan.com/tx/" + tellor.deployTransaction.hash);
    } else if (net == "bsc") {
        console.log("Tellor contract deployed to:", "https://bscscan.com/address/" + tellor.address);
        console.log("    transaction hash:", "https://bscscan.com/tx/" + tellor.deployTransaction.hash);
   } else if (net == "polygon") {
        console.log("Tellor contract deployed to:", "https://explorer-mainnet.maticvigil.com/" + tellor.address);
        console.log("    transaction hash:", "https://explorer-mainnet.maticvigil.com/tx/" + tellor.deployTransaction.hash);
    } else if (net == "polygon_testnet") {
        console.log("Tellor contract deployed to:", "https://explorer-mumbai.maticvigil.com/" + tellor.address);
        console.log("    transaction hash:", "https://explorer-mumbai.maticvigil.com/tx/" + tellor.deployTransaction.hash);  
    } else if (net == "arbitrum_testnet"){
        console.log("tellor contract deployed to:","https://explorer.arbitrum.io/#/ "+ tellor.address)
        console.log("    transaction hash:", "https://explorer.arbitrum.io/#/tx/" + tellor.deployTransaction.hash);
    } else {
        console.log("Please add network explorer details")
    }

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for tx confirmation...');
    await tellor.deployTransaction.wait(3)

    console.log('submitting contract for verification...');

    await run("verify:verify", {
      address: tellor.address
    },
    )

    console.log("Contract verified")

  }); 


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
 solidity: {
    version: "0.7.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999
      }
    }
  },

  networks: {
    hardhat: {
      accounts: {
        mnemonic:
          "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish",
        count: 40,
      },
      allowUnlimitedContractSize: true,
    },
      rinkeby: {
        url: `${process.env.NODE_URL_RINKEBY}`,
        accounts: [process.env.TESTNET_PK],
        gas: 2000000 ,
        gasPrice: 190000000000
      },
      mainnet: {
        url: `${process.env.NODE_URL_MAINNET}`,
        accounts: [process.env.MAINNET_PK],
        gas: 2000000 ,
        gasPrice: 140000000000
      } ,
      bsc_testnet: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545",
        chainId: 97,
        gasPrice: 20000000000,
        accounts: [process.env.TESTNET_PK]
      },
      bsc: {
        url: "https://bsc-dataseed.binance.org/",
        chainId: 56,
        gasPrice: 20000000000,
        accounts: [process.env.MAINNET_PK]
      } ,
      polygon_testnet: {
        url: "https://rpc-mumbai.maticvigil.com/v1/" + process.env.MATIC_ACCESS_TOKEN,
        chainId: 80001,
        gasPrice: 20000000000,
        accounts: [process.env.TESTNET_PK]
      } ,
      polygon: {
        url: "https://rpc-mainnet.maticvigil.com/" + process.env.MATIC_ACCESS_TOKEN,
        chainId: 137,
        gasPrice: 20000000000,
        accounts: [process.env.MAINNET_PK]
      } ,
      
      
      arbitrum_testnet: {
        url: "https://kovan4.arbitrum.io/rpc",
        //chainId: 212984383488152,
        gasPrice: 0,
        accounts: [process.env.TESTNET_PK]
      } 


  },
  etherscan: {
      // Your API key for Etherscan
      // Obtain one at https://etherscan.io/
      //apiKey: process.env.ETHERSCAN
      apiKey: process.env.BSC_API
    },

    contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
    },

};
