<template>
  <div class="container">
    <div class="background"/>
    <div class="filter" />
    <el-form ref="form" class="form" @submit.prevent="register" v-if="!confirm">
      <h2>Register to Fluvid</h2>
      <el-form-item label="email">
        <el-input type="email" v-model="email" placeholder="Email address..." />
      </el-form-item>
      <el-form-item label="password">
        <el-input type="password" v-model="password" placeholder="password..." />
      </el-form-item>
      <el-button @click="register">Register</el-button>
    </el-form>
    <el-form class="form" @submit.prevent="confirmAmplify" v-if="confirm">
      <h2>Register to Fluvid</h2>
      <el-form-item label="code">
        <el-input
          v-model="confirmationCode"
          placeholder="confirmation code..."
        />
      </el-form-item>
      <el-button @click="confirmAmplify">confirm</el-button>
    </el-form>
  </div>
</template>
<style>
.background{
  position: absolute;
  height: 100vh;
  background-image:url('~@/assets/cork.jpg');
  width: 100vw;
}
.filter{
  position: absolute;
  height: 100vh;
  width: 100vw;
  backdrop-filter: blur(5px);
}
.form{
    box-shadow: 0px 5px 20px 0px rgb(0 0 0 / 5%);
    border-radius: 20px;
    width: 300px;
    position: absolute;
    padding: 30px;
    margin-left: calc(50vw - 150px);
    margin-top: calc(50vh - 169px);
    background-color: white;
}
</style>
<script>
import { Auth } from 'aws-amplify';
export default {
  data () {
    return {
      email: '',
      password: '',
      confirm: false,
      confirmationCode: null,
      username: null,
    }
  },
  methods: {
    async confirmAmplify(){
      await Auth.confirmSignUp(this.username, this.confirmationCode);
      this.$router.pusy("/login")
    },
    async register() {
      try {
        const authResult = await Auth.signUp({
          username: this.email,
          password: this.password,
        });
        this.username = authResult.user.getUsername()
        this.confirm = true
      } catch (error) {
        alert(error.message);
      }
    },
  }
}
</script>