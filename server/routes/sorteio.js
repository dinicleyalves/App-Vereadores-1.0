// server/routes/sorteio.js
import express from "express";
import dbPromise from "../models/db.js";

const router = express.Router();

// Inscrever vereador
router.post("/inscrever", async (req, res) => {
  try {
    const { vereador_id } = req.body;
    if (!vereador_id) return res.status(400).json({ error: "ID do vereador é obrigatório" });

    const db = await dbPromise;
    await db.run("INSERT INTO inscricoes (vereador_id) VALUES (?)", [vereador_id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao inscrever vereador" });
  }
});

// Listar inscritos
router.get("/inscritos", async (req, res) => {
  try {
    const db = await dbPromise;
    const inscritos = await db.all(`
      SELECT v.id, v.nome, v.partido, v.foto
      FROM inscricoes i
      JOIN vereadores v ON v.id = i.vereador_id
      ORDER BY i.id ASC
    `);
    res.json(inscritos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar inscritos" });
  }
});

// Realizar sorteio
router.post("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const inscritos = await db.all(`
      SELECT v.id, v.nome, v.partido, v.foto
      FROM inscricoes i
      JOIN vereadores v ON v.id = i.vereador_id
    `);

    if (!inscritos || inscritos.length === 0)
      return res.status(400).json({ error: "Nenhum vereador inscrito" });

    // Embaralhar aleatoriamente
    const ordem = inscritos
      .map(v => ({ ...v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(v => ({ id: v.id, nome: v.nome, partido: v.partido, foto: v.foto }));

    await db.run("INSERT INTO sorteios (resultado) VALUES (?)", [JSON.stringify(ordem)]);
    await db.run("DELETE FROM inscricoes");

    res.json({ success: true, ordem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao realizar sorteio" });
  }
});

// === OBTER ÚLTIMO SORTEIO ===
router.get("/ultimo", async (req, res) => {
  try {
    const db = await dbPromise;
    const ultimo = await db.get("SELECT * FROM sorteios ORDER BY id DESC LIMIT 1");
    if (!ultimo) return res.status(404).json({ error: "Nenhum sorteio encontrado" });

    const resultado = JSON.parse(ultimo.resultado);
    res.json({ resultado });
  } catch (err) {
    console.error("Erro ao buscar último sorteio:", err);
    res.status(500).json({ error: "Erro ao buscar sorteio" });
  }
});

export default router;
