import * as constants from '../constants'

export const checkWhitelisted = (acc) => (dispatch, getState) => {
  dispatch({type: constants.CHECKING_WHITELIST})
}