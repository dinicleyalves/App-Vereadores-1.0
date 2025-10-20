import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import vereadoresRoutes from "./routes/vereadores.js";
import sorteioRoutes from "./routes/sorteio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// === Middlewares ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Servir arquivos estáticos (frontend) ===
app.use(express.static(path.join(__dirname, "../client")));

// === Servir uploads (corrigido) ===
// Se suas imagens estão dentro de "server/uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Caso estejam na raiz do projeto, use esta alternativa:
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// === Rotas ===
app.use("/api/auth", authRoutes);
app.use("/api/vereadores", vereadoresRoutes);
app.use("/api/sorteio", sorteioRoutes);

// === Rota padrão ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// === Socket.IO - Conexões em tempo real ===
io.on("connection", (socket) => {
  console.log("🟢 Novo cliente conectado!");

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado.");
  });
});

// === Exportar o io para outros módulos ===
export { io };

// === Inicializar servidor ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
