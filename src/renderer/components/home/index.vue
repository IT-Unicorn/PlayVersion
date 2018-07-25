<template>
    <el-container>
        <el-header height = '30px'>
             <el-button  icon="el-icon-plus"  @click="add()">添加节点</el-button>
             <el-dropdown @command="batchHandleCommand" trigger="click">
                <el-button >
                    批量处理<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command = "upload">上传补丁</el-dropdown-item>
                    <el-dropdown-item command = "start">启服务</el-dropdown-item>
                    <el-dropdown-item command = "stop">停服务</el-dropdown-item>
                    <el-dropdown-item command = "clear">清缓存</el-dropdown-item>
                </el-dropdown-menu>
                </el-dropdown>
                <el-button  icon="el-icon-upload2"  @click="importFile()">导入1.0配置</el-button>
        </el-header>
        <el-main>
            <el-table :data= "nodelist" 
                style="width: 100%"
                border 
                size = "small"
                ref="multipleTable"
                @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="35" align="center"></el-table-column>
              <el-table-column prop="group" label="分组" 
                :filters = "nodeFilter"
                :filter-method = "filterHandler"
                align="center"
              ></el-table-column>
              <el-table-column prop="name" label="节点名称" align="center"></el-table-column>
              <el-table-column prop="ip" label="节点地址(IP)" width="120" align="center"></el-table-column>
              <el-table-column prop="port" label="端口" width="50" align="center"></el-table-column>
              <el-table-column prop="user" label="用户名" align="center"></el-table-column>
              <el-table-column align="center" width="130" fixed="right">
                <template slot-scope="scope">
                <el-button  size="small" type="success" @click="handleUpdate(scope.row)" icon="el-icon-edit">
                </el-button>
                <el-button  size="small" type="danger" @click="handleDelete(scope.row)" icon="el-icon-delete">
                </el-button>
                </template>
              </el-table-column>
              <el-table-column align="center" width="120" fixed="right">
                <template slot-scope="scope">
                <el-dropdown @command="handleCommand" trigger="click">
                <el-button type="primary" size="small">更多操作<i class="el-icon-arrow-down el-icon--right"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command = "{type:'upload',params:scope.row}">上传补丁</el-dropdown-item>
                    <el-dropdown-item :command = "{type:'start',params:scope.row}">启服务</el-dropdown-item>
                    <el-dropdown-item :command = "{type:'stop',params:scope.row}">停服务</el-dropdown-item>
                    <el-dropdown-item :command = "{type:'clear',params:scope.row}">清缓存</el-dropdown-item>
                    <el-dropdown-item :command = "{type:'log',params:scope.row}">查看日志</el-dropdown-item>
                </el-dropdown-menu>
                </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
        </el-main>
        <el-dialog :title = "logTitle" :visible.sync="logDialogVisible" fullscreen center :before-close = "logClose">
            <el-input
                type="textarea"
                rows="20"
                resize="none"
                v-model="this.logT">
            </el-input>
        </el-dialog>
    </el-container>
    
</template>

<script>
    export default {
        name: 'Home',
        data(){
            return {
               nodelist:[],
               loading:"",
               multipleSelection:[],
               logTitle:"日志",
               logDialogVisible: false,
               logText : ""
            }
        },
        computed:{
           nodeFilter:function(){
               return this.nodelist.length > 0 ? 
                Array.from(new Set(this.nodelist.map((value)=>{
                        return value.group
                    }))).map((val)=>{
                   return {text:val,value:val}
               }) : [{text:'',value:''}]
           },
           logT:function(){
            //    console.log(this.$store.state.logStream)
               return this.$store.getters.getLog
           }
        },
        methods: {
            add () {
                this.$router.push('/addNode')
            },
            getList() {
                this.$store.dispatch('getNodeList').then((data)=>{
                    this.nodelist = data
                })
            },
            handleUpdate(row){
                this.$router.push({ path: '/EditNode/'+row._id })
            },
            handleDelete(row){
                this.$confirm('此操作将永久删除, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$store.dispatch('delNode',row._id).then(() => {
                        this.$message.success('删除成功')
                        this.getList()
                        })
                });
            },
            logClose(done){
                this.$store.dispatch('SSH2CloseLog')
                done()
            },
            handleCommand(command){
                switch(command.type){
                    case "upload":
                        let localPath = this.$electron.remote.dialog.showOpenDialog({properties: ['openDirectory']})
                        if(!localPath) return
                        this.loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });
                        this.$store.dispatch(
                            'SSH2PutDirectory',{
                                localPath : localPath[0],
                                nodeinfo : command.params
                            }   
                        ).then(() => {
                        this.loading.close()
                        this.$message.success('上传成功')
                        }).catch((err)=>{
                        this.loading.close()   
                        this.$message.error(err)
                        })
                        break
                    case "log":
                        this.logDialogVisible = true
                        this.logTitle = command.params.name + '日志信息'
                        this.$store.dispatch('SSH2ShowLog',command.params).catch((err)=>{
                            this.$message.error(err)
                        })
                        break
                    default:
                        this.loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });
                        this.$store.dispatch('SSH2Exec',{
                            type : command.type,
                            nodeinfo : command.params 
                        }).then(()=>{
                            this.loading.close()
                            this.$message.success('指令发送成功')
                        }).catch((err)=>{
                            this.loading.close()
                            this.$message.error(err)
                        })
                        break
                }
                
            },
            batchHandleCommand(command){
                if(this.multipleSelection.length == 0){
                    this.$message.error('请选择要处理的记录')
                    return
                }
                switch(command){
                    case "upload":
                        let localPath = this.$electron.remote.dialog.showOpenDialog({properties: ['openDirectory']})
                        if(!localPath) return
                        this.loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });
                        this.$store.dispatch(
                            'SSH2BatchPutDir',{
                                localPath : localPath[0],
                                nodeinfo : this.multipleSelection
                            }   
                        ).then(()=>{
                            this.loading.close()
                            this.$message.success('批量操作完成')
                        })
                        break
                    default:
                        this.loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });
                        this.$store.dispatch(
                            'SSH2BatchExec',{
                                type : command,
                                nodeinfo : this.multipleSelection
                            }   
                        ).then(()=>{
                            this.loading.close()
                            this.$message.success('批量操作完成')
                        })
                }
            },
            handleSelectionChange(val){
                this.multipleSelection = val
            },
            filterHandler(value, row, column) {
                this.$refs.multipleTable.clearSelection()
                return row.group === value;
            },
            importFile(){
                let filePath = this.$electron.remote.dialog.showOpenDialog({filters:[{name: 'Properties', extensions: ['properties']}],properties: ['openFile']})
                if(!filePath) return
                this.$store.dispatch('readOldConfig',filePath[0]).then(()=>{
                    this.getList()
                }).catch((err)=>{
                    this.$message.error(err)
                })
            }
        },
        mounted() {
            this.getList()
            // this.$electron.shell.openExternal('cmd',{activate:true})
        },
    }

</script>