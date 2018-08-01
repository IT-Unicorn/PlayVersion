import { Notification } from 'element-ui'
import node_ssh from 'node-ssh'
import fs from 'fs'
import path from 'path'
import {uncompileStr} from '@/utils/util.js'
import {DirectoryFiles} from '@/utils/util.js'
import { remote } from 'electron'
import  mkdirp from 'mkdirp'
const ssh = new node_ssh()
async function SSH2getFile(path){
    
}

const ssh2 = {
    state: {
        logStream : ""
    },
    mutations: {
      readLog(state,stream){
        state.logStream=(state.logStream + stream).substr(-1000000)
      },
      clearLog(state){
        state.logStream = "" 
      }
    },
    getters: {
        getLog: state => {
          return state.logStream.substr(-100000)
        },
        getLogAll: state => {
          return state.logStream
        }
      },
    actions: {
        SSH2SaveLog({state},savePath){
            return new Promise((resolve,reject)=>{
                let arr = state.logStream.split('\n')
                let out = ""
                arr.forEach((val)=>{
                    out += val + '\r\n'
                })
                fs.writeFile(savePath,out, err => {
                    if (err) {
                        reject('保存文件失败:'+err)
                    }else{
                        resolve()
                    }
                })
            })
        },
        SSH2Connect({ commit },node){
            return new Promise((resolve, reject) => {
                ssh.connect({
                    host: node.ip,
                    username: node.user,
                    port: node.port,
                    password:uncompileStr(node.password)
                  }).then(()=>{
                    resolve()
                  }).catch((err)=>{
                    reject(err)
                  })
            })  
        },
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
                dispatch('SSH2Connect',props.nodeinfo).then(()=>{
                    //生成日志表
                    dispatch('UpdateLogInsert',{
                        nodeid: props.nodeinfo._id,
                        createDate  :new Date()
                    }).then((data)=>{
                        let localCopyPath = path.join(remote.app.getPath('userData'), 'uploadBackup',data._id ,'local')
                        let localCopyPathArr = []
                        let remoteCopyPath = path.join(remote.app.getPath('userData'), 'uploadBackup',data._id ,'remote')
                        let remoteCopyPathArr = []
                        //循环上传文件列表
                        uploadfiles.forEach((val)=>{
                            //备份本地文件
                            let localFilePath = path.join(localCopyPath,localpath.substr(localpath.lastIndexOf('\\') +1 ),val.replace(localpath,''))
                            localCopyPathArr.push(localFilePath)
                            mkdirp.sync(localFilePath.substr(0,localFilePath.lastIndexOf('\\')))
                            fs.writeFileSync(localFilePath, fs.readFileSync(val))
                            //备份服务器文件
                            
                        })
                        data.local = localCopyPathArr
                        //回写日志表
                        dispatch('UpdateLogUpdate',data).then(()=>{
                            resolve()
                        })
                    }).catch((err)=>{
                        reject('生成备份日志失败:'+err)
                    })
                //备份原文件
                        // ssh.putDirectory(localpath, remotepath,{
                        //     recursive: true,
                        //     concurrency: 10
                        // }).then(()=>{
                        //     ssh.dispose()
                        //     resolve()
                        // }).catch((err)=>{
                        //     ssh.dispose()
                        //     reject('上传文件失败:'+err)
                        // })
                }).catch((err)=>{
                    reject('登陆失败:'+err)
                })
            })  
        },
        SSH2Exec({dispatch},props){
            return new Promise((resolve, reject) => {
                dispatch('SSH2Connect',props.nodeinfo).then(()=>{
                        let path = props.nodeinfo[props.type+'path']
                        if(!path) return reject('未维护路径信息')
                        ssh.exec('find '+path,[],{
                        }).then(()=>{
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
        SSH2CloseLog({commit}){
            ssh.dispose()
        },
        SSH2ShowLog({commit,dispatch},nodeinfo){
            return new Promise((resolve, reject) => {
                commit("clearLog")
                //登陆
                dispatch('SSH2Connect',nodeinfo).then(()=>{
                        let path = nodeinfo.logpath
                        if(!path) return reject('未维护路径信息')
                        //判断服务器文件是否存在
                    dispatch('SSH2FindFile',path).then(()=>{
                        ssh.exec('export LANG=zh_CN.UTF-8 ; tail -f '+path, [], {
                            cwd:path.substr(0,path.lastIndexOf('/')),
                            onStdout(chunk) {
                                commit("readLog",chunk.toString())
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
                await dispatch('SSH2Exec',{
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
        SSH2FindFile(context,filePath){
            return new Promise((resolve,reject)=>{
                ssh.exec('find '+filePath,[],{}).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }) 
        }
    }
}

export default ssh2