


const secret_key = "123";
const OkdbServer = require("okdb-server");

// create and start server on 7899 port by default
const options = {
    cors: {
        enabled: true
    }
}
const okdb = new OkdbServer(options);
//console.log(okdb);
// sample authentication, e.g. should validate your own auth token
//const names = ["Lucas","Charlotte", "Oliver", "Emma", "Daniel", "Julia", "Alexander", "Thomas", "Maria", "Richard"];
//const names = ["민준", "서준", "예준", "도윤", "시우", "주원", "하준", "지호", "지후", "준서", "준우", "현우", "도현", "지훈", "건우", "우진", "선우", "서진", "민재", "현준", "연우", "유준", "정우", "승우", "승현", "시윤", "준혁", "은우", "지환", "승민", "지우", "유찬", "윤우", "민성", "준영", "시후", "진우", "지원", "수현", "재윤", "시현", "동현", "수호", "태윤", "민규", "재원", "한결", "민우", "재민", "은찬", "윤호", "시원", "이준", "민찬", "지안", "시온", "성민", "준호", "승준", "성현", "이안", "현서", "재현", "하율", "지한", "우빈", "태민", "지성", "예성", "민호", "태현", "지율", "민혁", "서우", "성준", "은호", "규민", "정민", "준", "지민", "윤성", "율", "윤재", "하람", "하진", "민석", "준수", "은성", "태양", "예찬", "준희", "도훈", "하민", "준성", "건", "지완", "현수", "승원", "강민", "정현", "이름", "랭킹", "이름수", "서연", "서윤", "지우", "서현", "민서", "하은", "하윤", "윤서", "지유", "지민", "채원", "지윤", "은서", "수아", "다은", "예은", "지아", "수빈", "소율", "예린", "예원", "지원", "소윤", "지안", "하린", "시은", "유진", "채은", "윤아", "유나", "가은", "서영", "민지", "예진", "서아", "수민", "수연", "연우", "예나", "예서", "주아", "시연", "연서", "하율", "다인", "다연", "시아", "아인", "현서", "서은", "유주", "아린", "서우", "하연", "서율", "서진", "채윤", "유빈", "지율", "나윤", "수현", "예지", "다현", "소은", "나은", "나연", "지은", "민주", "아윤", "사랑", "시현", "예빈", "윤지", "서하", "지현", "소연", "혜원", "지수", "은채", "주하", "채아", "승아", "다윤", "소민", "서희", "나현", "민아", "채린", "하영", "세아", "세은", "도연", "규리", "아영", "다온", "가윤", "지연", "예림", "태희", "민채", ];
let nameIdx = 0;
okdb.handlers().auth((getData) => {
    if(getData.token === "12345") {
        console.log("auth attempt for ", getData.token, " success");
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