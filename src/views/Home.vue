<template>
  <div class="home">
  </div>
</template>

<script>
// @ is an alias to /src
import { Auth } from 'aws-amplify'
export default {
  async created(){
    try{
      (await Auth.currentAuthenticatedUser())
      this.$router.push('/projects')
    } catch {
      this.$router.push('/login')
    }
  },
  name: 'Home',
}
</script>
