<template>
  <div>
    {{ projects }}
  </div>
</template>
<script>
import gql from 'graphql-tag'
//import { restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client'
export default {
  created: function (){
    if (this.$apollo.provider.defaultClient.wsClient){
      //restartWebsockets(this.$apollo.provider.defaultClient.wsClient)
    }
  },
  apollo: {
    projects: {
      query: gql`query {
        projects{
          id
        }
      }`,
      fetchPolicy: 'network-only',
      subscribeToMore: {
        fetchPolicy: 'network-only',
        document: gql`subscription {
          projects{
            id
          }
        }`,
        updateQuery: (previousResult, { subscriptionData }) => {
          return subscriptionData.data
        },
      }
    },
  }
}
</script>