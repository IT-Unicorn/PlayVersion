<template>
    <div>
        <!-- <el-tree :data="direction" :props="defaultProps" @node-click="handleNodeClick"></el-tree> -->
        {{this.direction}}
    </div>
</template>

<script>
import fs from 'fs'
import path from 'path'
export default {
    data(){
        return {
            direction: {}
        }
    },
    mounted() {
        let json = fs.readFileSync(path.join(__static, '/funcDirection.json'))
        // json = JSON.parse(json)
        // arr = {}
        // json.forEach((val)=>{

        // })
        this.direction = JSON.parse(json)
        console.log(JSON.parse(json))
    },
}
</script>

