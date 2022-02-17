﻿
const got = require('got');
const {
    addEnvs, sendNotify, allEnvs
} = require('./quantum');

let ttl = process.env.ttl;
let mobile = process.env.ttlmobile;
let ttlpassword = process.env.ttlpassword;
let user_id = process.env.user_id;
let CommunicationType = process.env.CommunicationType;


const api = got.extend({
    retry: { limit: 0 },
});

!(async () => {
    if (mobile && ttlpassword) {
        const body = await api({
            url: 'https://www.ttljf.com/ttl_site/user.do',
            method: 'post',
            body: `username=${mobile}&password=${ttlpassword}&device_brand=apple&device_model=iPhone11,8&device_uuid=&device_version=13.5&mthd=login&platform=ios&sign=`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Connection": "keep-alive",
                "Accept": "*/*",
                "Accept-Language": "en-CN;q=1, zh-Hans-CN;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "User-Agent": "otole/1.4.8 (iPhone; iOS 13.5; Scale/2.00)",
                "Host": "www.ttljf.com"
            },
        }).json();
        console.log(JSON.stringify(body))
        if (body.code == '0000') {
            console.log(body.user.loginToken);
            var r = {
                userId: body.user.userId, mobile: mobile, password: ttlpassword
            };

            var c = {
                Name: "ttlhd",
                Enable: true,
                Value: body.user.loginToken,
                UserRemark: JSON.stringify(r),
                UserId: user_id,
                EnvType: 3,
                CommunicationType: CommunicationType
            }
            var data1 = await allEnvs(mobile, 3);
            data1 = data1.filter((n) => n.Name == "ttlhd");
            if (data1.length > 0) {
                c.Id = data1[0].Id;
                c.Weight = data1[0].Weight;
                c.QLPanelEnvs = data1[0].QLPanelEnvs;
                c.Remark = data1[0].Remark;
            }
            var data = await addEnvs([c]);
            console.log("开始提交ttl token到量子数据库");
            console.log("提交结果：" + JSON.stringify(data));
            if (data.Code != 200) {
                console.log("addEnvs Error ：" + JSON.stringify(data));
                await sendNotify(`提交失败，发生异常，已通知管理员处理啦！`)
                await sendNotify(`太太乐提交token 发生异常，Token：${body.user.loginToken}`, true)
            } else {
                sendNotify(`登录成功\n会员等级：${body.user.memberLevel}\n可用积分：${body.user.integral}`)
            }
        } else {
            sendNotify("登录失败！");
        }
    } else if (mobile) {
        sendNotify("请回复太太乐密码：");
    } else if (ttl) {
        sendNotify("请回复太太乐账号：");
    }
})();
