import jwt from 'jsonwebtoken'

export const JWT_SECRET = process.env.AGRISTACK_JWT_SECRET || 'agristack-hackathon-dev-secret-2026'

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
      state: user.state,
      district: user.district,
      taluk: user.taluk,
      village: user.village,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session token.' })
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET)
    } catch {
      req.user = null
    }
  }
  return next()
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' })
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}.`,
      })
    }
    return next()
  }
}
