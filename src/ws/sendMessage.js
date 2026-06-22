const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const { getConnection, getGroupConnections, saveMessage, getGroupMessages } = require('../utils/dynamo')

const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WS_API_ENDPOINT,
})

exports.handler = async (event) => {
  try {
    const { connectionId } = event.requestContext
    const body = JSON.parse(event.body)
    const { content, action: _action } = body

    const connection = await getConnection(connectionId)
    if (!connection) {
      return { statusCode: 404, body: 'Connection not found' }
    }

    const { userId, groupId } = connection

    if (content === '__fetch_history__') {
      const messages = await getGroupMessages(groupId)
      await sendToConnection(connectionId, {
        type: 'history',
        messages,
        groupId,
      })
      return { statusCode: 200, body: 'History sent' }
    }

    if (!content) {
      return { statusCode: 400, body: 'Content is required' }
    }

    const message = {
      messageId: uuidv4(),
      groupId,
      userId,
      content,
      timestamp: Date.now(),
    }

    await saveMessage(message)

    const connections = await getGroupConnections(groupId)
    const payload = {
      type: 'message',
      message,
    }

    await Promise.allSettled(
      connections.map((c) => sendToConnection(c.connectionId, payload))
    )

    return { statusCode: 200, body: 'Message sent' }
  } catch (err) {
    console.error('sendMessage error:', err)
    return { statusCode: 500, body: 'Failed to send message' }
  }
}

async function sendToConnection(connId, payload) {
  try {
    await apiGateway
      .postToConnection({
        ConnectionId: connId,
        Data: JSON.stringify(payload),
      })
      .promise()
  } catch (err) {
    if (err.statusCode === 410) {
      const { removeConnection } = require('../utils/dynamo')
      await removeConnection(connId)
    } else {
      console.error(`Failed to send to ${connId}:`, err)
    }
  }
}
