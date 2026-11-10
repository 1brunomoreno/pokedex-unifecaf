// ===== 1. CONFIGURAÇÕES E ELEMENTOS DA PÁGINA =====
const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=151'; // 1ª geração (1996)

const container = document.getElementById('cards');
const carregando = document.getElementById('carregando');
const busca = document.getElementById('busca');

// Favoritos salvos no navegador (continuam marcados ao recarregar)
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

// Tradução dos tipos para português
const tiposPT = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Venenoso',
  ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
  steel: 'Aço', fairy: 'Fada'
};

// ===== 2. CONSUMO DA API COM FETCH =====
function carregarPokemons() {
  fetch(API_URL)
    .then(resposta => {
      if (!resposta.ok) throw new Error('Erro HTTP: ' + resposta.status);
      return resposta.json(); // converte a resposta em objeto JavaScript
    })
    .then(dados => {
      console.log('Lista recebida da PokéAPI:', dados);

      // A lista só traz nome + URL; buscamos os detalhes de cada um
      const promessas = dados.results.map(p =>
        fetch(p.url).then(r => r.json())
      );
      return Promise.all(promessas); // espera todas as requisições
    })
    .then(pokemons => {
      console.log('Detalhes dos Pokémon:', pokemons);
      pokemons.forEach(criarCard); // cria um card para cada Pokémon
      carregando.style.display = 'none';
    })
    .catch(erro => {
      console.error('Falha ao consumir a API:', erro);
      carregando.textContent = 'Não foi possível carregar os Pokémon. Tente novamente mais tarde.';
    });
}

// ===== 3. CRIAÇÃO DINÂMICA DO CARD (DOM) =====
function criarCard(pokemon) {
  const tipoPrincipal = pokemon.types[0].type.name;

  // Card principal
  const card = document.createElement('article');
  card.classList.add('card', `tipo-${tipoPrincipal}`);
  card.dataset.nome = pokemon.name; // usado na busca

  // Botão de favorito (coração)
  const botaoFav = document.createElement('button');
  botaoFav.classList.add('favorito');
  botaoFav.setAttribute('aria-label', 'Favoritar');
  atualizarCoracao(botaoFav, favoritos.includes(pokemon.id));
  botaoFav.addEventListener('click', () => alternarFavorito(pokemon.id, botaoFav));

  // Número (#001)
  const numero = document.createElement('span');
  numero.classList.add('numero');
  numero.textContent = '#' + String(pokemon.id).padStart(3, '0');

  // Nome
  const nome = document.createElement('h2');
  nome.textContent = pokemon.name;

  // Imagem
  const imagem = document.createElement('img');
  imagem.src = pokemon.sprites.other['official-artwork'].front_default;
  imagem.alt = pokemon.name;
  imagem.loading = 'lazy';

  // Tipos (etiquetas)
  const tipos = document.createElement('div');
  tipos.classList.add('tipos');
  pokemon.types.forEach(t => {
    const etiqueta = document.createElement('span');
    etiqueta.classList.add('tipo', `tipo-${t.type.name}`);
    etiqueta.textContent = tiposPT[t.type.name] || t.type.name;
    tipos.appendChild(etiqueta);
  });

  // Informações adicionais
  const info = document.createElement('p');
  info.classList.add('info');
  info.textContent = `Altura: ${pokemon.height / 10} m • Peso: ${pokemon.weight / 10} kg`;

  // Monta o card e coloca na página
  card.appendChild(botaoFav);
  card.appendChild(numero);
  card.appendChild(nome);
  card.appendChild(imagem);
  card.appendChild(tipos);
  card.appendChild(info);
  container.appendChild(card);
}

// ===== 4. FAVORITOS =====
function atualizarCoracao(botao, ativo) {
  botao.textContent = ativo ? '❤' : '♡';
  botao.classList.toggle('ativo', ativo);
}

function alternarFavorito(id, botao) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(f => f !== id);
  } else {
    favoritos.push(id);
  }
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  atualizarCoracao(botao, favoritos.includes(id));
}

// ===== 5. BUSCA =====
busca.addEventListener('input', () => {
  const termo = busca.value.toLowerCase().trim();
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = card.dataset.nome.includes(termo) ? '' : 'none';
  });
});

// ===== 6. INICIA =====
carregarPokemons();
