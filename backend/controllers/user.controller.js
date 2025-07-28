import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  console.log(userId)
  const { name, email, password } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      // Verifica si ya existe otro usuario con ese email
      const { data: existingUser } = await db
        .from('users')
        .select('*')
        .eq('email', email)
        .neq('id', userId)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ message: 'El correo ya está en uso por otro usuario' });
      }

      updates.email = email;
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.password_hash = hashed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
    }

    const { data: updatedUser, error } = await db
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, name, email')
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Usuario actualizado correctamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const { data: user, error } = await db
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error al obtener perfil del usuario:', error);
    return res.status(500).json({ message: 'Error al obtener el perfil' });
  }
};
