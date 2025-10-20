// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = "segredo123";

const admins = [
  { username: "admin", passwordHash: bcrypt.hashSync("1234", 8) },
  { username: "vereador2", passwordHash: bcrypt.hashSync("senha2", 8) }
];

export const loginAdmin = (req, res) => {
  const { username, password } = req.body;
  const user = admins.find(a => a.username === username);

  if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

  const senhaCorreta = bcrypt.compareSync(password, user.passwordHash);
  if (!senhaCorreta) return res.status(401).json({ error: "Senha incorreta" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "8h" });
  res.json({ token });
};

export const registerAdmin = (req, res) => {
  res.status(501).json({ message: "Registro não implementado" });
};
