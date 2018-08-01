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
    }

}

export default UpdateLogFun