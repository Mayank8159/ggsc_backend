const { verifyToken } = require('../utils/jwt')
const { saveConnection } = require('../utils/dynamo')

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE

exports.handler = async (event) => {
  console.log('$connect invoked', JSON.stringify({
    connectionId: event.requestContext?.connectionId,
    queryParams: event.queryStringParameters,
    table: CONNECTIONS_TABLE,
  }))

  try {
    const token = event.queryStringParameters?.token
    if (!token) {
      console.warn('$connect: missing token')
      return { statusCode: 401 }
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.warn('$connect: invalid token')
      return { statusCode: 401 }
    }

    const connectionId = event.requestContext?.connectionId
    if (!connectionId) {
      console.error('$connect: missing connectionId')
      return { statusCode: 500 }
    }

    const groupId = event.queryStringParameters?.groupId || 'default'

    console.log('$connect: saving connection', { connectionId, userId: decoded.userId, groupId })
    await saveConnection(connectionId, decoded.userId, groupId)
    console.log('$connect: connection saved')

    return { statusCode: 200 }
  } catch (err) {
    console.error('$connect: unhandled error', err)
    return { statusCode: 500 }
  }
}
