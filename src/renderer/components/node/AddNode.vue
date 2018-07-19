<template>
    <div>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="150px" class="ruleForm">
      <el-form-item label="节点名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="节点地址(IP)" prop="ip">
          <el-input v-model="ruleForm.ip" placeholder="请输入节点IP地址"></el-input>
      </el-form-item>
      <el-form-item label="端口" prop="port">
          <el-input v-model.number="ruleForm.port" ></el-input>
      </el-form-item>
      <el-form-item label="节点登陆用户名" prop="user">
          <el-input v-model="ruleForm.user" placeholder="请输入节点登陆用户名"></el-input>
      </el-form-item>
      <el-form-item label="节点登陆密码" prop="password">
          <el-input type="password" v-model="ruleForm.password" placeholder="请输入节点登陆密码"></el-input>
      </el-form-item>
      <el-form-item label="应用路径" prop="apppath">
          <el-input v-model="ruleForm.apppath" placeholder="例如:/u01/user/domain/neusoft/app/eapdomain" ></el-input>
      </el-form-item>
      <el-form-item label="启服务脚本路径" prop="startpath">
          <el-input v-model="ruleForm.startpath" placeholder="例如:/u01/user/domain/neusoft/bin/s"></el-input>
      </el-form-item>
      <el-form-item label="停服务脚本路径" prop="stoppath">
          <el-input v-model="ruleForm.stoppath" placeholder="例如:/u01/user/domain/neusoft/bin/k"></el-input>
      </el-form-item>
      <el-form-item label="清缓存脚本路径" prop="clearpath">
          <el-input v-model="ruleForm.clearpath" placeholder="例如:/u01/user/domain/neusoft/bin/kill.sh"></el-input>
      </el-form-item>
      <el-form-item label="日志存放路径" prop="logpath">
          <el-input v-model="ruleForm.logpath" placeholder="例如:/u01/user/domain/neusoft/bin/app.out"></el-input>
      </el-form-item>
      <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')"> {{this.nodeId ?'更新':'创建'}} </el-button>
          <el-button @click="resetForm('ruleForm')" :disabled = "this.nodeId?true:false" >重置</el-button>
          <el-button  icon="el-icon-back"  @click="goback()">返回</el-button>
      </el-form-item>
      </el-form>
    </div>
</template>

<script>
  export default {
    data() {
      return {
        ruleForm: {
          name: '',
          ip: '',
          port: 22,
          user: '',
          password: '',
          apppath: '',
          startpath: '',
          stoppath: '',
          clearpath:'',
          logpath:''
        },
        rules: {
          name: [
            { required: true, message: '请输入节点名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          ip: [
            { required: true, validator:this.IpRules, trigger: 'blur' }
          ],
          port: [
            { required: true, message: '请输入端口', trigger: 'blur' },
            { type : 'number' ,message:'端口必须是数字',trigger:'blur' }
          ],
          user: [
            { required: true, message: '请输入节点登陆用户名', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入节点登陆密码', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入节点登陆密码', trigger: 'blur' }
          ],
          apppath: [
            { required: true, message: '请输入应用路径', trigger: 'blur' }
          ],
          startpath: [
            { required: true, message: '请输入启服务脚本路径', trigger: 'blur' }
          ],
          stoppath: [
            { required: true, message: '请输入停服务脚本路径', trigger: 'blur' }
          ],
          clearpath: [
            { required: true, message: '请输入清缓存脚本路径', trigger: 'blur' }
          ],
          logpath: [
            { required: true, message: '请输入日志存放路径', trigger: 'blur' }
          ],
        },
        nodeId:null
      };
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$store.dispatch(this.nodeId?'updateNode':'addNode', this.ruleForm).then(() => {
            this.$router.push({
              path: '/'
            })
            }).catch(() => {
              this.$message({message: '添加节点信息失败',type: 'warning',duration:2000})
              return false
            })
          } else {
            this.$message({message: '表单校验未通过',type: 'warning',duration:2000})
            return false
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields()
      },
      goback(){
          this.$router.push({
              path: '/'
            })
      },
      IpRules(rule, value, callback) { 
          const reg = /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))/ 
          if (!value) { return callback(new Error('请输入IP地址')) } 
          else if (!reg.test(value)) { return callback(new Error('IP地址格式错误')) } 
          else { callback() } 
      }
    },
    created(){
      if(this.$route.params.id){
        this.nodeId = this.$route.params.id
        this.$store.dispatch('getNodeById',this.nodeId).then((data)=>{
          this.ruleForm = data
        }).catch(()=>{
          this.$message({message: '获取节点信息失败',type: 'warning',duration:2000});
          return false;
        })
      }
    }
  }
</script>