const { verifyToken } = require('../utils/jwt')
const { saveConnection } = require('../utils/dynamo')

exports.handler = async (event) => {
  try {
    const token = event.queryStringParameters?.token
    if (!token) {
      return { statusCode: 401, body: 'Missing token' }
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return { statusCode: 401, body: 'Invalid or expired token' }
    }

    const { connectionId } = event.requestContext
    const groupId = event.queryStringParameters?.groupId || 'default'

    await saveConnection(connectionId, decoded.userId, groupId)

    return { statusCode: 200, body: JSON.stringify({ connectionId, groupId }) }
  } catch (err) {
    console.error('Connect error:', err)
    return { statusCode: 500, body: 'Connect failed' }
  }
}
