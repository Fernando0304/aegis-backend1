import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===============================
// Registrar usuário
// ===============================
export const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    console.log("➡️ Registro solicitado:", { nome, email });

    const existe = await User.findOne({ email });
    if (existe) {
      console.log("❌ Email já registrado:", email);
      return res.status(400).json({ message: "Email já registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novo = await User.create({
      nome,
      email,
      senha: senhaHash,
    });

    console.log("✅ Usuário registrado:", novo._id);

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      usuario: novo,
    });
  } catch (err) {
    console.error("❌ Erro ao registrar:", err);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};

// ===============================
// Login
// ===============================
export const loginUsuario = async (req, res) => {
  /// 🔥 LOG 1: Chegou no controller?
  console.log("\n================ LOGIN REQUEST ================");
  console.log("📥 Body recebido:", req.body);

  try {
    const { email, senha } = req.body;

    /// 🔥 LOG 2: Verificar se o email chegou
    console.log("📧 Email recebido:", email);

    const usuario = await User.findOne({ email });

    /// 🔥 LOG 3: Encontrou user?
    if (!usuario) {
      console.log("❌ Usuário não encontrado:", email);
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    console.log("👤 Usuário encontrado:", usuario._id);

    const ok = await bcrypt.compare(senha, usuario.senha);

    /// 🔥 LOG 4: Senha confere?
    console.log("🔐 Senha correta?", ok);

    if (!ok) {
      console.log("❌ Senha incorreta!");
      return res.status(400).json({ message: "Senha incorreta" });
    }

    /// 🔥 LOG 5: Testar JWT_SECRET carregado
    console.log("🔑 JWT_SECRET carregado?", !!process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🎫 Token gerado com sucesso!");

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
    console.error("❌ Erro login:", err);
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
    console.error("❌ Erro perfil:", err);
    res.status(500).json({ message: "Erro ao carregar perfil" });
  }
};
