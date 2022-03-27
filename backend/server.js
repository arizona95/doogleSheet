const secret_key = "123";
const OkdbServer = require("okdb-server");

// create and start server on 7899 port by default
const options = {
    cors: {
        enabled: true
    }
}
const okdb = new OkdbServer(options);
let nameIdx = 0;
okdb.handlers().auth((getData) => {
    if(getData.token === "12345") {
        console.log("auth attempt for ", getData.token, " success", okdb.handlers());
        const userId = 1 + nameIdx;
        nameIdx = nameIdx + 1;
        console.log("user_data", { id: userId, name: getData.userName});
        return { id: userId, name: getData.userName}
    }    
    console.log("auth attempt for ", token, " failed");
    return null;
});

okdb.handlers().save((dataType, documentId, version, data) => {
    //console.log("save handler ", dataType, documentId,  version, data );
    //JSON.stringify(data)
    // update your database
    console.log("data",data)
});

// Handling Ctrl-C (workaround for Windows)
if (process.platform === "win32") {
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", function () {
        process.emit("SIGINT");
    });
}
//graceful shutdown on Ctrl-C (all other platforms)
process.on("SIGINT", function () {    
    okdb.stop(()=> {
        console.log("server stopped");
        process.exit();
    });
});