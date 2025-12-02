import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===============================
// Registrar usuário
// ===============================
export const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
   
    const existe = await User.findOne({ email });
    if (existe)
      return res.status(400).json({ message: "Email já registrado" });

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novo = await User.create({
      nome,
      email,
      senha: senhaHash,
    });

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      usuario: novo,
    });
  } catch (err) {
    console.error("Erro ao registrar:", err);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};

// ===============================
// Login
// ===============================
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario)
      return res.status(404).json({ message: "Usuário não encontrado" });

    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok)
      return res.status(400).json({ message: "Senha incorreta" });

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado",
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });

  } catch (err) {
    console.error("Erro login:", err);
    res.status(500).json({ message: "Erro ao fazer login" });
  }
};

// ===============================
// Perfil do usuário autenticado
// ===============================
export const perfilUsuario = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).select("-senha");
    res.json(usuario);
  } catch (err) {
    console.error("Erro perfil:", err);
    res.status(500).json({ message: "Erro ao carregar perfil" });
  }
};
