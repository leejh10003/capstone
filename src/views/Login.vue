<template>
  <div class="container">
    <div class="background"/>
    <div class="filter" />
    <el-form ref="form" id="form" @submit.prevent="login">
      <h2>Sign in to Fluvid</h2>
      <el-form-item label="email">
        <el-input type="email" v-model="email" placeholder="Email address..." />
      </el-form-item>
      <el-form-item label="password">
        <el-input type="password" v-model="password" placeholder="password..." />
      </el-form-item>
      <el-button-group>
        <el-button @click="signup">sign up</el-button>
        <el-button type="primary" @click="login">sign in</el-button>
      </el-button-group>
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
#form{
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
  name: 'Login',
  async created() {
    try{
      (await Auth.currentAuthenticatedUser())
      this.$router.push('/projects')
    } catch {
      console.log('not logged in')
    }
  },
  methods: {
    signup(){
      this.$router.push('/register')
    },
    async login() {
      this.$vs.loading({
        type: 'corners',
        scale: 4,
        text: '로그인 중...'
      })
      try {
        await Auth.signIn(this.email, this.password);
        this.$router.push('/projects')
      } catch (error) {
        alert(error.message);
      } finally {
        this.$vs.loading.close()
      }
    },
  },
  data() {
    return {
      email: '',
      password: ''
    }
  },
}
</script>