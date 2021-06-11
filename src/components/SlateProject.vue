<template>
  <div class="slate-card">
    <el-dialog
      :visible.sync="naming"
      width="30%"
      :before-close="handleCloseNaming">
      <div class="con-exemple-prompt">
        고칠 프로젝트 이름을 적어 주세요
      </div>
      <el-input v-model="name"/>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="changeName" :loading="changing">적용</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="activePrompt"
      width="30%"
      :before-close="handleClose">
      <div @click.stop class="con-exemple-prompt">
        추가할 팀원의 이메일 이름을 적어주세요<br/>
        <el-autocomplete
          autocomplete
          :fetch-suggestions="search"
          @select="handleSelect"
          class="selectExample"
          label="이메일"
          v-model="user.email"
          value-key="value"
          />
        <div class="permissions">
          <vs-radio v-model="permission" vs-name="permission" vs-value="admin">admin</vs-radio>
          <vs-radio v-model="permission" vs-name="permission" vs-value="participants">participants</vs-radio>
          <vs-button @click.stop="addUser" size="small" color="danger" type="gradient" icon="person_add"></vs-button>
        </div>
        <div style="height: 10px"/>
        <span v-for="permission in users" :key="permission.user.id">
          <vs-chip v-if="permission.user.id === selfId">
            {{permission.user.email}} {{permission.role}}
          </vs-chip>
          <vs-chip v-else closable @click="remove(permission)">
            {{permission.user.email}} {{permission.role}}
          </vs-chip>
        </span>
      </div>
    </el-dialog>
    <div class="upper-stripe" />
    <div class="lower-stripe" />
    <div class="slate-content">
      <div class="prod">Prod.</div>
      <div class="slate-placeholder">
        <div class="slate-placeholder-flex">ROLL</div>
        <div class="slate-placeholder-flex border-placeholder">SCENE</div>
        <div class="slate-placeholder-flex">TAKE</div>
      </div>
        <div class="users">
          <vs-tooltip v-for="user in getUsers(project)" :key="`${project.id}-${user.id}`" :text="user.name">
            <vs-avatar size="small" :text="user.initial"/>
          </vs-tooltip>
          <vs-chip v-if="project.permissions_aggregate.aggregate.count > 4">
            <vs-avatar text="+"/>
            +{{project.permissions_aggregate.aggregate.count - 3}}명
          </vs-chip>
          <div style="flex-basis: auto"/>
          <vs-tooltip text="참여자 관리" class="participants">
            <vs-button @click.stop="participantsManage" size="small" color="danger" type="gradient" icon="person"></vs-button>
          </vs-tooltip>
        </div>
      <div class="bottom">
        <video autoplay loop muted v-if="project.videos.length > 0" class="thumbnail" :src="`https://editassets185420-dev.s3.ap-northeast-2.amazonaws.com/public/${project.videos[0].key.replaceAll(' ', '+')}`" />
        <div class="thumbnail-no-video" v-else>No video</div>
        <div class="name">
          <div>프로젝트명<span style="color: grey" @click="naming = true"> (수정)</span></div>
          <div v-line-clamp="2" class="name-field">{{project.name}}</div>
        </div>
        <vs-button  @click="clickCard(project)" class="edit-button" size="small" color="primary" type="gradient" icon="edit"></vs-button>
      </div>
    </div>
  </div>
</template>
<style>
.con-exemple-prompt{
  padding-bottom: 30px;
}
.edit-button{
  margin-left: auto;
}
.con-exemple-prompt{
  text-align: left;
}
.permissions{
  display: flex;
  flex-direction: row;
}
.participants{
  margin-left: auto;
}
.name-field{
  max-width: 190px
}
.name{
  margin-top: 0px;
  margin-left: 10px;
  display:flex;
  flex-direction: column;
}
.bottom{
  display: flex;
  flex-direction: row;
}
.users{
  display: flex;
  flex-direction: row;
  align-items: center;
}
.thumbnail-no-video{
  margin-top: 0px;
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
.center{
  font-size: 150px;
  text-align: center;
}
</style>
<script>
import { Auth } from 'aws-amplify'; // eslint-disable-line no-unused-vars
import gql from 'graphql-tag'
export default {
  props:{
    project: Object
  },
  data() {
    return {
      user: {
        email: null
      },
      name: '',
      activePrompt: false,
      users: [],
      completion: [],
      selfId: null,
      permission: 'participants',
      naming: false,
      changing: false,
    }
  },
  methods: {
    clickCard(project){
      this.$router.push(`/drag/${project.id}`)
    },
    async changeName(){
      this.changing = true
      await this.$apollo.mutate({
        variables: {
          projectId: this.project.id,
          name: this.name
        },
        mutation: gql`mutation($projectId: bigint!, $name: String!){
          update_projects_by_pk(pk_columns: {id: $projectId}, _set: {name: $name}){
            id
          }
        }`
      })
      this.changing = false
      this.naming = false
    },
    async addUser(){
      console.log(this.user, this.permission)
      await this.$apollo.mutate({
        variables: {
          projectId: this.project.id,
          userId: this.user.id,
          permission: this.permission
        },
        mutation: gql`mutation($projectId: Int!, $userId: String!, $permission: String!){
          insert_permission_one(object: {project_id: $projectId, user_id: $userId, role: $permission}){
            user_id
          }
        }`
      })
      const { data: { permission } } = await this.$apollo.query({
        variables: {
          projectId: this.project.id
        },
        fetchPolicy: 'network-only',
        query: gql`query($projectId: Int!){
          permission(where: {project_id: {_eq: $projectId}}, order_by: {user_id: asc}){
            role
            user{
              id
              name
              email
            }
          }
        }`
      })
      this.users = permission
    },
    handleClose(){
      this.activePrompt = false
    },
    handleCloseNaming(){
      this.naming = false
    },
    handleSelect(result) {
      this.user = result
      console.log(this.user)
    },
    async participantsManage(){
      const { attributes : { sub } } = await Auth.currentAuthenticatedUser()
      this.selfId = sub
      this.activePrompt = true
      const { data: { permission } } = await this.$apollo.query({
        variables: {
          projectId: this.project.id
        },
        fetchPolicy: 'network-only',
        query: gql`query($projectId: Int!){
          permission(where: {project_id: {_eq: $projectId}}, order_by: {user_id: asc}){
            role
            user{
              id
              name
              email
            }
          }
        }`
      })
      this.users = permission
    },
    async remove(input){
      const { attributes : { sub } } = await Auth.currentAuthenticatedUser()
      if (input.user.id !== sub){
        await this.$apollo.mutate({
          variables: {
            projectId: this.project.id,
            userId: input.user.id
          },
          mutation: gql`mutation($projectId: Int!, $userId: String!){
            delete_permission_by_pk(project_id: $projectId, user_id: $userId){
              user_id
              project_id
            }
          }`
        })
        const { data: { permission } } = await this.$apollo.query({
          variables: {
            projectId: this.project.id
          },
          fetchPolicy: 'network-only',
          query: gql`query($projectId: Int!){
            permission(where: {project_id: {_eq: $projectId}}, order_by: {user_id: asc}){
              role
              user{
                id
                name
                email
              }
            }
          }`
        })
        this.users = permission
      }
    },
    async search(queryString, callback){
      const ids = this.project.permissions.map((permission) => permission.user.id)
      const { data: { user } } = await this.$apollo.query({
        variables: {
          ids,
          email: `%${queryString}%`
        },
        fetchPolicy: 'network-only',
        query: gql`query ($ids: [String!]!, $email: String){
          user(where: {id: {_nin: $ids}, email: {_ilike: $email}}, limit: 3, order_by: {email: asc}){
            id
            name
            email
          }
        }`
      })
      callback(user.map((user) => ({...user, value: user.email})))
    },
    getUsers(element) {
      return element.permissions.map((permission) => {
        const name = (permission?.user?.name || permission.user.email.split('@')[0])
        return {
          name: name,
          id: permission.user.id,
          initial: permission?.user?.name?.replace(/\s+/, ' ')?.split(' ')?.map((text) => text?.charAt(0)?.toUpperCase())?.slice(0, 2).join('') || permission?.user?.email?.charAt(0)?.toUpperCase()
        }
      })
    }
  }
}
</script>