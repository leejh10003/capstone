<template>
  <div>
    {{projects}}
  </div>
</template>
<script>
import gql from 'graphql-tag'
export default {
  data: {
    projects: null
  },
  apollo: {
    $subscribe: {
      projects: {
        variables: function (){
          return {
            id: this.$route.params.id
          }
        },
        query: gql`subscription{
          projects(order_by: {id: desc}) {
            id
            length
          }
        }
        `,
        result: function ({ data }) {
          this.projects = data.projects
        },
      }
    }
  }
}
</script>