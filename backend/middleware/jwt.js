import jwt from 'jsonwebtoken';

// Middleware de autenticación
export const validateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Crear un nuevo token
export const createToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  } catch (error) {
    console.error('Error al crear el JWT:', error);
    throw new Error('No se pudo generar el token');
  }
};
