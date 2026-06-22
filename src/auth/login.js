const bcrypt = require('bcryptjs')
const { signToken } = require('../utils/jwt')
const { getUserByEmail } = require('../utils/dynamo')
const { success, error } = require('../utils/response')

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body)

    if (!email || !password) {
      return error('email and password are required')
    }

    const result = await getUserByEmail(email)
    if (result.Items.length === 0) {
      return error('invalid email or password', 401)
    }

    const user = result.Items[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return error('invalid email or password', 401)
    }

    const token = signToken({
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
    })

    return success({ token, userId: user.userId, displayName: user.displayName, email: user.email })
  } catch (err) {
    console.error('Login error:', err)
    return error('internal server error', 500)
  }
}
