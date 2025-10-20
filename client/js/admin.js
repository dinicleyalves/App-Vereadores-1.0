// client/js/admin.js
let token = null;
let editandoId = null;

setInterval(carregarUltimoSorteio, 8000); // atualiza a cada 8 segundos
carregarUltimoSorteio();

// === LOGIN DO ADMIN ===
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Preencha usuário e senha!");
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      token = data.token;
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("admin-panel").style.display = "block";
      carregarVereadores();
      alert("✅ Login realizado com sucesso!");
    } else {
      alert(data.error || "Credenciais inválidas!");
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão com o servidor!");
  }
  document.getElementById("admin-panel").style.display = "block";
document.getElementById("loginSection").style.display = "none";

// Atualizar orador atual
atualizarOradorAtual();
setInterval(atualizarOradorAtual, 10000); // Atualiza a cada 10s

}
// === LISTAR VEREADORES ===
async function carregarVereadores() {
  const res = await fetch("/api/vereadores");
  const vereadores = await res.json();

  const lista = document.getElementById("listaVereadores");
  lista.innerHTML = "";

  vereadores.forEach(v => {
    const li = document.createElement("li");

    // === HTML principal do card ===
    li.innerHTML = `
      <img src="${v.foto}" alt="${v.nome}">
      <strong>${v.nome}</strong><br>
      <span>${v.partido}</span><br>
    `;

    // === Botão de inscrição ===
    const btnInscrever = document.createElement("button");
    btnInscrever.textContent = "✅ Inscrever";
    btnInscrever.onclick = () => inscreverVereador(v.id);

    // === Botão de edição ===
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "✏️ Editar";
    btnEditar.style.backgroundColor = "#457b9d";
    btnEditar.onclick = () => preencherCamposParaEditar(v);

    // === Botão “Dar a palavra” ===
    const btnFalar = document.createElement("button");
    btnFalar.textContent = "🎤 Dar a palavra";
    btnFalar.style.backgroundColor = "#00b4d8";
    btnFalar.onclick = () => darPalavra(v.id);

    // === Botão “Encerrar fala” ===
    const btnEncerrar = document.createElement("button");
    btnEncerrar.textContent = "⏹️ Encerrar fala";
    btnEncerrar.style.backgroundColor = "#e63946";
    btnEncerrar.onclick = () => encerrarFala(v.id);

    // === Destaque visual se estiver falando ===
    if (v.falando === 1) {
      li.classList.add("falando");
      li.innerHTML += `<div style="color:#00d1ff;font-weight:bold;margin-top:6px;">🎤 Em uso da palavra</div>`;
    }

    // === Adiciona botões no card ===
    li.appendChild(btnInscrever);
    li.appendChild(btnEditar);
    li.appendChild(btnFalar);
    li.appendChild(btnEncerrar);

    lista.appendChild(li);
  });
}


// === PREENCHER CAMPOS PARA EDIÇÃO ===
function preencherCamposParaEditar(v) {
  document.getElementById("nome").value = v.nome;
  document.getElementById("partido").value = v.partido;
  editandoId = v.id;

  const botao = document.querySelector("#admin-panel button[onclick='addVereador()']");
  botao.textContent = "💾 Salvar Alterações";
  botao.onclick = salvarEdicao;
}

// === SALVAR ALTERAÇÕES DE UM VEREADOR ===
async function salvarEdicao(id) {
  const nome = document.getElementById("nome").value;
  const partido = document.getElementById("partido").value;
  const fotoInput = document.getElementById("foto");

  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("partido", partido);
  if (fotoInput.files[0]) {
    formData.append("foto", fotoInput.files[0]);
  }

  const res = await fetch(`/api/vereadores/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (res.ok) {
    alert("✅ Vereador atualizado com sucesso!");
    carregarVereadores();
  } else {
    alert("❌ Erro ao atualizar vereador.");
  }
}



// === ADICIONAR VEREADOR ===
async function addVereador() {
  const nome = document.getElementById("nome").value.trim();
  const partido = document.getElementById("partido").value.trim();
  const foto = document.getElementById("foto").files[0];

  if (!nome || !partido) {
    alert("Preencha nome e partido!");
    return;
  }

  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("partido", partido);
  if (foto) formData.append("foto", foto);

  try {
    const res = await fetch("/api/vereadores", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      alert("✅ Vereador cadastrado!");
      document.getElementById("nome").value = "";
      document.getElementById("partido").value = "";
      document.getElementById("foto").value = "";
      carregarVereadores();
    } else {
      alert("Erro ao cadastrar vereador.");
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão ao adicionar vereador.");
  }
}

// === INSCREVER VEREADOR ===
async function inscreverVereador(id) {
  try {
    const res = await fetch("/api/sorteio/inscrever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vereador_id: id })
    });

    if (res.ok) {
      alert("📝 Vereador inscrito para a tribuna!");
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao inscrever vereador.");
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão ao inscrever vereador.");
  }
}

// === REALIZAR SORTEIO ===
async function realizarSorteio() {
  try {
    const res = await fetch("/api/sorteio", { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      alert("✅ Sorteio realizado com sucesso!");
      // 👉 Não mostrar os nomes aqui — a tela ao vivo já exibirá
    } else {
      alert(data.error || "Erro ao realizar sorteio.");
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão ao realizar sorteio.");
  }
}

// === Função de logout ===
function logout() {
  localStorage.removeItem("token");
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  alert("Você saiu com sucesso!");
}

// === Atualiza quem está com a palavra ===
async function atualizarOradorAtual() {
  try {
    const res = await fetch("/api/vereadores");
    if (res.ok) {
      const vereadores = await res.json();
      const orador = vereadores.find(v => v.falando === 1);
      const oradorDiv = document.getElementById("oradorAtual");

      if (orador) {
        oradorDiv.innerHTML = `🎤 <strong>${orador.nome}</strong> (${orador.partido}) está com a palavra.`;
        oradorDiv.style.color = "#00d1ff";
      } else {
        oradorDiv.innerHTML = "🕓 Nenhum vereador está com a palavra no momento.";
        oradorDiv.style.color = "var(--azul-claro)";
      }
    }
  } catch (err) {
    console.error("Erro ao buscar orador:", err);
  }
}

// === Atualiza em tempo real o vereador com a palavra ===
async function atualizarOradorAtual() {
  try {
    const res = await fetch("/api/vereadores");
    if (res.ok) {
      const vereadores = await res.json();
      const orador = vereadores.find(v => v.falando === 1);
      const oradorDiv = document.getElementById("oradorAtual");

      if (orador) {
        oradorDiv.innerHTML = `🎤 <strong>${orador.nome}</strong> (${orador.partido}) está com a palavra.`;
        oradorDiv.style.background = "rgba(255,255,255,0.25)";
        oradorDiv.style.color = "#00d1ff";
        oradorDiv.style.animation = "brilho 2s infinite ease-in-out";
      } else {
        oradorDiv.innerHTML = "🕓 Nenhum vereador está com a palavra no momento.";
        oradorDiv.style.background = "rgba(255,255,255,0.1)";
        oradorDiv.style.color = "var(--azul-claro)";
        oradorDiv.style.animation = "none";
      }
    }
  } catch (err) {
    console.error("Erro ao buscar orador:", err);
  }
}

// === DAR A PALAVRA ===
async function darPalavra(id) {
  try {
    const res = await fetch(`/api/vereadores/${id}/falar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ falando: 1 }),
    });
    if (res.ok) {
      alert("🎤 Vereador está com a palavra!");
      await carregarVereadores();
      atualizarOradorAtual();
    }
  } catch (err) {
    console.error("Erro ao definir fala:", err);
  }
}

// === ENCERRAR FALA ===
async function encerrarFala(id) {
  try {
    const res = await fetch(`/api/vereadores/${id}/falar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ falando: 0 }),
    });
    if (res.ok) {
      alert("🕓 Fala encerrada!");
      await carregarVereadores();
      atualizarOradorAtual();
    }
  } catch (err) {
    console.error("Erro ao encerrar fala:", err);
  }
}
// === Popup animado ===
function showPopup(message, type = "success") {
  const popup = document.getElementById("popupMsg");
  popup.textContent = message;
  popup.className = "";
  popup.classList.add("show", type);

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3500);
}


// Chama a função ao carregar e depois repete a cada 5s
setInterval(atualizarOradorAtual, 5000);
atualizarOradorAtual();
