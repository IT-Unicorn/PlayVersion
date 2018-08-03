<template>
    <div>
        <el-header>
            <el-row type ="flex" align ="middle" class = "header-row">
                <el-button @click="goback()">返回首页</el-button>
                <el-button @click="getLocal()">获取补丁文件</el-button>
                <el-button @click="getRemote()">获取服务器备份</el-button>
            </el-row>
        </el-header>
         <el-table :data="uploadList" style="width: 100%">
            <el-table-column label="上传文件" >
                <template slot-scope="scope">
                    <el-popover trigger="hover" placement="top">
                    <p>路径: {{ scope.row.local |  showFilePath('local')}}</p>
                    <div slot="reference" class="name-wrapper">
                        <el-tag size="medium">{{ scope.row.local | showFileName() }}</el-tag>
                    </div>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="类型"  prop = "type"></el-table-column>
            <el-table-column align="center" width="130" fixed="right">
                <template slot-scope="scope">
                <el-button  size="small" type="success" @click="codeDiff(scope.row)" :disabled="scope.row.type == 'INSERT' || scope.row.local.substr(scope.row.local.lastIndexOf('.')+1) == 'class'" >查看更新内容
                </el-button>
                </template>
              </el-table-column>
        </el-table>
        <el-dialog :title = " textComTitle + '(ESC退出)'" :visible.sync="textComDialogVisible" fullscreen center :before-close = "textComDialogClose">
             <code-diff :old-string="oldStr" :new-string="newStr" :context="10"  />
        </el-dialog>
    </div>
</template>


<script>
import fs from 'fs'
import path from 'path'
import vueCodeDiff from 'vue-code-diff'

export default {
    data(){
        return {
            uploadList:[],
            textComDialogVisible:false,
            textComTitle : "",
            oldStr:"",
            newStr:""
        }
    },
    components: {
      "code-diff":vueCodeDiff
    },
    methods: {
        goback(){
          this.$router.push({
              path: '/'
            })
        },
        getLocal(){
            let dirpath = path.join(this.$electron.remote.app.getPath('userData'),'uploadBackup',this.$route.params.id,'local','*')
            this.$electron.shell.showItemInFolder(dirpath)
        },
        getRemote(){
            let dirpath = path.join(this.$electron.remote.app.getPath('userData'),'uploadBackup',this.$route.params.id,'remote','*')
            this.$electron.shell.showItemInFolder(dirpath)
        },
        codeDiff(row){
            let loading = this.$loading({
                            lock: true,
                            text: 'Loading',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        })
            this.textComTitle = row.local.substr(row.local.lastIndexOf('\\')+1)
            this.oldStr = this.$iconv.decode(fs.readFileSync(row.remote),'UTF8')
            this.newStr = this.$iconv.decode(fs.readFileSync(row.local),'UTF8')
            this.textComDialogVisible = true
            loading.close()

        },
        textComDialogClose(done){
            this.oldStr = ""
            this.newStr = ""
            done()
        }
    },
    filters:{
        showFileName:function(val){
            return val.substr(val.lastIndexOf('\\')+1)
        },
        showFilePath:function(val,type){
            return val.substr(val.indexOf(type)+ type.length)
        }
    },
    mounted() {
        let logId = this.$route.params.id
        this.$store.dispatch('UpdateLogGetLogById',logId).then((data)=>{
            this.uploadList = data.files
        })
    },
}
</script>
