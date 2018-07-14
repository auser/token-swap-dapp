import * as c from '../constants'

const initialState = {
  isWhitelisted: false,
  checkingWhitelist: false
}
export const syndicateReducer = (state = initialState, action) => {
  switch (action.type) {
    case c.CHECKING_WHITELIST:
      return {
        ...state,
        checkingWhitelist: true
      }
    default:
      return state;
  }
}