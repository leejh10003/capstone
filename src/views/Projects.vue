<template>
  <div id="projects">
    <vs-row v-for="(row, index) in splitThree(projects)" :key="`row${index}`" vs-justify="space-around">
      <div v-for="project in row" :key="`project${project.id}`">
        <div v-if="project.append" class="slate-card">
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
        <div v-else class="slate-card" @click="clickCard(project)">
          <div class="upper-stripe" />
          <div class="lower-stripe" />
          <div class="slate-content">
            <div class="prod">Prod.</div>
            <div class="slate-placeholder">
              <div class="slate-placeholder-flex">ROLL</div>
              <div class="slate-placeholder-flex border-placeholder">SCENE</div>
              <div class="slate-placeholder-flex">TAKE</div>
            </div>
            <div class="collaborator">
              <span class="users-title">작업자.</span>
              <div class="users">
                <vs-chip v-for="user in getUsers(project)" :key="`${project.id}-${user.user_id}`">
                  <vs-avatar :text="user.initial"/>
                  {{user.name}}
                </vs-chip>
                <vs-chip v-if="project.permissions_aggregate.aggregate.count > 4">
                  <vs-avatar text="+"/>
                  +{{project.permissions_aggregate.aggregate.count - 3}}명
                </vs-chip>
              </div>
            </div>
            <video autoplay loop muted v-if="project.videos.length > 0" class="thumbnail" :src="`https://editassets185420-dev.s3.ap-northeast-2.amazonaws.com/public/${project.videos[0].key.replaceAll(' ', '+')}`" />
            <div class="thumbnail-no-video" v-else>No video</div>
          </div>
        </div>
      </div>
    </vs-row>
  </div>
</template>
<style>
.new-project{
  text-align: center;
}
.center{
  font-size: 150px;
  text-align: center;
}
#projects{
  background-image:url('~@/assets/cork.jpg')
}
.users{
  display: flex;
  flex-direction: row;
  align-items: center;
}
.thumbnail-no-video{
  margin-top: 10px;
  width: 70px;
  height: 70px;
  background-color: grey;
  border-radius: 15px;
  color: #3d3d3d;
  text-align: center;
  align-items: center;
  display: flex;
  justify-content: center;
}
.thumbnail{
  margin-top: 10px;
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 15px;
}
.users-title{
  margin-right: 10px;
  align-self: center;
}
.collaborator{
  margin-top: 4px;
  display: flex;
}
.slate-content{
  margin: 15px;
  text-align: left;
  font-weight: 800;
}
.slate-placeholder{
  display: flex;
  flex-direction: row;
}
.border-placeholder{
  border-left: solid 1px black;
  border-right: solid 1px black;
}
.slate-placeholder-flex{
  flex: 1 1;
  height: 80px;
  text-align: center;
  border-top: solid 1px black;
  border-bottom: solid 1px black;
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
.slate-card:hover {
  box-shadow: 0px 9px 36px 20px rgba(0,0,0,0.1);
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
<script>
import gql from 'graphql-tag'
export default {
  data(){
    return {
      projects: null
    }
  },
  methods: {
    splitThree(projects){
      var index = 0;
      var tempArray = [];
      
      for (index = 0; index < projects.length; index += 3) {
          var chunk = projects.slice(index, index+3);
          // Do something if you want with the group
          tempArray.push(chunk);
      }

      return tempArray;
    },
    clickCard(project){
      this.$router.push(`/drag/${project.id}`)
    },
    getUsers(element) {
      return element.permissions.map((permission) => ({
        name: permission.name,
        initial: permission.name.replace(/\s+/, ' ').split(' ').map((text) => text.charAt(0).toUpperCase()).slice(0, 2).join('')
      }))
    }
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
              name
              user_id
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