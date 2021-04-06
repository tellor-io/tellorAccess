const Tellor = artifacts.require("./TellorAccess.sol"); // globally injected artifacts helper
const helper = require("./helpers/test_helpers");

contract("TellorAccess Tests", function(accounts) {
  let tellor;

  beforeEach("Setup contract for each test", async function() {
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await Tellor.new();
  });

  //1, 3, onlyAdmin addAdmin
  it("Only admin should be able to add an Admin", async function() {
    adminRole = await master.isAdmin(accounts[3])
    assert(adminRole == false, "acct 3 is not supposed to be admin")
    await helper.expectThrow(
        master.addAdmin(accounts[3], { from: accounts[2] })
    );
    await master.addAdmin(accounts[3], { from: accounts[0] })
    adminRoleAfter = await master.isAdmin(accounts[3])
    assert(adminRoleAfter == true, "acct 3 is supposed to be an admin(true)")
  });

  //4. addReporter 
  it("Only admin should be able to add a Reporter", async function() {
    repRole = await master.isAdmin(accounts[3])
    assert(repRole == false, "acct 3 is not supposed to be a reporter")
    await helper.expectThrow(
        master.addReporter(accounts[3], { from: accounts[2] })
    );
    await master.addReporter(accounts[3], { from: accounts[0] })
    repRoleAfter = await master.isAdmin(accounts[3])
    assert(adminRoleAfter == true, "acct 3 is supposed to be a reporter(true)")
  });

  //5. getCurrentValue(uint256 requestId)
    it("getCurrentValue", async function() {
      await master.addReporter(accounts[1], { from: accounts[0] })
      await master.submitValue(1,200, { from: accounts[1] })
      await helper.advanceTime(84000)
      await master.submitValue(1,400, { from: accounts[0] })
      //bool ifRetrieve, uint256 value, uint256 timestampRetrieved
      let vars = await master.getCurrentValue(1)
      assert(vars[1]*1 == 400, "getCurrentValue is Not pulling current/latest value")
    });
/**
    //6.getDataBefore(uint256 requestId, uint256 timestamp)
    it("getDataBefore", async function() {
      await master.addReporter(accounts[1], { from: accounts[0] })
      var value = 200
      for (var i = 0; i < 10; i++) {
      await master.submitValue(1,value, { from: accounts[1] })
      await helper.advanceTime(84000)
      value ++ 
      }

    let lowValue = await oracle.getTimestampbyRequestIDandIndex(requestId, 0)
    let highValue = await oracle.getTimestampbyRequestIDandIndex(requestId,100)
      //bool ifRetrieve, uint256 value, uint256 timestampRetrieved
      let vars = await master.getCurrentValue(1)
      assert(vars[1]*1 == 400, "getCurrentValue is Not pulling current/latest value")
    });
*/
 
    //7. removeReporter(address reporter_address) 
    it("Only admin should be able to remove a Reporter", async function() {
      repRole = await master.isReporter(accounts[3])
      assert(repRole == false, "acct 3 is not supposed to be a reporter")
      await master.addReporter(accounts[3], { from: accounts[0] })
      repRole = await master.isReporter(accounts[3])
      assert(repRole == true, "acct 3 is not a reporter")
      await helper.expectThrow(
          master.removeReporter(accounts[3], { from: accounts[4] })
      );
      await master.removeReporter(accounts[3], { from: accounts[0] })
      repRole = await master.isReporter(accounts[3])
      assert(repRole == false, "acct 3 reporter role was not removed")
    });

  //8.renounceAdmin()
  it("Only an admin can renounce their admin rights", async function() {
    await master.addAdmin(accounts[3], { from: accounts[0] })
    let admin = await master.isAdmin(accounts[3])
    assert(admin == true, "acct 3 is already an admin")
    await master.renounceAdmin({ from: accounts[3] })
    admin = await master.isAdmin(accounts[3])
    assert(admin == false, "acct 3 is still admin")

  });

  //9.submitValue--require IsAdmin and IsReporter
  it("Owner should be able to add data", async function() {
    vars = await master.getCurrentValue(1)
    assert(vars[1]==0, "value is available for req1")
    await helper.expectThrow(
        master.submitValue(1,200, { from: accounts[1] })
    );
    await master.submitValue(1,200, { from: accounts[0] })
    vars = await master.getCurrentValue(1)
    assert(vars[1]==200, "value was successfully added to req1 by reporter")
  });

  it("Reporter should be able to add data", async function() {
      await master.addReporter(accounts[1], { from: accounts[0] })
      repRole = await master.isReporter(accounts[1])
      assert(repRole == true, "acct1 is not a reporter")
      vars = await master.getCurrentValue(1)
      assert(vars[1]==0, "value is available for req1")
      await master.submitValue(1,200, { from: accounts[1] })
      await helper.expectThrow(
          master.submitValue(1,300, { from: accounts[2] })
      );
      vars = await master.getCurrentValue(1)
      assert(vars[1]==200, "value is available for req1")

   });


  //10.getNewValueCountbyRequestId(uint256 requestId)
  it("getNewValueCountbyRequestId", async function() {
    await master.addReporter(accounts[1], { from: accounts[0] })
    var value = 200
    for (var i = 0; i <= 10; i++) {
    await master.submitValue(1,value, { from: accounts[1] })
    await helper.advanceTime(84000)
    value ++ 
    }
    count = await master.getNewValueCountbyRequestId(1)
    assert(count == 11 , "Count should be 11")
    //bool ifRetrieve, uint256 value, uint256 timestampRetrieved
    let vars = await master.getCurrentValue(1)
    assert(vars[1]*1 == 210, "getCurrentValue is Not pulling current/latest value")
  });

  //getTimestampbyRequestIDandIndex(uint256 requestId, uint256 index)
  it("getTimestampbyRequestIDandIndex", async function() {
    await master.addReporter(accounts[1], { from: accounts[0] })
    var value = 200
    for (var i = 0; i <= 10; i++) {
    await master.submitValue(1,value, { from: accounts[1] })
    await helper.advanceTime(84000)
    value ++ 
    }
    count = await master.getNewValueCountbyRequestId(1)
    assert(count == 11 , "Count should be 11")
    //bool ifRetrieve, uint256 value, uint256 timestampRetrieved
    let vars = await master.getCurrentValue(1)
    assert(vars[1]*1 == 210, "getCurrentValue is Not pulling current/latest value")
    time = await master.getTimestampbyRequestIDandIndex(1,10)
    assert(time*1==vars[2]*1, "timestamp is not correct")
  });

  //isAdmin(address admin_address)
  it("IsAdmin", async function() {
    await master.addAdmin(accounts[3], { from: accounts[0] })
    let admin = await master.isAdmin(accounts[3])
    assert(admin == true, "acct 3 is not admin")
  });


  //isReporter(address reporter_address)
  it("IsAdmin", async function() {
    await master.addReporter(accounts[3], { from: accounts[0] })
    let repRole = await master.isReporter(accounts[3])
    assert(repRole == true, "acct 3 is not reporter")
  });

  //retrieve data
  it("Anyone can retrieve data", async function() {
      await master.addReporter(accounts[1])
      await helper.expectThrow(
          master.submitValue(1,300, { from: accounts[2] })
      );
      await master.submitValue(1,200, { from: accounts[1] })
      time = await master.getTimestampbyRequestIDandIndex(1,0);
      value = await master.retrieveData(1,time, { from: accounts[2] });
      assert(value == 200, "value not correct or retreived.")     
  });



})