<template>
    <div>
        <el-header>
            <el-row type ="flex" align ="middle" justify="start" class = "header-row">
                <el-button @click="goback()">返回首页</el-button>
                <el-button @click="checkUpdata()">检查版本更新</el-button>
            </el-row>
        </el-header>
        <div v-for="(val, key) in this.direction" :key="key">
             <h2 id = "version">{{key}}</h2>
            <el-collapse :v-model="key">
                <el-collapse-item v-for="(item, index) in val" :key="index" :title="index" :name="index">
                    <div>{{item}}</div>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script>
import fs from 'fs'
import path from 'path'
import {ipcRenderer} from 'electron'
export default {
    data(){
        return {
            direction: {},
            loading:""
        }
    },
    methods: {
        checkUpdata(){
            this.loading = this.$loading({
                lock: true,
                text: 'Update...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            })
            ipcRenderer.send('update')
        },
        goback(){
          this.$router.push({
              path: '/'
            })
      },
    },
    mounted() {
        let json = fs.readFileSync(path.join(__static, '/funcDirection.json'))
        this.direction = JSON.parse(json)
        //监听主进程信息
        ipcRenderer.on('message',(event,{message,data}) => {
            switch(message){
                case "error":
                    this.loading.close()
                    this.$message.error(data)
                    break
                case "update-not-available":
                    this.loading.close()
                    this.$message(data)
                    break
                case "isUpdateNow":
                    this.loading.close()
                    this.$confirm('更新文件已准备就绪,是否安装?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'info'
                    }).then(() => {
                        ipcRenderer.send('updateNow')
                    }).catch(() => {
                        return
                    })
                    break
                case "downloadProgress":
                    this.loading.text = `${data.transferred}/${data.total}(${Math.floor(data.percent * 100) / 100}%)`
                    break
                default : 
                    this.loading.text = data
            }
        })
    },
}
</script>

<style scoped>
#version{
    text-align: center
}
</style>
