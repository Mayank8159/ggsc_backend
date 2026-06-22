const { verifyToken } = require('../utils/jwt')
const { saveConnection } = require('../utils/dynamo')

exports.handler = async (event) => {
  try {
    const token = event.queryStringParameters?.token
    if (!token) {
      return { statusCode: 401 }
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return { statusCode: 401 }
    }

    const connectionId = event.requestContext?.connectionId
    if (!connectionId) {
      console.error('Missing connectionId in requestContext')
      return { statusCode: 500 }
    }

    const groupId = event.queryStringParameters?.groupId || 'default'

    await saveConnection(connectionId, decoded.userId, groupId)

    return { statusCode: 200 }
  } catch (err) {
    console.error('$connect failed:', err)
    return { statusCode: 500 }
  }
}
