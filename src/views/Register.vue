<template>
  <div class="container">
    <form @submit.prevent="register" v-if="!confirm">
      <h2>Register</h2>
      <input
        type="email"
        v-model="email"
        placeholder="Email address..."
      />
      <input
        type="password"
        v-model="password"
        placeholder="password..."
      />
      <button>Register</button>
    </form>
    <form @submit.prevent="confirmAmplify" v-if="confirm">
      <input
        v-model="confirmationCode"
        placeholder="confirmation code..."
      />
      <button>confirm</button>
    </form>
  </div>
</template>
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