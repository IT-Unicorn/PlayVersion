import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'
//服务节点信息
export const Node = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), 'db/nodeinfo.db')
})
//更新补丁日志信息
export const UpdateLog = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), 'db/updatelog.db')
})