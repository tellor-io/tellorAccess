const Tellor = artifacts.require("./TellorAccess.sol"); // globally injected artifacts helper
const helper = require("./helpers/test_helpers");

contract("TellorAccess Tests", function(accounts) {
  let tellor;

  beforeEach("Setup contract for each test", async function() {
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await Tellor.new();
  });

  it("Owner should be able to add data", async function() {
    //console.log(accounts[0],accounts[1])
    await helper.expectThrow(
        master.submitValue(1,200, { from: accounts[1] })
    );
    master.submitValue(1,200, { from: accounts[0] })
 });
  it("Reporter should be able to add data", async function() {
      //console.log(accounts[1],accounts[2])
      await master.addReporter(accounts[1])
      await helper.expectThrow(
          master.submitValue(1,200, { from: accounts[2] })
      );
      master.submitValue(1,200, { from: accounts[1] })
   });



 
    it("Anyone can retrieve data", async function() {
      await master.addReporter(accounts[1])
      await helper.expectThrow(
          master.submitValue(1,200, { from: accounts[2] })
      );
      await master.submitValue(1,200, { from: accounts[1] })
      time = await master.getTimestampbyRequestIDandIndex(1,0);
      value = await master.retrieveData(1,time, { from: accounts[2] });
      assert(value == 200, "value not correct or retreived.")     
    });


//////ExpectTrow not working
    it("Only admin should be able to add a reporter", async function() {
      //the test fails because this fx is restricted to admin, not sure why expectThrow is not working on it
      await helper.expectThrow(
        master.addReporter(accounts[1], { from: accounts[2] } )
      )
    });



    })