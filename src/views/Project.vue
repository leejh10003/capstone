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
      query: gql`query projects{
        projects {
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
              track_offset_frame
              video_offset_frame
              played_frame
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
      fetchPolicy: 'network-only',
      subscribeToMore: {
        fetchPolicy: 'network-only',
        document: gql`subscription projectsSubscription {
          projects {
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
                track_offset_frame
                video_offset_frame
                played_frame
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