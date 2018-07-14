import * as constants from '../constants'

const initialState = {
}

export const contractsReducer = (state = initialState, action) => {
  switch(action.type) {
    case constants.CONTRACTS_LOADED:
      return {
        ...state,
        [action.payload.name]: action.payload.contract
      }
    default:
      return state
  }
}