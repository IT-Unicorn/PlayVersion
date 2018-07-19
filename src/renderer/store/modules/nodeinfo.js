import db from '../../../database'

const nodeinfo = {
    state: {
        
    },
    actions: {
        addNode({ commit },nodeInfo){
            return new Promise((resolve, reject) => {
                db.insert(nodeInfo,(err,data)=>{
                    console.log(nodeInfo)
                    if(err) reject(err)
                    resolve()
                })
              })
        }
    }
}
export default nodeinfo
