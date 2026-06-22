const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { signToken } = require('../utils/jwt')
const { getUserByEmail, createUser } = require('../utils/dynamo')
const { success, error } = require('../utils/response')

exports.handler = async (event) => {
  try {
    const { email, password, displayName } = JSON.parse(event.body)

    if (!email || !password || !displayName) {
      return error('email, password, and displayName are required')
    }
    if (password.length < 6) {
      return error('password must be at least 6 characters')
    }

    const existing = await getUserByEmail(email)
    if (existing.Items.length > 0) {
      return error('email already registered', 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    await createUser({
      userId,
      email,
      password: hashedPassword,
      displayName,
      createdAt: Date.now(),
    })

    const token = signToken({ userId, email, displayName })

    return success({ token, userId, displayName, email })
  } catch (err) {
    console.error('Register error:', err)
    return error('internal server error', 500)
  }
}
