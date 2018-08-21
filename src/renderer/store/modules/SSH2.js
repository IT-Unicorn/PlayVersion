import { Notification } from 'element-ui'
import node_ssh from 'node-ssh'
import fs from 'fs'
import path from 'path'
import {uncompileStr} from '@/utils/util.js'
import {DirectoryFiles} from '@/utils/util.js'
import { remote } from 'electron'
import  mkdirp from 'mkdirp'
import iconv from 'iconv-lite'
//
async function GetFile(ssh,params){
    let uploadfiles = DirectoryFiles(params.localpath)
    let localCopyPath = path.join(remote.app.getPath('userData'), 'uploadBackup',params.data._id ,'local')
    let remoteCopyPath = path.join(remote.app.getPath('userData'), 'uploadBackup',params.data._id ,'remote')
    let CopyPathArr = []
    //循环上传文件列表
    for(let i = 0;i<uploadfiles.length;i++){
        let val = uploadfiles[i]
        //备份本地文件
        let localFilePath = path.join(localCopyPath,params.localpath.substr(params.localpath.lastIndexOf('\\') +1 ),val.replace(params.localpath,''))
        mkdirp.sync(path.dirname(localFilePath))
        fs.writeFileSync(localFilePath, fs.readFileSync(val))
        //备份服务器文件
        let remoteFilePath = path.join(remoteCopyPath,params.remotepath.substr(params.remotepath.lastIndexOf('/') +1 ),val.replace(params.localpath,''))
        mkdirp.sync(path.dirname(remoteFilePath))
        try {
            await ssh.getFile(remoteFilePath,val.replace(params.localpath,params.remotepath).replace(/\\/g,'/'))
            CopyPathArr.push({
                local : localFilePath,
                remote : remoteFilePath,
                type : 'UPDATE'
            })
        } catch (error) {
            CopyPathArr.push({
                local : localFilePath,
                remote : null,
                type : 'INSERT'
            })
        }  
    }
    return Promise.resolve(CopyPathArr)
}
//登陆入口
function Connect(node){
    return new Promise((resolve, reject) => {
        const ssh = new node_ssh()
        ssh.connect({
            host: node.ip,
            username: node.user,
            port: node.port,
            password:uncompileStr(node.password)
          }).then(()=>{
            //获取服务器字符集
            ssh.exec('echo $LANG',[],{}).then((lang)=>{
                resolve({
                    //服务器字符集
                    lang : lang,
                    //登陆实例
                    ssh  : ssh
                })
            })
          }).catch((err)=>{
            reject(err)
          })
    })  
}
function FindFile(ssh,filePath){
    return new Promise((resolve,reject)=>{
        ssh.exec('find '+filePath,[],{}).then(()=>{
            resolve()
        }).catch((err)=>{
            reject(err)
        })
    }) 
}
const ssh2 = {
    actions: {
        //上传文件
        SSH2PutDirectory({dispatch},props){
            return new Promise((resolve, reject) => {
                let localpath = props.localPath
                let remotepath = props.nodeinfo.apppath
                if(localpath.substr(localpath.lastIndexOf('\\') +1 ).toLowerCase() !== 
                    remotepath.substr(remotepath.lastIndexOf('/') + 1).toLowerCase()){
                        return reject('上传目录名与应用路径名不一致:' +
                        localpath.substr(localpath.lastIndexOf('\\') +1 ).toLowerCase() + '<>' +
                        remotepath.substr(remotepath.lastIndexOf('/') + 1).toLowerCase()
                    )  
                }
                //获取上传文件列表
                let uploadfiles = DirectoryFiles(localpath)
                if(uploadfiles.length == 0) {
                    return reject('上传目录为空,不存在文件')
                }
                //登陆
                Connect(props.nodeinfo).then(({ssh})=>{
                    let UpdateLog = "" //上传日志信息
                    //生成日志表
                    dispatch('UpdateLogInsert',{
                        nodeid: props.nodeinfo._id,
                        createDate  :new Date()
                    }).then((data)=>{
                        UpdateLog = data
                        //获取服务器端文件
                        return GetFile(ssh,{localpath : localpath,remotepath:remotepath , data : UpdateLog})
                    }).then((CopyPathArr)=>{
                        UpdateLog.files = CopyPathArr
                        //回写日志表
                        return dispatch('UpdateLogUpdate',UpdateLog)
                    }).then(()=>{
                        return ssh.putDirectory(localpath, remotepath,{recursive: true,concurrency: 10})
                    }).then(()=>{
                        ssh.dispose()
                        resolve()
                    }).catch((err)=>{
                        ssh.dispose()
                        UpdateLog && dispatch('UpdateLogDelete',UpdateLog._id)
                        reject('上传文件失败:'+err)
                    })
                }).catch((err)=>{
                    reject('登陆失败:'+err)
                })
            })  
        },
        //执行指定路径文件
        SSH2ExecPath({dispatch},props){
            return new Promise((resolve, reject) => {
                Connect(props.nodeinfo).then(({ssh})=>{
                    let path = props.nodeinfo[props.type+'path']
                    if(!path) return reject('未维护路径信息')
                    ssh.exec('find '+path,[],{}).then(()=>{
                        ssh.exec('pwd;'+path, [], {
                            cwd:path.substr(0,path.lastIndexOf('/')),
                            onStdout(chunk) {
                                ssh.dispose()
                            },
                        }).then(()=>{
                            resolve()
                        })
                    }).catch((err)=>{
                        ssh.dispose()
                        reject('文件未找到:'+path)
                    })
                }).catch((err)=>{
                reject('登陆失败:'+err)
                })
            })  
        },
        SSH2CloseSSH({commit},ssh){
            ssh&&ssh.dispose()
        },
        SSH2ShowLog({commit},{nodeinfo,callback}){
            return new Promise((resolve, reject) => {
                //登陆
                Connect(nodeinfo).then(({ssh,lang})=>{
                    let path = nodeinfo.logpath
                    if(!path) return reject('未维护路径信息')
                    //判断服务器文件是否存在
                    FindFile(ssh,path).then(()=>{
                        ssh.exec('tail -f '+path, [], {
                            cwd:path.substr(0,path.lastIndexOf('/')),
                            onStdout(chunk) {
                                callback(ssh,iconv.decode(chunk,lang.toLowerCase().indexOf('utf')>0 ? 'UTF8':'GBK'))
                            },
                        }).then(()=>{
                            resolve()
                        })
                    }).catch((err)=>{
                        ssh.dispose()
                        reject('文件未找到:'+path)
                    })
                }).catch((err)=>{
                reject('登陆失败:'+err)
                })
            })  
        },
        async SSH2BatchPutDir({dispatch},props){
            for(let i = 0 ; i<props.nodeinfo.length;i++){
                await dispatch('SSH2PutDirectory',{
                    localPath : props.localPath,
                    nodeinfo : props.nodeinfo[i]
                }).catch((err)=>{
                    Notification({
                        title: '提示',
                        message: props.nodeinfo[i].name + '节点:' + err,
                        type: 'warning',
                        duration: 0
                    })
                })
            }
        },
        async SSH2BatchExec({dispatch},props){
            for(let i = 0 ; i<props.nodeinfo.length;i++){
                await dispatch('SSH2ExecPath',{
                    type : props.type,
                    nodeinfo : props.nodeinfo[i]
                }).catch((err)=>{
                    Notification({
                        title: '提示',
                        message: props.nodeinfo[i].name + '节点:' + err,
                        type: 'warning',
                        offset: 100,
                        duration: 0
                    })
                })
            }
        },
        SSH2ExecTop({dispatch},{nodeinfo,callback}){
            return new Promise((resolve, reject) => {
                //登陆
                Connect(nodeinfo).then(({ssh})=>{
                    ssh.exec('top', ['-bid1'], {
                        onStdout(chunk) {
                            callback(ssh,chunk.toString())
                        },
                    }).then(()=>{
                        ssh.dispose()
                        resolve()
                    }).catch(err=>{
                        ssh.dispose()
                        reject('执行失败:'+err)
                    })
                }).catch((err)=>{
                    ssh.dispose()
                    reject('登陆失败:'+err)
                })
            })  
        }
    }
}

export default ssh2