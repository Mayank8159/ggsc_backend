exports.handler = async (event) => {
  return { statusCode: 400, body: 'Unknown action. Supported: sendMessage' }
}
