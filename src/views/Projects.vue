<template>
  <div id="projects">
    <vs-navbar type="gradient" id="navbar" color="white" class="nabarx">
      <template #title>
        <vs-navbar-title>
          Fluvid
        </vs-navbar-title>
      </template>
      <vs-navbar-item index="0">
        <a @click="logout">로그아웃</a>
      </vs-navbar-item>
    </vs-navbar>
    <div v-if="projects">
      <vs-row v-for="(row, index) in splitSix(projects)" :key="`row${index}`" vs-justify="space-around">
        <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-lg="3" vs-sm="6" vs-xs="12" v-for="project in row" :key="`project${project.id}`">
          <slate-new-project v-if="project.append" :project="project" />
          <slate-project v-else :project="project" />
        </vs-col>
      </vs-row>
    </div>
  </div>
</template>
<style>
#navbar{
  background: white;
}
#projects{
  background-image:url('~@/assets/cork.jpg');
  min-height: 100vh;
}
</style>
<script>
import gql from 'graphql-tag'
import SlateNewProject from '../components/SlateNewProject.vue'
import SlateProject from '../components/SlateProject.vue'
import { Auth } from 'aws-amplify';
export default {
  components: {
    'slate-new-project': SlateNewProject,
    'slate-project': SlateProject
  },
  async created(){
    try{
      (await Auth.currentAuthenticatedUser())
    } catch {
      this.$router.push('/login')
    }
  },
  data(){
    return {
      projects: null
    }
  },
  methods: {
    async logout(){
      this.$vs.loading({
        type: 'corners',
        scale: 4,
        text: '로그아웃 중...'
      })
      await Auth.signOut()
      this.$router.push('/login')
      this.$vs.loading.close()
    },
    splitSix(projects){
      var index = 0;
      var tempArray = [];
      
      for (index = 0; index < projects.length; index += 6) {
          var chunk = projects.slice(index, index+6);
          // Do something if you want with the group
          tempArray.push(chunk);
      }

      return tempArray;
    },
  },
  apollo: {
    $subscribe: {
      projects: {
        query: gql`subscription{
          projects(order_by: {id: desc}) {
            id
            length
            name
            permissions(order_by: {user_id: asc}, limit: 3){
              user{
                id
                name
                email
              }
            }
            permissions_aggregate{
              aggregate{
                count
              }
            }
            videos(order_by: {id: desc}, limit: 1){
              key
            }
          }
        }
        `,
        result: function ({ data }) {
          this.projects = [{
            append: true
          }].concat(data.projects)
        },
      }
    }
  }
}
</script>