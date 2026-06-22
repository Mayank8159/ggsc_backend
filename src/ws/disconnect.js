const { removeConnection } = require('../utils/dynamo')

exports.handler = async (event) => {
  try {
    const { connectionId } = event.requestContext
    await removeConnection(connectionId)
    return { statusCode: 200, body: 'Disconnected' }
  } catch (err) {
    console.error('Disconnect error:', err)
    return { statusCode: 500, body: 'Disconnect failed' }
  }
}
