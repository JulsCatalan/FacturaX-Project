import db from '../config/db.js';
import { createToken } from '../middleware/jwt.js';
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  const { email, password, name } = req.body;
  console.log("Registrando usuario...");
  console.log(req.body);

  try {
    // 1. Verificar si ya existe el usuario
    const { data: existingUser } = await db
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "El correo ya esta registrado." });
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar nuevo usuario
    const { data: newUser, error: insertError } = await db
      .from("users")
      .insert([{ email, password_hash: hashedPassword, name }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 4. Crear token
    const token = createToken({ id: newUser.id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 86400000,
    });

    return res.status(201).json({ message: "Usuario registrado con éxito", user: newUser });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log('Intentando login...');
  try {
    // 1. Buscar el usuario por email
    const { data: users, error } = await db
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('Error al consultar usuario:', error.message);
      return res.status(500).json({ error: 'Error al consultar la base de datos' });
    }

    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // 2. Comparar contraseñas
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Generar token JWT
    const token = createToken({ id: user.id });

    // 4. Enviar cookie con token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 86400000, // 1 día
    });

    res.status(200).json({ 
      message: 'Inicio de sesión exitoso', 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.log("Error al cerrar sesión", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
