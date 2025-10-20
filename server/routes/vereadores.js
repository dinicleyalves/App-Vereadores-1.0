import express from "express";
import multer from "multer";
import path from "path";
import dbPromise from "../models/db.js";
import { io } from "../app.js";

const router = express.Router();

// === Configuração de upload de fotos ===
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Formato de imagem inválido."));
    }
    cb(null, true);
  },
});

// === 1️⃣ Listar todos os vereadores ===
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const vereadores = await db.all("SELECT * FROM vereadores ORDER BY id ASC");
    res.json(vereadores);
  } catch (err) {
    console.error("Erro ao listar vereadores:", err);
    res.status(500).json({ error: "Erro ao listar vereadores" });
  }
});

// === 2️⃣ Adicionar novo vereador ===
router.post("/", upload.single("foto"), async (req, res) => {
  try {
    const db = await dbPromise;
    const { nome, partido } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    await db.run(
      "INSERT INTO vereadores (nome, partido, foto, falando) VALUES (?, ?, ?, 0)",
      [nome, partido, foto]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao adicionar vereador:", err);
    res.status(500).json({ error: "Erro ao adicionar vereador" });
  }
});

// === 3️⃣ Atualizar vereador (edição) ===
router.put("/:id", upload.single("foto"), async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { nome, partido } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    if (foto) {
      await db.run(
        "UPDATE vereadores SET nome = ?, partido = ?, foto = ? WHERE id = ?",
        [nome, partido, foto, id]
      );
    } else {
      await db.run(
        "UPDATE vereadores SET nome = ?, partido = ? WHERE id = ?",
        [nome, partido, id]
      );
    }

    const atualizado = await db.get("SELECT * FROM vereadores WHERE id = ?", [id]);
    io.emit("vereadorAtualizado", atualizado);
    res.json({ success: true, vereador: atualizado });
  } catch (err) {
    console.error("Erro ao atualizar vereador:", err);
    res.status(500).json({ error: "Erro ao atualizar vereador" });
  }
});



// === 4️⃣ Excluir vereador ===
router.delete("/:id", async (req, res) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;

    await db.run("DELETE FROM vereadores WHERE id = ?", [id]);
    io.emit("vereadorRemovido", id);

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir vereador:", err);
    res.status(500).json({ error: "Erro ao excluir vereador" });
  }
});

// === 5️⃣ Marcar quem está com a palavra (tempo real) ===
router.put("/:id/falar", async (req, res) => {
  const { id } = req.params;
  const { falando } = req.body;

  try {
    const db = await dbPromise;

    if (falando === 1) {
      await db.run("UPDATE vereadores SET falando = 0");
    }

    await db.run("UPDATE vereadores SET falando = ? WHERE id = ?", [falando, id]);
    const orador = await db.get("SELECT * FROM vereadores WHERE id = ?", [id]);

    // Emite o evento em tempo real para todos os painéis
    io.emit("atualizarOrador", orador);

    res.json({ success: true, orador });
  } catch (err) {
    console.error("Erro ao atualizar fala:", err);
    res.status(500).json({ error: "Erro ao atualizar fala" });
  }
});

export default router;
