import {UpdateLog} from '@/database'


const UpdateLogFun = {
    actions: {
        UpdateLogInsert({dispatch},data) {
            return new Promise((resolve,reject)=>{
                UpdateLog.insert(data,(err,backdata)=>{
                    if(err) reject(err)
                    resolve(backdata)
                }) 
            })
        },
        UpdateLogUpdate({dispatch},data) {
            return new Promise((resolve,reject)=>{
                UpdateLog.update({_id:data._id},data,{},(err,numReplaced)=>{
                    if(err) reject(err)
                    resolve()
                })
            })
        },
        UpdateLogDelete({dispatch},id) {
            return new Promise((resolve,reject)=>{
                UpdateLog.remove({_id:id},{},(err,numRemoved)=>{
                    if(err) reject(err)
                    resolve()
                })
            })
        },
        UpdateLogGetListByNodeId({dispatch},id) {
            return new Promise((resolve,reject)=>{
                UpdateLog.find({nodeid:id}).sort({createDate:-1}).limit(5).exec((err,data)=>{
                    if(err) reject(err)
                    resolve(data)
                })
            })
        },
        UpdateLogGetLogById({ commit },id){
            return new Promise((resolve, reject) => {
                UpdateLog.findOne({_id:id},{},(err,data)=>{
                    if(err) reject(err)
                    resolve(data)
                })
            })
        },
    }

}

export default UpdateLogFun