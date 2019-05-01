<template>
  <div id="app">
    <b-loading :is-full-page="true" :active="loading.dcloud.sessionInfo" :can-cancel="false"></b-loading>

    <b-modal :active.sync="showSessionInfoModal" :can-cancel="false" has-modal-card width="960">
      <session-form
      @submit="clickSubmitSessionInfo"
      :loading="loading.dcloud.sessionInfo"
      :datacenter="datacenter"
      :session-id="sessionId"
      :session-info="sessionInfo"
      :session-info-error="sessionInfoError"
      />
    </b-modal>

    <span id="main-content" v-if="sessionInfo && sessionInfo.demo">
      <!-- content iframe -->
      <!-- <iframe :src="iframe" class="demo-iframe"></iframe> -->
      dCloud demo links for {{ sessionInfo.demo.toUpperCase() }} {{ sessionInfo.version }}
    </span>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import SessionForm from './components/session-form.vue'

function setQueryStringParameter (name, value) {
  const params = new window.URLSearchParams(window.location.search)
  params.set(name, value)
  window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${params}`))
}

export default {
  created () {
    // get query string and put the object into this component's data
    let uri = window.location.search.substring(1)
    this.qs = new window.URLSearchParams(uri)
  },

  components: {
    SessionForm
  },

  data () {
    return {
      qs: {},
      showSessionInfoModal: false
    }
  },

  async mounted () {
    // set dCloud session ID and datacenter from query parameters
    if (this.qs.get('session')) {
      this.setSessionId(this.qs.get('session'))
    }
    if (this.qs.get('datacenter')) {
      this.setDatacenter(this.qs.get('datacenter'))
    }
    // do we have session ID and datacenter?
    if (this.sessionId && this.datacenter) {
      // get session info data from mm.cxdemo.net
      this.getSessionInfo(false)
    } else {
      // we are missing session ID or datacenter info in query string
      // pop session info modal to get more info from user
      this.showSessionInfoModal = true
    }
  },

  computed: {
    ...mapGetters([
      'loading',
      'sessionInfo',
      'isInstantDemo',
      'datacenter',
      'sessionId',
      'sessionInfoError'
    ]),
    title () {
      if (this.sessionInfo && this.sessionInfo.demo) {
        // session info is valid
        // build HTML page title
        const demo = this.sessionInfo.demo.toUpperCase()
        const version = this.sessionInfo.version
        const instant = this.isInstantDemo ? ' Instant' : ''
        return `dCloud ${demo} ${version}${instant} Demo`
      } else {
        // no session info yet
        return 'dCloud'
      }
    },
    iframe () {
      if (this.sessionInfo && this.sessionInfo.demo) {
        const demo = this.sessionInfo.demo.toLowerCase()
        const version = this.sessionInfo.version
        const instant = this.isInstantDemo ? '-instant' : ''
        // iframe source - this points the main content ifame to different
        // html files for different demos. example UCCX 12.0v2 or PCCE 11.6v3
        return `https://mm-static.cxdemo.net/${demo}/${version}${instant}.html`
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([
      'getSessionInfo',
      'setSessionId',
      'setDatacenter'
    ]),
    clickSubmitSessionInfo (data) {
      // user submitted modal form with dCloud session information
      // set data in state from the modal data
      this.setSessionId(data.sessionId)
      this.setDatacenter(data.datacenter)
      // get session info now
      this.getSessionInfo(false)
    }
  },

  watch: {
    sessionInfo (val) {
      console.log('sessionInfo changed')
      // check if we have actual data
      if (val.demo) {
        // update query string with the data entered into the session modal
        setQueryStringParameter('session', this.sessionId)
        setQueryStringParameter('datacenter', this.datacenter)
      }
    },
    sessionInfoError (val) {
      console.log('sessionInfoError watcher:', val)
      if (!val.status) {
        // undefined error means a non-HTTP REST error was returned,
        // like network error
        // display error message
        this.$dialog.alert({
          title: 'Error Retreiving dCloud Session Info',
          message: `There was an error retreiving your dCloud
          session information. Please refresh the page to try again, or
          contact dCloud support if you continue to have this issue.
          <br />
          <strong>${val}</strong>`,
          type: 'is-danger',
          canCancel: false,
          hasIcon: true,
          icon: 'close-circle',
          iconPack: 'mdi'
        })
      } else if (val.status === 404) {
        // error getting session info. display message
        // session not found - probably user entered invalid data
        // pop session modal again
        this.showSessionInfoModal = true
      } else {
        // other error - display message
        // display error message
        this.$dialog.alert({
          title: 'Error Retreiving dCloud Session Info',
          message: `There was an error retreiving your dCloud
          session information. Please refresh the page to try again, or
          contact dCloud support if you continue to have this issue.
          <br />
          Status Code: <strong>${val.status}</strong>
          <br />
          Error Message: <strong>${val.data}</strong>`,
          type: 'is-danger',
          canCancel: false,
          hasIcon: true,
          icon: 'close-circle',
          iconPack: 'mdi'
        })
      }
    }
  }
}
</script>

<style lang="scss">

html {
  background-color: darkgrey;
  height: 100%;
  overflow: scroll;
  overflow-x: hidden;
}
::-webkit-scrollbar {
    width: 0px;  /* remove scrollbar space */
    background: transparent;  /* optional: just make scrollbar invisible */
}
body {
  height: 100%;
  // overflow-y: scroll;
  // overflow-y: hidden;
}

body:hover {
  // overflow-y: hidden;
}

#app {
  height: 100%;
}

#main-content {
  height: 100%;
}

.demo-iframe {
  height: 100%;
  width: 100%;
  border: 0;
}

</style>
