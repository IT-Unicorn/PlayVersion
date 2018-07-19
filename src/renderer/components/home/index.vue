<template>
    <el-container>
        <el-header>
             <el-button  icon="el-icon-plus"  @click="add()">添加节点</el-button>
        </el-header>
        <el-main>
            <!-- <el-table
                :data="tableData"
                style="width: 100%">
                <el-table-column
                    prop="date"
                    label="日期"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="name"
                    label="姓名"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="address"
                    label="地址">
                </el-table-column>
            </el-table> -->
        </el-main>
    </el-container>
</template>

<script>
import db from '../../../database/index'
    export default {
        name: 'Home',
        data(){
            return {

            }
        },
        methods: {
            add () {
                this.$router.push({
                    path: '/addNode'
                })
            }
        },
        created() {
            db.find({},function(err,docs){
                console.log(docs)
            })
        },
    }

</script>