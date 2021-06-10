<template>
  <div>
    {{projects}}
  </div>
</template>
<script>
import gql from 'graphql-tag'
export default {
  data(){
    return {
      projects: null
    }
  },
  apollo: {
    $subscribe: {
      projects: {
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