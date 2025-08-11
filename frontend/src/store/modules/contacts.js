import api from '../../services/api'

const state = {
  contacts: [],
  loading: false,
  error: null
}

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_CONTACTS(state, contacts) {
    state.contacts = contacts
  },
  ADD_CONTACT(state, contact) {
    state.contacts.push(contact)
  },
  UPDATE_CONTACT(state, updatedContact) {
    const index = state.contacts.findIndex(c => c.id === updatedContact.id)
    if (index !== -1) {
      state.contacts.splice(index, 1, updatedContact)
    }
  },
  DELETE_CONTACT(state, contactId) {
    state.contacts = state.contacts.filter(c => c.id !== contactId)
  }
}

const actions = {
  async loadContacts({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const response = await api.getContacts()
      commit('SET_CONTACTS', response.data)
    } catch (error) {
      commit('SET_ERROR', 'Erreur lors du chargement des contacts')
      console.error(error)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addContactsFromCsv({ commit, dispatch }, file) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const response = await api.addContactsFromCsv(file);
      await dispatch('loadContacts');
      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'ajout des contacts depuis le fichier CSV';
      commit('SET_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async addContact({ commit }, contact) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const response = await api.addContact(contact)
      commit('ADD_CONTACT', response.data)
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'ajout du contact'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateContact({ commit }, { id, contact }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const response = await api.updateContact(id, contact)
      commit('UPDATE_CONTACT', response.data)
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour du contact'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteContact({ commit }, contactId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await api.deleteContact(contactId)
      commit('DELETE_CONTACT', contactId)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression du contact'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  allContacts: state => state.contacts,
  contactsCount: state => state.contacts.length,
  isLoading: state => state.loading,
  getError: state => state.error,
  getContactById: state => id => state.contacts.find(c => c.id === id)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
