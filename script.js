/*interação e dados*/

// ----- 1. CATEGORIAS DE MATERIAL -----
// A cor de cada categoria é a cor oficial da coleta seletiva no Brasil
// (padrão CONAMA). Ela só aparece como um detalhe pequeno (bolinha, barra
// fina) — nunca como bloco grande de cor, pra manter o visual neutro.
const CATEGORIAS = {
  papel:      { rotulo: "Papel / Papelão",         cor: "var(--papel)",      pesoMedio: 4 },
  plastico:   { rotulo: "Plástico",                cor: "var(--plastico)",   pesoMedio: 2 },
  vidro:      { rotulo: "Vidro",                   cor: "var(--vidro)",      pesoMedio: 6 },
  metal:      { rotulo: "Metal",                   cor: "var(--metal)",      pesoMedio: 3 },
  organico:   { rotulo: "Orgânico p/ compostagem", cor: "var(--organico)",   pesoMedio: 5 },
  eletronico: { rotulo: "Eletrônico",              cor: "var(--eletronico)", pesoMedio: 2 },
  oleo:       { rotulo: "Óleo de cozinha",         cor: "var(--oleo)",       pesoMedio: 1 },
};

const NOME_COLECAO = "posts";

// ----- ÍCONES (SVG minimalistas, sem emojis) -----
// Centralizados aqui pra reaproveitar nos templates abaixo.
const ICONES = {
  interesse: (preenchido) => `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="${preenchido ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h13l-3.2 6L17 16H6a2 2 0 0 1-2-2V4Z"/><path d="M4 20v-4"/>
    </svg>`,
  comentario: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,
  compartilhar: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 17 17 7M9 7h8v8"/>
    </svg>`,
  aviso: `
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v.01"/>
    </svg>`,
  vazio: `
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 21c-4-1-7-4-7-9 3 0 5 1 6 3 1-4 3-6 7-8-1 5-1 9-3 12-1 1.5-2 2-3 2Z"/>
    </svg>`,
};

// ----- 2. ESTADO EM MEMÓRIA -----
let posts = [];
let filtroAtivo = "todos";
let curtidasDestaSessao = new Set();
let comentariosAbertos = new Set();

let db = null;
let modoFirebase = false;
let fs = null; // guarda as funções do Firestore importadas dinamicamente

// ----- 3. CONEXÃO COM O FIREBASE -----
async function iniciarFirebase() {
  let firebaseConfig;

  // Tenta carregar o arquivo de configuração
  try {
    ({ firebaseConfig } = await import("./firebase-config.js"));
  } catch (erro) {
    console.error("ERRO AO CARREGAR firebase-config.js:", erro);

    ativarModoLocal(
      "Não encontrei o arquivo firebase-config.js."
    );

    return;
  }

  // Verifica se a API key ainda é um placeholder
  const configEhPlaceholder =
    !firebaseConfig ||
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey === "COLE_SUA_API_KEY_AQUI" ||
    firebaseConfig.apiKey === "chave";

  if (configEhPlaceholder) {
    console.error("API KEY DO FIREBASE NÃO CONFIGURADA.");

    ativarModoLocal(
      "Firebase ainda não está configurado. Verifique o firebase-config.js."
    );

    return;
  }

  // Tenta iniciar o Firebase
  try {
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
    );

    fs = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
    );

    const app = initializeApp(firebaseConfig);

    db = fs.getFirestore(app);

    modoFirebase = true;

    console.log("Firebase conectado com sucesso.");

    const q = fs.query(
      fs.collection(db, NOME_COLECAO),
      fs.orderBy("criadoEm", "desc")
    );

    fs.onSnapshot(
      q,

      // Quando os dados chegam do Firestore
      (snapshot) => {
        posts = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));

        console.log(
          "Posts carregados do Firestore:",
          posts.length
        );

        renderizarFeed();
      },

      // Se o Firestore der erro
      (erro) => {
        console.error(
          "ERRO REAL DO FIRESTORE:",
          erro
        );

        console.error(
          "Código do erro:",
          erro?.code
        );

        console.error(
          "Mensagem do erro:",
          erro?.message
        );

        ativarModoLocal(
          `Erro Firestore: ${erro?.code || "desconhecido"}`
        );
      }
    );

  } catch (erro) {
    console.error(
      "ERRO AO INICIAR FIREBASE:",
      erro
    );

    console.error(
      "Código:",
      erro?.code
    );

    console.error(
      "Mensagem:",
      erro?.message
    );

    ativarModoLocal(
      `Erro ao carregar Firebase: ${erro?.message || "erro desconhecido"}`
    );
  }
}

function ativarModoLocal(mensagem){
  modoFirebase = false;
  const aviso = document.getElementById("avisoFirebase");
  if (aviso){
    aviso.innerHTML = `${ICONES.aviso}<span>${mensagem} Funcionando em modo local (nada fica salvo).</span>`;
    aviso.style.display = "flex";
  }
  renderizarFeed();
}

// ----- 4. MONTAGEM DOS ELEMENTOS FIXOS (select e filtros) -----
function montarSelectCategorias(){
  const select = document.getElementById("campoTipo");
  select.innerHTML = Object.entries(CATEGORIAS)
    .map(([chave, c]) => `<option value="${chave}">${c.rotulo}</option>`)
    .join("");
}

function montarFiltros(){
  const container = document.getElementById("filtros");
  const chipTodos = `<button class="chip ativo" data-cat="todos"><span class="ponto"></span>Todos os materiais</button>`;
  const chips = Object.entries(CATEGORIAS).map(([chave, c]) => `
    <button class="chip" data-cat="${chave}">
      <span class="ponto" style="background:${c.cor}"></span>${c.rotulo}
    </button>
  `).join("");
  container.innerHTML = chipTodos + chips;

  container.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      filtroAtivo = chip.dataset.cat;
      container.querySelectorAll(".chip").forEach(c => c.classList.remove("ativo"));
      chip.classList.add("ativo");
      renderizarFeed();
    });
  });
}

// ----- 5. FORMATAÇÃO DE DATA -----
function tempoRelativo(timestamp){
  const diffMs = Date.now() - timestamp;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

// ----- 6. RENDERIZAÇÃO DE UM CARTÃO -----
// A cor da categoria aparece só como uma bolinha ao lado do nome — mesma
// linguagem visual usada nos filtros e na legenda de distribuição.
function renderizarCard(post){
  const cat = CATEGORIAS[post.categoria];
  const jaCurtiu = curtidasDestaSessao.has(post.id);
  const comentarios = post.comentarios || [];
  const estaAberto = comentariosAbertos.has(post.id);

  return `
    <article class="cartao" data-id="${post.id}">
      <div class="cartao-topo">
        <div>
          <div class="cartao-tipo"><span class="ponto-cat" style="background:${cat.cor}"></span>${cat.rotulo}</div>
          <div class="cartao-local">${escaparHTML(post.bairro)}</div>
        </div>
        <div class="cartao-quando">
          ${tempoRelativo(post.criadoEm)}<br>
          <span class="cartao-autor">por ${escaparHTML(post.nome)}</span>
        </div>
      </div>

      ${post.descricao ? `<p class="cartao-desc">${escaparHTML(post.descricao)}</p>` : ""}
      <span class="cartao-qtd">${escaparHTML(post.quantidade)}</span>

      <div class="divisor"></div>

      <div class="cartao-acoes">
        <button class="acao-btn ${jaCurtiu ? "curtido" : ""}" data-acao="curtir">
          ${ICONES.interesse(jaCurtiu)} <span class="num">${post.curtidas || 0}</span> interessados
        </button>
        <button class="acao-btn" data-acao="comentar">
          ${ICONES.comentario} <span class="num">${comentarios.length}</span> comentário${comentarios.length === 1 ? "" : "s"}
        </button>
        <button class="acao-btn" data-acao="compartilhar">
          ${ICONES.compartilhar} Compartilhar
        </button>
      </div>

      <div class="comentarios ${estaAberto ? "aberto" : ""}" data-comentarios>
        <div class="lista-comentarios">
          ${comentarios.map(c => `
            <div class="comentario">
              <span class="autor-c">${escaparHTML(c.nome)}</span>${escaparHTML(c.texto)}
              <span class="hora-c">${tempoRelativo(c.criadoEm)}</span>
            </div>
          `).join("") || `<p style="color:var(--tinta-suave); font-size:.85rem; margin:0;">Ninguém comentou ainda. Combine a retirada por aqui.</p>`}
        </div>
        <form class="form-comentario" data-form-comentario>
          <input type="text" placeholder="Seu nome" maxlength="30" required data-comentario-nome style="max-width:120px;">
          <input type="text" placeholder="Escreva um comentário..." maxlength="200" required data-comentario-texto>
          <button type="submit">Enviar</button>
        </form>
      </div>
    </article>
  `;
}

function escaparHTML(texto){
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ----- 7. RENDERIZAÇÃO DO FEED COMPLETO -----
function renderizarFeed(){
  const feedEl = document.getElementById("feed");

  const listaFiltrada = filtroAtivo === "todos"
    ? posts
    : posts.filter(p => p.categoria === filtroAtivo);

  const ordenada = modoFirebase
    ? listaFiltrada
    : [...listaFiltrada].sort((a, b) => b.criadoEm - a.criadoEm);

  if (ordenada.length === 0){
    feedEl.innerHTML = `
      <div class="vazio">
        ${ICONES.vazio}
        Ainda não tem nada por aqui nessa categoria.<br>Que tal ser a primeira pessoa a publicar?
      </div>`;
  } else {
    feedEl.innerHTML = ordenada.map(renderizarCard).join("");
    ativarEventosDoFeed();
  }

  atualizarEstatisticas();
  atualizarDistribuicao();
}

// ----- 8. EVENTOS DE CADA CARTÃO (curtir, comentar, compartilhar) -----
function ativarEventosDoFeed(){
  document.querySelectorAll(".cartao").forEach(card => {
    const id = card.dataset.id;
    const post = posts.find(p => p.id === id);

    card.querySelector('[data-acao="curtir"]').addEventListener("click", () => {
      const jaCurtiu = curtidasDestaSessao.has(id);
      jaCurtiu ? curtidasDestaSessao.delete(id) : curtidasDestaSessao.add(id);

      if (modoFirebase){
        fs.updateDoc(fs.doc(db, NOME_COLECAO, id), { curtidas: fs.increment(jaCurtiu ? -1 : 1) })
          .catch(() => mostrarToast("Não deu pra registrar a curtida agora."));
      } else {
        post.curtidas = (post.curtidas || 0) + (jaCurtiu ? -1 : 1);
        renderizarFeed();
      }
    });

    card.querySelector('[data-acao="comentar"]').addEventListener("click", () => {
      comentariosAbertos.has(id) ? comentariosAbertos.delete(id) : comentariosAbertos.add(id);
      card.querySelector("[data-comentarios]").classList.toggle("aberto");
    });

    card.querySelector('[data-acao="compartilhar"]').addEventListener("click", async () => {
      const cat = CATEGORIAS[post.categoria];
      const texto = `${cat.rotulo} disponível em ${post.bairro} — via ReCircula.`;
      if (navigator.share){
        try{ await navigator.share({ text: texto }); } catch(e){ /* pessoa cancelou */ }
      } else {
        await navigator.clipboard.writeText(texto);
        mostrarToast("Texto copiado! Agora é só colar onde quiser.");
      }
    });

    card.querySelector("[data-form-comentario]").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const nomeInput = card.querySelector("[data-comentario-nome]");
      const textoInput = card.querySelector("[data-comentario-texto]");
      const novoComentario = {
        nome: nomeInput.value.trim(),
        texto: textoInput.value.trim(),
        criadoEm: Date.now(),
      };

      comentariosAbertos.add(id);

      if (modoFirebase){
        fs.updateDoc(fs.doc(db, NOME_COLECAO, id), { comentarios: fs.arrayUnion(novoComentario) })
          .catch(() => mostrarToast("Não deu pra enviar o comentário agora."));
      } else {
        if (!post.comentarios) post.comentarios = [];
        post.comentarios.push(novoComentario);
        renderizarFeed();
      }
    });
  });
}

// ----- 9. ESTATÍSTICAS -----
function atualizarEstatisticas(){
  document.getElementById("statPosts").textContent = posts.length;

  const kgTotal = posts.reduce((soma, p) => soma + (CATEGORIAS[p.categoria]?.pesoMedio || 0), 0);
  document.getElementById("statKg").textContent = `${kgTotal} kg`;

  const bairrosUnicos = new Set(posts.map(p => p.bairro.trim().toLowerCase()));
  document.getElementById("statBairros").textContent = bairrosUnicos.size;
}

// ----- 10. BARRA DE DISTRIBUIÇÃO POR CATEGORIA -----
// Único lugar da interface onde as cores oficiais da coleta seletiva
// aparecem lado a lado, proporcionalmente às publicações reais.
function atualizarDistribuicao(){
  const barra = document.getElementById("distribuicao");
  const legenda = document.getElementById("distribuicaoLegenda");
  const total = posts.length;

  if (total === 0){
    barra.innerHTML = "";
    legenda.innerHTML = `<span style="opacity:.6">Sem dados ainda</span>`;
    return;
  }

  const segmentos = [];
  const itensLegenda = [];

  Object.entries(CATEGORIAS).forEach(([chave, c]) => {
    const qtd = posts.filter(p => p.categoria === chave).length;
    if (qtd === 0) return;
    const pct = (qtd / total) * 100;
    segmentos.push(`<span class="segmento" style="width:${pct}%; background:${c.cor}"></span>`);
    itensLegenda.push(`<span><span class="pt" style="background:${c.cor}"></span>${c.rotulo} · ${qtd}</span>`);
  });

  barra.innerHTML = segmentos.join("");
  legenda.innerHTML = itensLegenda.join("");
}

// ----- 11. TOAST DE FEEDBACK -----
let timeoutToast;
function mostrarToast(mensagem){
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.classList.add("mostrar");
  clearTimeout(timeoutToast);
  timeoutToast = setTimeout(() => toast.classList.remove("mostrar"), 2600);
}

// ----- 12. FORMULÁRIO DE NOVA PUBLICAÇÃO -----
const formPost = document.getElementById("formPost");

document.getElementById("btnAbrirForm").addEventListener("click", () => {
  formPost.classList.add("aberto");
  formPost.scrollIntoView({ behavior: "smooth", block: "center" });
});
document.getElementById("btnCancelarForm").addEventListener("click", () => {
  formPost.reset();
  formPost.classList.remove("aberto");
});

formPost.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const dadosPost = {
    nome: document.getElementById("campoNome").value.trim(),
    bairro: document.getElementById("campoBairro").value.trim(),
    categoria: document.getElementById("campoTipo").value,
    quantidade: document.getElementById("campoQtd").value.trim(),
    descricao: document.getElementById("campoDesc").value.trim(),
    curtidas: 0,
    comentarios: [],
    criadoEm: Date.now(),
  };

  if (modoFirebase){
    fs.addDoc(fs.collection(db, NOME_COLECAO), dadosPost)
      .catch(() => mostrarToast("Não deu pra publicar agora. Tenta de novo."));
  } else {
    posts.push({ id: `local_${Date.now()}`, ...dadosPost });
    renderizarFeed();
  }

  formPost.reset();
  formPost.classList.remove("aberto");
  filtroAtivo = "todos";
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("ativo"));
  document.querySelector('.chip[data-cat="todos"]').classList.add("ativo");

  mostrarToast("Publicado! Seu material já está visível pra vizinhança.");
});

// ----- 13. INICIALIZAÇÃO -----
async function iniciar(){
  montarSelectCategorias();
  montarFiltros();
  renderizarFeed(); // desenha o feed vazio de cara, sem esperar a conexão
  iniciarFirebase(); // roda em paralelo, sem travar a tela
}

iniciar();