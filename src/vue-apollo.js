import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { setContext } from '@apollo/link-context'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { Auth } from 'aws-amplify'
Vue.use(VueApollo)

const authLink = setContext(async(_, { headers }) => {
  try {
    const applyToken = await (await (Auth.currentSession())).getIdToken().getJwtToken()
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${applyToken}`
      }
    }
  } catch (e) {
    localStorage.removeItem('token')
  }
})

const httpLink = new HttpLink({
  uri: process.env.VUE_APP_GRAPHQL_HTTP || 'https://nle-frontend.jeontuk-11.link/graphql/v1/graphql',
});

const wsLink = new WebSocketLink({
  uri: process.env.VUE_APP_GRAPHQL_WS || 'wss://nle-frontend.jeontuk-11.link/graphql/v1/graphql',
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: async () => {
      const applyToken = await (await (Auth.currentSession())).getIdToken().getJwtToken()
      return {
        headers: {
          Authorization: `Bearer ${applyToken}`
        }
      }
    }
  },
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  httpLink,
);

const apolloClient = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})
