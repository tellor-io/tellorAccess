require("@nomiclabs/hardhat-truffle5");
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("solidity-coverage");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

//TRY npx hardhat run deploy/001_deploy.js --net bsc_testnet --network bsc_testnet
//Run this commands to deploy tellor playground:
//npx hardhat deploy  --net rinkeby --network rinkeby
//npx hardhat deploy  --net mainnet --network mainnet
//npx hardhat deploy  --net bsc_testnet --network bsc_testnet

task("deploy", "Deploy and verify the contracts")
  .addParam("net", "network to deploy in")
  .setAction(async taskArgs => {


    console.log("deploy telloraccess")
    var net = taskArgs.network

    await run("compile");
    const tellorAccess = await ethers.getContractFactory("TellorAccess");
    //console.log(tellor)
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