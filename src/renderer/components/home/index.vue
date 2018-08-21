<template>
    <el-container>
        <el-header>
            <el-row type ="flex" align ="middle" class = "header-row">
            <!-- 新增节点按钮 -->
             <el-dropdown @command="nodeHandleCommand" trigger="click">
                <el-button >
                    添加节点<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command = "add">单个添加</el-dropdown-item>
                    <el-dropdown-item command = "import">导入1.0配置</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <!-- 批量处理按钮 -->
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
            <el-button @click = "goDashboard()">服务器监控</el-button>
            <el-button @click = "pushDirection()">版本信息</el-button>
            </el-row>
        </el-header>
        <el-main>
            <!-- 节点列表 -->
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
                sortable
              ></el-table-column>
              <el-table-column prop="name" label="节点名称" align="center" sortable></el-table-column>
              <el-table-column prop="ip" label="节点地址(IP)" width="120" align="center"></el-table-column>
              <el-table-column prop="port" label="端口" width="50" align="center"></el-table-column>
              <el-table-column prop="user" label="用户名" align="center"></el-table-column>
              <!-- 每行记录后面的操作按钮 -->
              <el-table-column align="center" width="130" fixed="right">
                <template slot-scope="scope">
                <el-button  size="small" type="success" @click="handleUpdate(scope.row)" icon="el-icon-edit">
                </el-button>
                <el-button  size="small" type="danger" @click="handleDelete(scope.row)" icon="el-icon-delete">
                </el-button>
                </template>
              </el-table-column>
              <!-- 每行记录后面的更多操作按钮 -->
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
                    <el-dropdown-item :command = "{type:'uploadlog',params:scope.row}">上传补丁记录</el-dropdown-item>
                </el-dropdown-menu>
                </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
        </el-main>
        <!-- 上传补丁记录展示 -->
        <el-dialog :title = "uploadlogTitle + '(ESC退出)'" :visible.sync="uploadlogDialogVisible" center :before-close = "uploadlogClose">
            <el-table :data="uploadList" style="width: 100%">
            <el-table-column label="日期" width="200">
                <template slot-scope="scope">
                    <i class="el-icon-time"></i>
                    <span style="margin-left: 10px">{{ scope.row.createDate | parseTime()}}</span>
                </template>
            </el-table-column>
            <el-table-column label="上传文件数" >
                <template slot-scope="scope">
                   {{ scope.row.files | count()}}
                </template>
            </el-table-column>
            <el-table-column align="center" width="130" fixed="right">
                <template slot-scope="scope">
                <el-button  size="small" type="success" @click="uploadLogDetail(scope.row._id)" >详情
                </el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-dialog>
    </el-container>
</template>

<script>
import {DirectoryFiles} from '@/utils/util.js'
    export default {
        name: 'Home',
        data(){
            return {
               nodelist:[],  //绑定节点列表
               loading:"",   //屏幕加载控制
               multipleSelection:[],  //多选列表
               logTitle:"", //日志框标题和导出默认文件名
               directionDialogVisible  : false, //版本信息显示
               uploadList:[], //上传补丁记录
               uploadlogDialogVisible : false, //上传补丁记录框显示控制
               uploadlogTitle:"" //上传补丁记录框显示名称
            }
        },

        computed:{
           //分组筛选项 -> 查询节点列表, 用Set过滤掉重复记录
           nodeFilter:function(){
               return this.nodelist.length > 0 ? 
                Array.from(new Set(this.nodelist.map((value)=>{
                        return value.group
                    }))).map((val)=>{
                   return {text:val,value:val}
               }) : [{text:'',value:''}]
           }
        },
        methods: {
            pushDirection(){
                this.$router.push('/direction')
            },
            uploadLogDetail(id){
                this.$router.push('/UploadLog/'+id)
            },
            goDashboard(){
                this.$router.push('/dashboard')
            },
            //节点新增下拉菜单
            nodeHandleCommand(command){
                switch(command){
                    case "add":
                        this.$router.push('/addNode')
                        break
                    case "import":
                        this.importFile()
                        break
                }
            },
            //批量操作下来菜单
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
            //编辑节点信息按钮
            handleUpdate(row){
                this.$router.push({ path: '/EditNode/'+row._id })
            },
            //删除节点信息按钮
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
                }).catch((err)=>{
                    return
                })
            },
            //更多节点操作下来菜单
            handleCommand(command){
                switch(command.type){
                    case "uploadlog":
                        this.uploadlogDialogVisible = true
                        this.uploadlogTitle = command.params.name + '节点上传补丁记录'
                        this.$store.dispatch('UpdateLogGetListByNodeId',command.params._id).then((data)=>{
                            this.uploadList = data
                        })
                        break
                    case "upload":
                        let localPath = this.$electron.remote.dialog.showOpenDialog({properties: ['openDirectory']})
                        if(!localPath) return
                        this.loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        })
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
                        this.$router.push({
                            path :'/runlog',
                            query : command.params
                            })
                        break
                    default:
                        this.loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });
                        this.$store.dispatch('SSH2ExecPath',{
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
            //选择筛选,重新选择筛选的时候,清空已选中列表
            handleSelectionChange(val){
                this.multipleSelection = val
            },
            //筛选响应
            filterHandler(value, row, column) {
                this.$refs.multipleTable.clearSelection()
                return row.group === value;
            },
            //获取节点列表
            getList() {
                this.$store.dispatch('getNodeList').then((data)=>{
                    this.nodelist = data
                })
            },
            //日志框关闭响应
            logClose(done){
                this.logStop()
                this.logStopDis = false
                done()
            },
            //上传补丁日志框关闭响应
            uploadlogClose(done){
                this.uploadList = []
                done()
            },
            //导入原1.0版本配置文件
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
        //挂载钩子函数
        mounted() {
            this.getList()                
            
        },
    }

</script>

<style scoped>
.row-bg{
    padding-top: 10px
}
</style>
