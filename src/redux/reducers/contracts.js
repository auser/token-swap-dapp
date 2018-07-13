import * as constants from '../constants'

const initialState = {
}

export const contractsReducer = (state = initialState, action) => {
  switch(action.type) {
    case constants.CONTRACT_LOADING_CONTRACT:
      return {
        ...state,
        [action.payload.name]: true
      }
    case constants.CONTRACT_LOADED:
      return {
        ...state,
        [action.payload.name]: action.payload.contract
      }
    default:
      return state
  }
}