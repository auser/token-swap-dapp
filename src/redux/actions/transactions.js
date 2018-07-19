import * as constants from '../constants'

export const handleSingleTransaction = (pendingTransaction) => (dispatch, getState) => {
  dispatch({
    type: constants.START_SINGLE_TRANSACTION,
    payload: pendingTransaction
  })
}
