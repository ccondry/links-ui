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
      showSessionInfoModal: false,
      iframe: ''
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
      'isUccx',
      'isPcce',
      'isCjp',
      'isRcdn',
      'isUpstream',
      'sessionInfo',
      'isInstantDemo',
      'userId',
      'datacenter',
      'sessionId',
      'sessionInfoError',
      'demoConfig'
    ])
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

#contact-toggle-button {
  top: 35%;
  right: 0 !important;
  position: fixed;
  -webkit-transform: rotate(-90deg);
  transform: rotate(-90deg);
  -webkit-transform-origin: 100% 100%;
  transform-origin: 100% 100%;
  color: white;
  background-color: var(--color-1);
  border-color: var(--color-1);
}

#contact-toggle-button:hover {
  background-color: var(--color-2);
  border-color: var(--color-2);
}

#contact-panel {
  // calculate height based on how many options are enabled
  top: calc(4em + 20% - var(--active-options) * 20px);
  min-width: 450px;
  right: 0 !important;
  position: fixed;
  -webkit-transform-origin: 100% 100%;
  transform-origin: 100% 100%;
  // slide the drawer out
  // -webkit-transition:right .5s ease;
  // transition:right .5s ease;
  .card {
    // nice rounded corners
    border-radius: 1em;
    // hide anything that flows over the rounded corners
    overflow: hidden;
  }
}

// slide the drawer out
.slide-enter-active {
  transition: 0.5s;
}
.slide-enter {
  transform: translate(100%, 0);
}

// slide the drawer back in
.slide-leave-active {
  transition: 0.5s;
}
.slide-leave-to {
  transform: translate(100%, 0);
}

.contact-title {
  font-size: 1.5em;
  font-weight: normal !important;
  padding-top: 0.1em;
  padding-bottom: 0.1em;
}

.contact-content {
  padding-top: 0.4em !important;
  padding-bottom: 0.0em !important;
}

.contact-item {
  // font-size: 0.8em;
  // line-height: 0.5em;
  // .content {
  //   left: 5em;
  //   position: absolute;
  // }
  .card-footer-item {
    border-right: none !important;
    padding-top: 0.4em;
    padding-bottom: 0.4em;
    .contact-icon {
      color: var(--color-1);
    }
    .content {
      width: 100%;
      h4 {
        margin-bottom: 0px;
        small {
          font-size: 16px !important;
          color: var(--color-1);
        }
      }
    }
  }
}

.contact-item:hover {
  border-left:4px solid var(--color-2);
  padding-left:0;
  .contact-icon {
    color: var(--color-2);
  }
}

.contact-icon {
  padding-left: 0.5em;
  padding-right: 1em;
  max-width: 4em;
}

.contact-close-icon {
  color: var(--color-1);
}

.contact-close-icon:hover {
  color: var(--color-2);
}

.contact-subtext {
  max-width: 95%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: black;
}
</style>
