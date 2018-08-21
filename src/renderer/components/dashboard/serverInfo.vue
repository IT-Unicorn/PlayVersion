<template>
    <div id = "graph" ref = "graph">
        <!-- <p>{{this.nodeName}}</p>
        <p v-for="(item, index) in this.topArr" :key="index">{{item}}</p> -->
    </div>
</template>

<script>
export default {
    data () {
        return {
            ssh:"",
            timeData:[],
            cpuData:[],
            ramData:[],
            cpuColor:'transparent',
            ramColor:'transparent',
            cpuVal:0,
            ramVal:0,
            ramArr:[]
        }
    },
    props:{
        nodeinfo:Object
    },
    mounted () {
        let cpuGauge = this.$echarts.init(this.$refs.graph)
        cpuGauge.setOption(
            {
            title: {
                text: this.$props.nodeinfo.name + '节点服务器状态',
                subtext: '数据来自'+this.$props.nodeinfo.ip+'服务器',
                x: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    animation: false
                }
            },
            legend: {
                data:['CPU使用率','内存使用率'],
                x: 'left'
            },
            toolbox: {
                feature: {
                    restore: {},
                    saveAsImage: {}
                }
            },
            axisPointer: {
                link: {xAxisIndex: 'all'}
            },
            dataZoom: [
                {
                    show: false,
                    realtime: true,
                    start: 0,
                    end: 100,
                    xAxisIndex: [0, 1]
                },
                {
                    type: 'inside',
                    realtime: true,
                    start: 0,
                    end: 100,
                    xAxisIndex: [0, 1]
                }
            ],
            grid: [{
                left: 50,
                right: 10,
                height: '35%',
                show:true,
                backgroundColor:'transparent'
            }, {
                left: 50,
                right: 10,
                top: '55%',
                height: '35%',
                show:true,
                backgroundColor:'transparent'
            }],
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    axisLine: {onZero: true},
                    data: this.timeData
                },
                {
                    gridIndex: 1,
                    type : 'category',
                    boundaryGap : false,
                    axisLine: {onZero: true},
                    data: this.timeData,
                    show :false,
                    position: 'top'
                }
            ],
            yAxis : [
                {
                    name : 'CPU使用率(%)',
                    type : 'value',
                    splitNumber:3,
                    max : 100
                },
                {
                    gridIndex: 1,
                    name : '内存使用率(%)',
                    type : 'value',
                    max:100,
                    splitNumber:3,
                    inverse: true
                }
            ],
            series : [
                {
                    name:'CPU使用率',
                    type:'line',
                    symbolSize: 3,
                    hoverAnimation: false,
                    data:this.cpuData
                },
                {
                    name:'内存使用率',
                    type:'line',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    symbolSize: 3,
                    hoverAnimation: false,
                    data: this.ramData
                }
            ]
            }
        )
        this.$store.dispatch('SSH2ExecTop',{
            nodeinfo : this.$props.nodeinfo,
            callback : (ssh,top)=>{
                if(!this.ssh){
                    this.ssh = ssh
                    console.log(ssh)
                }
                // let topArr = top.trim().split('\n')
                //CPU
                this.timeData.push(this.$options.filters.parseTime(new Date(),'{h}:{i}:{s}'))
                this.cpuVal = top.trim().split('\n')[2].split(',')[0].replace(/[^0-9|\.]/g,"")
                this.cpuVal>90?this.cpuColor = '#B3C0D1':this.cpuColor = 'transparent'
                this.cpuData.push(this.cpuVal)
                //RAM
                this.ramArr = top.trim().split('\n')[3].replace(/[^0-9|,]/g,"").split(',')
                this.ramVal = (this.ramArr[1]/this.ramArr[0]*100).toFixed(2) - 0
                this.ramVal>90?this.ramColor = '#B3C0D1':this.ramColor = 'transparent'
                this.ramData.push(this.ramVal)
                
                //监控值太多,卡顿,超过600组数据截取
                if(this.timeData.length >= 300){
                    this.timeData.shift()
                    this.cpuData.shift()
                    this.ramData.shift()
                }
                cpuGauge.setOption({
                    grid: [{
                        left: 50,
                        right: 10,
                        height: '35%',
                        show:true,
                        backgroundColor:this.cpuColor
                    }, {
                        left: 50,
                        right: 10,
                        top: '55%',
                        height: '35%',
                        show:true,
                        backgroundColor:this.ramColor
                    }],
                    xAxis : [
                        {
                            type : 'category',
                            boundaryGap : false,
                            axisLine: {onZero: true},
                            data: this.timeData
                        },
                        {
                            gridIndex: 1,
                            type : 'category',
                            boundaryGap : false,
                            axisLine: {onZero: true},
                            data: this.timeData,
                            show :false,
                            position: 'top'
                        }
                    ],
                    series : [
                        {
                            name:'CPU使用率',
                            type:'line',
                            hoverAnimation: false,
                            symbolSize: 3,
                            data:this.cpuData
                        },
                        {
                            name:'内存使用率',
                            type:'line',
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            hoverAnimation: false,
                            symbolSize: 3,
                            data: this.ramData
                        }
                    ]
                })
            }
        }).catch((err)=>{
            this.$message.error(err)
        })
    },
    beforeDestroy() {
        this.$store.dispatch('SSH2CloseSSH',this.ssh)
    },
    
}
</script>

<style scoped>
#graph{
    height: 300px;
    width: 600px;
    float: left;
    margin-top: 10px;
}
</style>
