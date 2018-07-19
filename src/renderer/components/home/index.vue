<template>
    <el-container>
        <el-header>
             <el-button  icon="el-icon-plus"  @click="add()">添加节点</el-button>
        </el-header>
        <el-main>
            <el-table :data="nodelist" style="width: 100%" border stripe>
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column prop="name" label="节点名称" ></el-table-column>
              <el-table-column prop="ip" label="节点地址(IP)" ></el-table-column>
              <el-table-column prop="port" label="端口" ></el-table-column>
              <el-table-column prop="user" label="节点登陆用户名" ></el-table-column>
              <el-table-column align="center" label="操作" width="150" fixed="right">
                <template slot-scope="scope">
                <el-button  size="small" type="success" @click="handleUpdate(scope.row)">编辑
                </el-button>
                <el-button  size="small" type="danger" @click="handleDelete(scope.row)">删除
                </el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-main>
    </el-container>
</template>

<script>
import db from '../../../database/index'
    export default {
        name: 'Home',
        data(){
            return {
               nodelist:[] 
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
                        this.$notify({
                            title: '成功',
                            message: '删除成功',
                            type: 'success',
                            duration: 2000
                        })
                        this.getList()
                        })
                });
            }

        },
        created() {
            this.getList()
        },
    }

</script>