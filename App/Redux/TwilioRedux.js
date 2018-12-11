import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  getTwilioTokenRequest: ['data'],
  getTwilioTokenSuccess: ['payload'],
  getTwilioTokenFailure: null
})

export const TwilioTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  getTwilioToken: {
    data: null,
    fetching: null,
    payload: null,
    error: null
  }
})

/* ------------- Selectors ------------- */

export const TwilioSelectors = {
  getData: state => state.data
}

/* ------------- Reducers ------------- */

export const getTwilioTokenRequestReducer = (state, { data }) =>
  state.merge({ ...state, getTwilioToken: { fetching: true, data, payload: null } })

export const getTwilioTokenSuccessReducer = (state, { payload }) =>
  state.merge({ ...state, getTwilioToken: { fetching: false, error: null, payload } })

export const getTwilioTokenFailureReducer = state =>
  state.merge({ ...state, getTwilioToken: { fetching: false, error: true, payload: null } })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.GET_TWILIO_TOKEN_REQUEST]: getTwilioTokenRequestReducer,
  [Types.GET_TWILIO_TOKEN_SUCCESS]: getTwilioTokenSuccessReducer,
  [Types.GET_TWILIO_TOKEN_FAILURE]: getTwilioTokenFailureReducer
})
