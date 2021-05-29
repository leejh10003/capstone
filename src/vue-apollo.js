import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { /*createApolloClient, */restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
// import { Auth } from 'aws-amplify'

// Install the vue plugin
Vue.use(VueApollo)

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Http endpoint

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: process.env.VUE_APP_GRAPHQL_HTTP || 'https://trello.jeontuk-11.link/v1/graphql',
});

// Create the subscription websocket link
const wsLink = new WebSocketLink({
  uri: process.env.VUE_APP_GRAPHQL_WS || 'wss://trello.jeontuk-11.link/v1/graphql',
  options: {
    reconnect: true,
    lazy: true
  },
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  httpLink,
);

// Create the apollo client
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})


// Config
/*const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint: process.env.VUE_APP_GRAPHQL_HTTP || 'http://ec2-13-125-81-43.ap-northeast-2.compute.amazonaws.com:8080/v1/graphql',
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://ec2-13-125-81-43.ap-northeast-2.compute.amazonaws.com:8080/v1/graphql',
  // LocalStorage token
  // tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink

  // Override default cache
  // cache: myCache

  // Override the way the Authorization header is set
  getAuth: async () => {
    try {
      const applyToken = (await Auth.currentSession()).getIdToken()
      return `Bearer ${applyToken.jwtToken}`
    } catch (e) {
      /*await request({
        url: '/jwt/crm/logout',
        method: 'post'
      })
      removeToken()
      location.replace('/#/login')
      console.error(e)
    }
  }

  // Additional ApolloClient options
  // apollo: { ... }

  // Client local data (see apollo-link-state)
  // clientState: { resolvers: { ... }, defaults: { ... } }
}

// Call this in the Vue app file
export function createProvider (options = {}) {
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient({
    ...defaultOptions,
    ...options,
  })
  wsClient.connectionParams = async () => {
    return {
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().jwtToken}`
      }
    }
  }
  apolloClient.wsClient = wsClient
  

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        // fetchPolicy: 'cache-and-network',
      },
    },
    errorHandler (error) {
      // eslint-disable-next-line no-console
      console.log('%cError', 'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;', error.message)
    },
  })

  return apolloProvider
}*/

// Manually call this when user log in
export async function onLogin (apolloClient) {
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (login)', 'color: orange;', e.message)
  }
}

// Manually call this when user log out
export async function onLogout (apolloClient) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN)
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
  }
}
