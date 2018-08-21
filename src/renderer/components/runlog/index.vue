<template>
    <div>
        <el-header>
            <el-row type ="flex" align ="middle" class = "header-row">
                <el-button @click="goback()">返回首页</el-button>
                <el-button @click="logDownloadBtn()">保存日志到磁盘</el-button>
                <el-button @click="logStop()" :disabled = "stopLog">停止读取</el-button>
            </el-row>
        </el-header>
        <div class="logAreadiv" ref = "logAreadiv">
            <p class="logArea">{{this.logT.substr(-100000)}}</p>
        </div>
    </div>
</template>

<script>
import fs from 'fs'
export default {
    data() {
        return {
            stopLog : false,
            logT   : "",
            ssh : ""
        }
    },
    watch:{
        // 监控日志读取,设置滚动条
        logT : function(val,oldval){
            if(this.$refs.logAreadiv){
                this.$refs.logAreadiv.scrollTop = this.$refs.logAreadiv.scrollHeight + 5000
            }
        },
    },
    mounted () {
        let node = this.$route.query
        this.$store.dispatch('SSH2ShowLog',{
            nodeinfo : node , 
            callback : (ssh,msg)=>{
                if(!this.ssh){
                    this.ssh = ssh
                }
                this.logT = (this.logT + msg).substr(-1000000)
                
            }
        })
        let win =this.$electron.remote.BrowserWindow.getAllWindows()[0]
        this.$refs.logAreadiv.style.height =  Math.round(win.getContentSize()[1]-60) + 'px'
        win.on('resize', (e, cmd)=>{
            this.$refs.logAreadiv.style.height =  Math.round(win.getContentSize()[1]-60) + 'px'
        })
    },
    methods: {
        //日志下载按钮
        logDownloadBtn(){
            let savePath = this.$electron.remote.dialog.showSaveDialog({defaultPath:this.logTitle,filters:[{name: 'Text', extensions: ['txt']}]})
            if(savePath.length == 0 ) return
            let arr = this.logT.split('\n')
            let out = ""
            arr.forEach((val)=>{
                out += val + '\r\n'
            })
            fs.writeFile(savePath,out, err => {
                if (err) {
                    this.$message.error('保存失败')
                }else{
                    this.$message.success('保存成功')
                }
            })
        },
        //暂停读取日志按钮
        logStop(){
            this.stopLog = true
            this.$store.dispatch('SSH2CloseSSH',this.ssh)
        },
        goback(){
            this.$store.dispatch('SSH2CloseSSH',this.ssh)
            this.$router.push('/')
        }
    }
}
</script>



<style scoped>
.logArea{
    font-size: 12px;
    flex: 1;
    margin:0;
    white-space:pre-wrap;
    background-color:rgba(8, 4, 4, 0.808);
    color:antiquewhite;
}
.logAreadiv{
    display: flex;
    flex-direction: column;
    height: 540px;
    overflow:scroll;
}
</style>
