import { createStore } from 'vuex'
import contacts from './modules/contacts'
import sms from './modules/sms'

export default createStore({
  modules: {
    contacts,
    sms
  }
})
