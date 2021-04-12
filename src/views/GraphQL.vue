<template>
  <div>
    {{ projects }}
  </div>
</template>
<script>
import gql from 'graphql-tag'
export default {
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