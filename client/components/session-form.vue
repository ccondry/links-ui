<template>
  <form @submit.prevent="submit">
    <div class="modal-card" style="width: auto">

      <header class="modal-card-head">
        <p class="modal-card-title">Enter your dCloud demo session information</p>
      </header>
      <section class="modal-card-body">

        <!-- <b-loading :is-full-page="false" :active="loading" :can-cancel="false" style="z-index:1;"></b-loading> -->

        <b-field label="Datacenter" :message="datacenterMessage" :type="datacenterType">
          <b-select :disabled="loading" v-model="formData.datacenter" required placeholder="Choose Datacenter">
            <option disabled value="">Choose Datacenter</option>
            <option value="SJC">US West</option>
            <option value="RTP">US East</option>
            <option value="LON">EMEAR</option>
            <option value="SNG">APJ</option>
            <option value="CJP">CJP</option>
            <option value="RCDN">RCDN</option>
          </b-select>
        </b-field>

        <b-field label="Session ID" :message="sessionMessage" :type="sessionType">
          <b-input
          :disabled="loading"
          v-model="formData.sessionId"
          placeholder="123456"
          required />
        </b-field>

      </section>
      <footer class="modal-card-foot">
        <!-- <button class="button" type="button" @click="$parent.close()">Cancel</button> -->
        <button class="button is-success" type="submit">Submit</button>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  props: [
    'datacenter',
    'sessionId',
    'loading',
    'sessionInfo',
    'sessionInfoError'
  ],

  mounted () {
    // copy props to data
    this.formData.datacenter = this.datacenter
    this.formData.sessionId = this.sessionId
  },

  data () {
    return {
      userIdRequired: false,
      userIdMessage: '',
      formData: {
        datacenter: '',
        sessionId: ''
      }
    }
  },

  computed: {
    submitEnabled () {
      return this.formData.datacenter.length &&
      this.formData.sessionId.length >= 6 &&
      !this.loading
    },
    datacenterType () {
      if (this.sessionInfoError) return 'is-danger'
    },
    datacenterMessage () {
      if (this.sessionInfoError) {
        return `Invalid session information. Please check your
        datacenter selection and try again.`
      }
    },
    sessionType () {
      if (this.sessionInfoError) return 'is-danger'
    },
    sessionMessage () {
      if (this.sessionInfoError) {
        return `Invalid session information. Please check your
        session ID and try again.`
      }
    }
  },

  methods: {
    submit ($event) {
      this.$emit('submit', this.formData)
    }
  }
}
</script>

<style lang="scss">
.animation-content {
  width: 50%
}
.modal-card-foot {
  // pull the footer buttons to the right
  justify-content: flex-end !important;
}
</style>
