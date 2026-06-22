const AWS = require('aws-sdk')

const dynamo = new AWS.DynamoDB.DocumentClient()

const USERS_TABLE = process.env.USERS_TABLE
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE
const MESSAGES_TABLE = process.env.MESSAGES_TABLE

function getUserByEmail(email) {
  return dynamo
    .query({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
    })
    .promise()
}

function getUserById(userId) {
  return dynamo
    .get({ TableName: USERS_TABLE, Key: { userId } })
    .promise()
    .then((r) => r.Item)
}

function createUser(user) {
  return dynamo.put({ TableName: USERS_TABLE, Item: user }).promise()
}

function saveConnection(connectionId, userId, groupId) {
  return dynamo
    .put({
      TableName: CONNECTIONS_TABLE,
      Item: {
        connectionId,
        userId,
        groupId,
        connectedAt: Date.now(),
        ttl: Math.floor(Date.now() / 1000) + 86400,
      },
    })
    .promise()
}

function removeConnection(connectionId) {
  return dynamo.delete({ TableName: CONNECTIONS_TABLE, Key: { connectionId } }).promise()
}

function getGroupConnections(groupId) {
  return dynamo
    .query({
      TableName: CONNECTIONS_TABLE,
      IndexName: 'GroupIdIndex',
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: { ':groupId': groupId },
    })
    .promise()
    .then((r) => r.Items)
}

function getConnection(connectionId) {
  return dynamo
    .get({ TableName: CONNECTIONS_TABLE, Key: { connectionId } })
    .promise()
    .then((r) => r.Item)
}

function saveMessage(message) {
  return dynamo.put({ TableName: MESSAGES_TABLE, Item: message }).promise()
}

function getGroupMessages(groupId, limit = 50) {
  return dynamo
    .query({
      TableName: MESSAGES_TABLE,
      IndexName: 'GroupIdIndex',
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: { ':groupId': groupId },
      ScanIndexForward: false,
      Limit: limit,
    })
    .promise()
    .then((r) => r.Items.reverse())
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  saveConnection,
  removeConnection,
  getGroupConnections,
  getConnection,
  saveMessage,
  getGroupMessages,
}
