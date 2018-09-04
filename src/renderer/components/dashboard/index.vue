<template>
    <div>
        <el-header>
            <el-row type ="flex" align ="middle" class = "header-row">
                <el-button @click="goback()">返回首页</el-button>
                <el-button @click="showAside = !showAside">{{showAside?"关闭侧边栏":"显示侧边栏"}}</el-button>
            </el-row>
        </el-header>
        <el-container>
            <el-aside width="200px" id = "aside" v-show="showAside">
                <!-- 节点列表 -->
                <el-table :data= "nodelist" 
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
                    <el-table-column prop="name" label="节点名称" align="center"></el-table-column>
                </el-table>
            </el-aside>
            <el-main>
                <server-info v-for="data in this.multipleSelection" :key = "data._id" :nodeinfo="data"></server-info>
            </el-main>
        </el-container>
        <!-- <el-row type ="flex" justify="center">
            <el-col :span="12"> <div id ="cpuGauge"></div></el-col>
            <el-col :span="12"> <div id ="ramGauge"></div></el-col>
        </el-row> -->
    </div>
</template>


<script>
export default {
  data () {
    return {
        nodeTime : '0:0:0',
        nodeName : "",
        nodelist : [],
        multipleSelection : [],
        showAside:true
    }
  },
  components: {
      serverInfo : require('./serverInfo').default
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
  mounted(){
    //路由入参, 节点信息
    this.$store.dispatch('getNodeList').then((data)=>{
        this.nodelist = data
    })
  },
  methods: {
    goback(){
        this.$router.push('/')
    },
    //选择筛选,重新选择筛选的时候,清空已选中列表
    handleSelectionChange(val){
        this.multipleSelection = val
    },
    //筛选响应
    filterHandler(value, row, column) {
        this.$refs.multipleTable.clearSelection()
        return row.group === value
    },
  }
}
</script>

