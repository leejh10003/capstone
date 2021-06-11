<template>
  <div class="slate-card" @click="openPrompt">
    <vs-prompt
    @cancel="name=''"
    @accept="createProject"
    accept-text="생성"
    title="새 프로젝트 생성"
    cancel-text="취소"
    :active.sync="activePrompt">
      <div class="con-exemple-prompt">
        프로젝트 이름을 입력해주세요...
        <vs-input placeholder="프로젝트명" v-model="name"/>
      </div>
    </vs-prompt>
    <div class="upper-stripe" />
    <div class="lower-stripe" />
    <div class="slate-content">
      <div class="center">
        +
      </div>
      <div class="new-project">
        새 프로젝트 생성...
      </div>
    </div>
  </div>
</template>
<script>
import gql from 'graphql-tag'
export default {
  methods: {
    openPrompt(){
      this.activePrompt = true
    },
     async createProject (){
       const { data: { insert_projects_one: { id } } } = await this.$apollo.mutate({
         variables: {
           name: this.name
         },
         mutation: gql`mutation($name: String!){
           insert_projects_one(object:{name: $name}){
            id
          }
         }`
       })
       console.log(id)
       this.$router.push(`/project/${id}`)
     }
  },
  data(){
    return {
      name: null,
      activePrompt: false
    }
  }
}
</script>
<style>
.new-project{
  text-align: center;
}
.slate-content{
  margin: 15px;
  text-align: left;
  font-weight: 800;
}
.center{
  font-size: 150px;
  text-align: center;
}
.slate-card{
  border-radius: 15px;
  box-shadow: 0px 9px 36px 11px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease-in-out;
  width: 300px;
  height: 300px;
  margin-bottom: 50px;
  margin-top: 50px;
  background-color: white;
}
.upper-stripe{
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  width: 300px;
  height: 25px;
  background: repeating-linear-gradient(
    45deg,
    #F3F3F3,
    #F3F3F3 20px,
    #3f3f3f 20px,
    #3f3f3f 40px
  );
}
.lower-stripe{
  width: 300px;
  height: 25px;
  background: repeating-linear-gradient(
    135deg,
    #F3F3F3,
    #F3F3F3 20px,
    #3f3f3f 20px,
    #3f3f3f 40px
  );
}
</style>