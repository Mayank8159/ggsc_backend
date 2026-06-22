const { verifyToken } = require('../utils/jwt')

exports.handler = async (event) => {
  try {
    const token = event.headers?.Authorization?.replace('Bearer ', '')
      || event.queryStringParameters?.token

    if (!token) {
      return generatePolicy('deny', event.methodArn)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return generatePolicy('deny', event.methodArn)
    }

    return generatePolicy('allow', event.methodArn, decoded)
  } catch {
    return generatePolicy('deny', event.methodArn)
  }
}

function generatePolicy(effect, resource, context) {
  return {
    principalId: context?.userId || 'anonymous',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  }
}
