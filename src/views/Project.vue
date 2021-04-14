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
      variables: function (){
        return {
          project_id: this.$route.params.id
        }
      },
      query: gql`query projects($project_id: bigint!){
        projects(where: {id : {_eq: $project_id}}) {
          id
          videos {
            exif
            filename
            id
            size
          }
          tracks {
            id
            clips {
              current_editor
              id
              track_offset_time
              video_offset_time
              played_time
              video{
                exif
                filename
                id
                size
              }
            }
          }
        }
      }
      `,
      subscribeToMore: {
        variables: function (){
          return {
            project_id: this.$route.params.id
          }
        },
        document: gql`subscription projectsSubscription($project_id: bigint!) {
          projects(where: {id : {_eq: $project_id}}) {
            id
            videos {
              exif
              filename
              id
              size
            }
            tracks {
              id
              clips {
                current_editor
                id
                track_offset_time
                video_offset_time
                played_time
                video{
                  exif
                  filename
                  id
                  size
                }
              }
            }
          }
        }
        `,
        updateQuery: (previousResult, { subscriptionData }) => {
          return subscriptionData.data
        },
      }
    },
  }
}
</script>