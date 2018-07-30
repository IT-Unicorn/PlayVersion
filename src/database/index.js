import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

export const Node = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), 'db/nodeinfo.db')
})

