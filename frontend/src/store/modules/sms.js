import api from '../../services/api'

const state = {
  history: [],
  loading: false,
  error: null,
  sending: false
}

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_SENDING(state, sending) {
    state.sending = sending
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_HISTORY(state, history) {
    state.history = history
  },
  ADD_TO_HISTORY(state, smsRecord) {
    state.history.unshift(smsRecord)
  }
}

const actions = {
  async loadHistory({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const response = await api.getSmsHistory()
      commit('SET_HISTORY', response.data)
    } catch (error) {
      commit('SET_ERROR', 'Erreur lors du chargement de l\'historique')
      console.error(error)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async sendSms({ commit }, { phoneNumbers, message, contactIds, service }) {
    commit('SET_SENDING', true)
    commit('SET_ERROR', null)
    try {
      const payload = { phoneNumbers, message, contactIds };
      let response;
      if (service === 'vonage') {
        response = await api.sendVonageSms(payload);
      } else {
        response = await api.sendSms(payload);
      }
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'envoi du SMS'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_SENDING', false)
    }
  },

  async sendSmsToContact({ commit }, { contactId, message }) {
    commit('SET_SENDING', true)
    commit('SET_ERROR', null)
    try {
      const response = await api.sendSmsToContact(contactId, message)
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'envoi du SMS'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_SENDING', false)
    }
  }
}

const getters = {
  smsHistory: state => state.history,
  isLoading: state => state.loading,
  isSending: state => state.sending,
  getError: state => state.error,
  recentSms: state => state.history.slice(0, 10)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
