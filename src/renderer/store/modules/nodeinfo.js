import {Node} from '@/database'
import fs from 'fs'
import {compileStr,uncompileStr} from '@/utils/util.js'
const nodeinfo = {
    state: {
        
    },
    actions: {
        addNode({ commit },nodeInfo){
            return new Promise((resolve, reject) => {
                //密码加密
                nodeInfo.password = compileStr(nodeInfo.password)
                Node.insert(nodeInfo,(err,data)=>{
                    if(err) reject(err)
                    resolve()
                })
              })
        },
        delNode({ commit },nodeid){
            return new Promise((resolve, reject) => {
                Node.remove({_id:nodeid},{},(err,numRemoved)=>{
                    if(err) reject(err)
                    resolve()
                })
              })
        },
        updateNode({ commit },nodeInfo){
            return new Promise((resolve, reject) => {
                //密码加密
                nodeInfo.password = compileStr(nodeInfo.password)
                Node.update({_id:nodeInfo._id},nodeInfo,{},(err,numReplaced)=>{
                    if(err) reject(err)
                    resolve()
                })
              })
        },
        getNodeById({ commit },nodeid){
            return new Promise((resolve, reject) => {
                Node.findOne({_id:nodeid},{},(err,data)=>{
                    if(err) reject(err)
                    data.password = uncompileStr(data.password) 
                    resolve(data)
                })
              })
        },
        getNodeList({ commit }){
            return new Promise((resolve, reject) => {
                Node.find({},(err,data)=>{
                    if(err) reject(err)
                    resolve(data)
                })
              })
        },
        readOldConfig(context,filePath){
            return new Promise((resolve,reject)=>{                
                let arrKey = []
                let keyvalue = {}  //存储键值对
                try {
                    let content = fs.readFileSync(filePath,'UTF-8')
                    let regexjing = /\s*(#+)/  //去除注释行的正则
                    let regexkong = /\s*=\s*/  //去除=号前后的空格的正则
                    let regexminus = /\s*-\s*/  //去除=号前后的空格的正则
                    let arr_case = null
                    let regexline = /.+/g  //匹配换行符以外的所有字符的正则
                    while(arr_case=regexline.exec(content)) {  //过滤掉空行
                        if (!regexjing.test(arr_case)) {  //去除注释行
                            let c = arr_case.toString()
                            keyvalue[c.substr(0,c.indexOf('=')).trim()] = c.substr(c.indexOf('=')+1).trim()  //存储键值对
                            arrKey.push(c.substr(0,c.indexOf('-')).trim())
                        }
                    }
                    let setKey = Array.from(new Set(arrKey))
                    setKey.forEach(val => {
                        Node.insert({
                            name: val,
                            group:'导入',
                            ip: keyvalue[val+'-host'],
                            port: keyvalue[val+'-port'],
                            user: keyvalue[val+'-user'],
                            password: compileStr(new Buffer(keyvalue[val+'-pass'], 'base64').toString()),
                            apppath: keyvalue[val+'-apppath'],
                            startpath: keyvalue[val+'-statepath'],
                            stoppath: keyvalue[val+'-stoppath'],
                            clearpath:keyvalue[val+'-clearpath'],
                            logpath:keyvalue[val+'-logpath']
                        })
                    })
                    resolve()
                } catch (e) {
                    //e.message  //这里根据自己的需求返回
                    console.log(e)
                    return reject('读取文件失败')
                }
            })
        }
    }
}
export default nodeinfo
