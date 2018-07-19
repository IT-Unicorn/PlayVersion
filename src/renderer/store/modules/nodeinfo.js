import db from '../../../database'

const nodeinfo = {
    state: {
        
    },
    actions: {
        addNode({ commit },nodeInfo){
            return new Promise((resolve, reject) => {
                db.insert(nodeInfo,(err,data)=>{
                    if(err) reject(err)
                    resolve()
                })
              })
        },
        delNode({ commit },nodeid){
            return new Promise((resolve, reject) => {
                db.remove({_id:nodeid},{},(err,numRemoved)=>{
                    if(err) reject(err)
                    resolve()
                })
              })
        },
        updateNode({ commit },nodeInfo){
            return new Promise((resolve, reject) => {
                db.update({_id:nodeInfo._id},nodeInfo,{},(err,numReplaced)=>{
                    if(err) reject(err)
                    resolve()
                })
              })
        },
        delNode({ commit },nodeid){
            return new Promise((resolve, reject) => {
                db.remove({_id:nodeid},{},(err,numRemoved)=>{
                    if(err) reject(err)
                    resolve()
                })
              })
        },
        getNodeById({ commit },nodeid){
            return new Promise((resolve, reject) => {
                db.findOne({_id:nodeid},{},(err,data)=>{
                    if(err) reject(err)
                    resolve(data)
                })
              })
        },
        getNodeList({ commit }){
            return new Promise((resolve, reject) => {
                db.find({},(err,data)=>{
                    if(err) reject(err)
                    resolve(data)
                })
              })
        }
    }
}
export default nodeinfo
