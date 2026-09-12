const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const resultado = document.getElementById("resultado");
const form = document.getElementById("search-form");
const campo = document.getElementById("campo-busca");

function escaparHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[caractere]));
}

function mostrarCarregando() {
  resultado.innerHTML = `
    <div class="status-state">
      <div class="spinner" aria-hidden="true"></div>
      <p>Procurando na Pokédex...</p>
    </div>
  `;
}

function mostrarErro(mensagem) {
  resultado.innerHTML = `
    <div class="status-state error">
      <div class="pokeball pokeball-sad" aria-hidden="true"><span></span></div>
      <h2>Ops, não encontramos.</h2>
      <p>${mensagem}</p>
    </div>
  `;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace(/-/g, " ");
}

function montarCard(dados) {
  const tipos = dados.types
    .map((t) => {
      const cor = TYPE_COLORS[t.type.name] || "#777";
      return `<span class="type-badge" style="--type-color:${cor}">${capitalizar(t.type.name)}</span>`;
    })
    .join("");

  const habilidades = dados.abilities
    .slice(0, 3)
    .map((a) => capitalizar(a.ability.name))
    .join(", ");

  const sprite =
    dados.sprites?.other?.["official-artwork"]?.front_default ||
    dados.sprites?.front_default ||
    "";

  const corPrincipal = TYPE_COLORS[dados.types[0].type.name] || "#E63946";

  resultado.innerHTML = `
    <article class="poke-card" style="--accent:${corPrincipal}">
      <div class="poke-media">
        ${sprite ? `<img src="${sprite}" alt="${capitalizar(dados.name)}" />` : ""}
        <span class="poke-number">#${String(dados.id).padStart(3, "0")}</span>
      </div>
      <div class="poke-info">
        <h2>${capitalizar(dados.name)}</h2>
        <div class="type-list">${tipos}</div>
        <dl class="stat-grid">
          <div><dt>Altura</dt><dd>${(dados.height / 10).toFixed(1)} m</dd></div>
          <div><dt>Peso</dt><dd>${(dados.weight / 10).toFixed(1)} kg</dd></div>
          <div><dt>Habilidades</dt><dd>${habilidades}</dd></div>
        </dl>
      </div>
    </article>
  `;
}

async function buscarPokemon(termo) {
  const nomeOuId = termo.toLowerCase().trim();
  if (!nomeOuId) return;

  mostrarCarregando();

  try {
    const resposta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nomeOuId)}`
    );
    if (!resposta.ok) {
      throw new Error("nao-encontrado");
    }
    const dados = await resposta.json();
    montarCard(dados);
  } catch (erro) {
    if (erro instanceof TypeError) {
      mostrarErro("A PokéAPI está fora do ar no momento. Tente de novo em instantes.");
    } else {
      mostrarErro(
        `Nenhum Pokémon encontrado para "${escaparHtml(nomeOuId)}". Confira o nome ou número.`
      );
    }
  }
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  buscarPokemon(campo.value);
});

document.querySelectorAll("[data-search]").forEach((botao) => {
  botao.addEventListener("click", () => {
    campo.value = botao.dataset.search;
    buscarPokemon(botao.dataset.search);
  });
});
