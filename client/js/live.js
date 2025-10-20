// client/js/live.js
const ordemSorteioDiv = document.getElementById("ordemSorteio");
const statusDiv = document.getElementById("status");
const btnAtualizar = document.getElementById("btnAtualizar");
const socket = io();


// === Atualizar automaticamente ===
setInterval(carregarUltimoSorteio, 20000);
carregarUltimoSorteio();

socket.on("connect", () => console.log("📡 Conectado ao servidor em tempo real!"));

socket.on("atualizarOrador", (orador) => {
  const statusDiv = document.getElementById("status");

  if (orador && orador.falando === 1) {
    statusDiv.innerHTML = `🎤 <strong>${orador.nome}</strong> (${orador.partido}) está com a palavra`;
    statusDiv.style.color = "#00d1ff";

    // Destacar visualmente o card
    const cards = document.querySelectorAll(".vereador");
    cards.forEach(card => {
      const nome = card.querySelector("strong")?.textContent || "";
      if (nome.includes(orador.nome)) {
        card.classList.add("falando");
      } else {
        card.classList.remove("falando");
      }
    });

  } else {
    statusDiv.innerHTML = "🕓 Nenhum vereador está com a palavra no momento.";
    statusDiv.style.color = "var(--azul-claro)";
  }
});


// === Função principal: buscar último sorteio ===
async function carregarUltimoSorteio() {
  if (btnAtualizar) {
    btnAtualizar.disabled = true;
    btnAtualizar.textContent = "⏳ Atualizando...";
  }

  try {
    // Mostrar quem está com a palavra
    await atualizarVereadorFalando();

    const res = await fetch("/api/sorteio/ultimo");
    if (res.ok) {
      const data = await res.json();

      if (!data.resultado || data.resultado.length === 0) {
        statusDiv.textContent = "⏳ Nenhum sorteio encontrado.";
        ordemSorteioDiv.innerHTML = "";
      } else {
        statusDiv.textContent = "🎉 Último sorteio carregado!";
        exibirSorteioAnimado(data.resultado);
      }
    } else {
      statusDiv.textContent = "⚠️ Nenhum sorteio disponível.";
      ordemSorteioDiv.innerHTML = "";
    }
  } catch (err) {
    console.error(err);
    statusDiv.textContent = "❌ Erro ao buscar o sorteio.";
  }

  if (btnAtualizar) {
    btnAtualizar.disabled = false;
    btnAtualizar.textContent = "🔄 Atualizar Agora";
  }
}

// === Mostrar vereador que está com a palavra ===
async function atualizarVereadorFalando() {
  try {
    const res = await fetch("/api/vereadores");
    if (res.ok) {
      const vereadores = await res.json();
      const orador = vereadores.find(v => v.falando === 1);

      // Atualiza o status
      if (orador) {
        statusDiv.innerHTML = `🎤 <strong>${orador.nome}</strong> (${orador.partido}) está com a palavra`;
      } else {
        statusDiv.innerHTML = "🕓 Nenhum vereador está com a palavra no momento.";
      }

      // Adiciona ou remove a classe de destaque nos cards exibidos
      const cards = document.querySelectorAll(".vereador");
      cards.forEach(card => {
        const nome = card.querySelector("strong")?.textContent || "";
        if (orador && nome.includes(orador.nome)) {
          card.classList.add("falando");
        } else {
          card.classList.remove("falando");
        }
      });
    }
  } catch (err) {
    console.error("Erro ao atualizar vereador falando:", err);
  }
}


// === Mostrar vereadores com animação ===
function exibirSorteioAnimado(ordem) {
  ordemSorteioDiv.innerHTML = "";
  let delay = 0;

  ordem.forEach((v, i) => {
    setTimeout(() => {
      const card = document.createElement("div");
      card.className = "vereador";
      card.style.animationDelay = `${i * 0.3}s`;

      card.innerHTML = `
        <img src="${v.foto}" alt="${v.nome}">
        <div>
          <strong>${i + 1}º - ${v.nome}</strong><br>
          <span>${v.partido}</span>
        </div>
      `;

      ordemSorteioDiv.appendChild(card);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, delay);
    delay += 1000;
  });
}

// === Mostrar vereador que está com a palavra ===
async function atualizarVereadorFalando() {
  try {
    const res = await fetch("/api/vereadores");
    if (res.ok) {
      const vereadores = await res.json();
      const orador = vereadores.find(v => v.falando === 1);
      const statusDiv = document.getElementById("status");

      if (orador) {
        statusDiv.innerHTML = `
          🎤 <strong>${orador.nome}</strong> (${orador.partido}) está com a palavra
        `;
        statusDiv.style.color = "#00d1ff";

        // Destaque visual no card do orador
        const cards = document.querySelectorAll(".vereador");
        cards.forEach(card => {
          const nome = card.querySelector("strong")?.textContent || "";
          if (nome.includes(orador.nome)) {
            card.classList.add("falando");
          } else {
            card.classList.remove("falando");
          }
        });

      } else {
        statusDiv.innerHTML = "🕓 Nenhum vereador está com a palavra no momento.";
        statusDiv.style.color = "var(--azul-claro)";
      }
    }
  } catch (err) {
    console.error("Erro ao atualizar vereador falando:", err);
  }
}



