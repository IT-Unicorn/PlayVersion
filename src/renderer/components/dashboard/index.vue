<template>
    <div>
        <el-header>
            <el-row type ="flex" align ="middle" class = "header-row">
                <el-button @click="goback()">返回首页</el-button>
                <div id = "nodeTime">{{this.nodeName + '节点'+ this.nodeTime}}</div>
            </el-row>
        </el-header>
        <el-row type ="flex" justify="center">
            <el-col :span="12"> <div id ="cpuGauge"></div></el-col>
            <el-col :span="12"> <div id ="ramGauge"></div></el-col>
        </el-row>
    </div>
</template>


<script>
export default {
  data () {
    return {
        nodeTime : '0:0:0',
        nodeName : "",
    }
  },
  mounted(){
    //路由入参, 节点信息
    let node = this.$route.query
    this.nodeName = node.name
    this.ExecTOP(node)
  },
  methods: {
    goback(){
        this.$store.dispatch('SSH2CloseSSH')
        this.$router.push('/')
    },
    ExecTOP(node){
        let cpuGauge = this.$echarts.init(document.getElementById('cpuGauge'))
        this.CpuGauge(cpuGauge,0)
        let ramGauge = this.$echarts.init(document.getElementById('ramGauge'))
        this.RamGauge(ramGauge,0)

        this.$store.dispatch('SSH2ExecTop',{
            nodeinfo : node,
            callback : (top)=>{
                let topArr = top.trim().split('\n')
                this.nodeTime = topArr[0].replace('top','服务器时间:').replace('up','运行').replace('days','天').replace('users','个用户登录').replace('load average','系统负载')
                this.CpuGauge(cpuGauge,topArr[2].split(',')[0].replace(/[^0-9|\.]/g,""));
                let ram = topArr[3].replace(/[^0-9|,]/g,"").split(',')
                console.log((ram[1]/ram[0]*100).toFixed(2) - 0)
                this.RamGauge(ramGauge,(ram[1]/ram[0]*100).toFixed(2) - 0);

            }
        }).then(()=>{
                return
        }).catch((err)=>{
            this.$message.error(err)
        })
    },
    CpuGauge(cpuGauge,cpuValue){
        cpuGauge.setOption({
            series: [
                {
                    name: 'CPU使用率',
                    type: 'gauge',
                    detail: {formatter:'{value}%'},
                    data: [{value: cpuValue, name: 'CPU使用率'}]
                },
            ]
        }, true) 
    },
    RamGauge(ramGauge,RamValue){
        ramGauge.setOption({
            series: [
                {
                    name: 'RAM使用率',
                    type: 'gauge',
                    detail: {formatter:'{value}%'},
                    data: [{value: RamValue, name: 'RAM使用率'}]
                },
            ]
        }, true) 
    }
  }
}
</script>



<style scoped>
#cpuGauge{
    width:300px;
    height:300px;
}
#ramGauge{
    width:300px;
    height:300px;
}
</style>
