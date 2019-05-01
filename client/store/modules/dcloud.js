import * as types from '../mutation-types'
import {load} from '../../utils'
import { Toast } from 'buefy/dist/components/toast'

const getters = {
  // dCloud session ID
  sessionId: state => state.sessionId,
  // dCloud datacenter
  datacenter: state => state.datacenter,
  // dCloud instant demo user ID
  userId: state => state.userId,
  // dCloud session information, including configuraiton
  sessionInfo: state => state.sessionInfo,
  // dCloud session configuration
  sessionConfig: (state, getters) => getters.sessionInfo.configuration || {},
  // is this a UCCX demo?
  isUccx: (state, getters) => getters.sessionInfo.demo === 'uccx',
  // is this a PCCE demo?
  isPcce: (state, getters) => getters.sessionInfo.demo === 'pcce',
  // is this a CJP demo?
  isCjp: (state, getters) => state.datacenter.toLowerCase() === 'cjp',
  // is this an RCDN (Compete Lab) demo?
  isRcdn: (state, getters) => state.datacenter.toLowerCase() === 'rcdn',
  // is this a an instant demo?
  isInstantDemo: (state, getters) => getters.sessionInfo.instant === true,
  // is the configured multichannel type Upstream Works?
  isUpstream: (state, getters) => getters.sessionConfig.multichannel === 'upstream',
  // is the configured multichannel type ECE?
  isEce: (state, getters) => !getters.sessionConfig.multichannel || getters.sessionConfig.multichannel === 'ece',
  // null if no errors, object if errors getting dCloud session info
  sessionInfoError: state => state.sessionInfoError
}

const state = {
  sessionId: '',
  datacenter: '',
  userId: '',
  sessionInfo: {},
  sessionInfoError: null
}

const mutations = {
  [types.SET_SESSION_ID] (state, data) {
    state.sessionId = data
  },
  [types.SET_DATACENTER] (state, data) {
    state.datacenter = data
  },
  [types.SET_USER_ID] (state, data) {
    state.userId = data
  },
  [types.SET_SESSION_INFO] (state, data) {
    state.sessionInfo = data
  },
  [types.SET_SESSION_INFO_ERROR] (state, data) {
    state.sessionInfoError = data
  }
}

const actions = {
  setUserId ({commit}, data) {
    commit(types.SET_USER_ID, data)
  },
  setSessionId ({commit}, data) {
    commit(types.SET_SESSION_ID, data)
  },
  setDatacenter ({commit}, data) {
    commit(types.SET_DATACENTER, data)
  },
  async getSessionInfo ({getters, commit, dispatch}, showNotification = true) {
    try {
      dispatch('setLoading', {group: 'dcloud', type: 'sessionInfo', value: true})
      console.log('loading dcloud session info...')
      const host1 = 'https://mm.cxdemo.net'
      const host2 = 'https://mm-dev.cxdemo.net'
      const path = '/api/v1/datacenters/' + getters.datacenter + '/sessions/' + getters.sessionId
      let response
      try {
        response = await load(host1 + path)
      } catch (e) {
        console.log('failed to load session info from primary host', host1)
        console.log('trying secondary host', host2)
        // try secondary
        response = await load(host2 + path)
      }
      console.log('load dcloud session info:', response)
      commit(types.SET_SESSION_INFO, response.data)
      // set error to null to remove UI error messages
      commit(types.SET_SESSION_INFO_ERROR, null)
      if (showNotification) {
        Toast.open({
          message: 'load dCloud session info succeeded',
          type: 'is-success'
        })
      }
    } catch (e) {
      console.log('error loading dcloud session info', e)
      // Toast.open({
      //   duration: 5000,
      //   message: 'load dCloud session info failed: ' + e.message,
      //   type: 'is-danger'
      // })
      if (e.response) {
        commit(types.SET_SESSION_INFO_ERROR, e.response)
      } else {
        commit(types.SET_SESSION_INFO_ERROR, e)
      }
    } finally {
      dispatch('setLoading', {group: 'dcloud', type: 'sessionInfo', value: false})
    }
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
