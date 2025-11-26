document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento de tipos para cor de fundo e classe de contraste de texto
    const pokemonTypes = {
        normal: { color: '#A8A77A', textClass: 'dark-text' }, 
        fire: { color: '#EE8130', textClass: 'light-text' }, 
        water: { color: '#6390F0', textClass: 'light-text' },  
        grass: { color: '#7AC74C', textClass: 'dark-text' }, 
        electric: { color: '#F7D02C', textClass: 'dark-text' }, 
        ice: { color: '#96D9D6', textClass: 'dark-text' }, 
        fighting: { color: '#C22E28', textClass: 'light-text' }, 
        poison: { color: '#A33EA1', textClass: 'light-text' }, 
        ground: { color: '#E2BF65', textClass: 'dark-text' }, 
        flying: { color: '#A98FF3', textClass: 'dark-text' }, 
        psychic: { color: '#F95587', textClass: 'light-text' }, 
        bug: { color: '#A6B91A', textClass: 'light-text' }, 
        rock: { color: '#B6A136', textClass: 'light-text' }, 
        ghost: { color: '#735797', textClass: 'light-text' }, 
        dragon: { color: '#6F35FC', textClass: 'light-text' }, 
        steel: { color: '#B7B7CE', textClass: 'dark-text' }, 
        fairy: { color: '#D685AD', textClass: 'dark-text' }, 
        dark: { color: '#705746', textClass: 'light-text' } 
    };

    const searchHistory = [];
    const historyList = document.getElementById('history-list');
    const searchButton = document.getElementById('search-button');
    const pokemonInput = document.getElementById('pokemon-input');
    const pokemonListDiv = document.getElementById('pokemon-list');
    const loadMoreButton = document.getElementById('load-more-button');
    const pokemonInfoDiv = document.getElementById('pokemon-info'); 

    let offset = 0;
    

    searchButton.addEventListener('click', () => {
        const pokemonNameOrId = pokemonInput.value.toLowerCase().trim();
        if (pokemonNameOrId) {
            fetchAndDisplayDetails(pokemonNameOrId, pokemonInfoDiv, true);
        } else {
            pokemonInfoDiv.innerHTML = '<p style="text-align: center; color: red;">Por favor, digite o nome ou ID do Pokémon.</p>';
        }
    });

    // Função para resetar o card fixo
    function resetActiveCard() {
        if (pokemonInfoDiv.classList.contains('active-details')) {
            pokemonInfoDiv.classList.remove('active-details', 'light-text', 'dark-text'); 
            pokemonInfoDiv.style.backgroundColor = ''; 
            pokemonInfoDiv.innerHTML = '<p style="text-align: center;">Clique em um Pokémon na lista para ver os detalhes aqui!</p>'; 
        }
    }

    async function fetchAndDisplayDetails(query, targetElement, isManualSearch = false) {
        
        if (!isManualSearch) {
            targetElement = pokemonInfoDiv; 
        } else {
            // Chamado apenas para busca manual
            resetActiveCard();
        }

        targetElement.innerHTML = '<p style="text-align: center;">Carregando...</p>';
        targetElement.style.textAlign = 'center';
        targetElement.style.height = '150px';

        try {
            const apiUrl = `https://pokeapi.co/api/v2/pokemon/${query}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                targetElement.innerHTML = `<p style="color: red;">Erro: Pokémon não encontrado!</p>`;
                targetElement.style.backgroundColor = '#fff';
                targetElement.classList.remove('active-details', 'light-text', 'dark-text'); 
                return;
            }
            
            const data = await response.json();
            addToHistory(data.name);
            displayPokemonDetails(data, targetElement, isManualSearch);
            
        } catch (error) {
            console.error(error.message);
            targetElement.innerHTML = `<p style="color: red;">Erro ao carregar detalhes.</p>`;
        }
    }

    function createStatsBar(stats) {
        
        const MAX_STAT_VALUE = 255; 

        let statsHtml = '<div class="stats-container"><h3>Estatísticas Base</h3>';

        stats.forEach(stat => {
            const statNameRaw = stat.stat.name; 
            const statName = statNameRaw.replace('-', ' ');
            const statValue = stat.base_stat;
            
            const percentage = (statValue / MAX_STAT_VALUE) * 100;
            const barWidth = Math.min(percentage, 100); 

            statsHtml += `
                <div class="stat-item">
                    <span class="stat-name">${statName}:</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${barWidth}%;"></div>
                    </div>
                    <span class="stat-value">${statValue}</span>
                </div>
            `;
        });

        statsHtml += '</div>';
        return statsHtml;
    }


    function displayPokemonDetails(pokemon, cardElement, isManualSearch) {
        
        const primaryType = pokemon.types[0].type.name; 
        const typeInfo = pokemonTypes[primaryType] || { color: '#B8B8B8', textClass: 'dark-text' };
        
        // CORREÇÃO: Remove todas as classes de contraste primeiro
        cardElement.classList.remove('light-text', 'dark-text'); 

        // Aplica a cor de fundo e a classe de contraste (ex: 'light-text')
        cardElement.classList.add('active-details', typeInfo.textClass); 
        cardElement.style.backgroundColor = typeInfo.color; 
        
        // Configurações de layout
        cardElement.style.textAlign = 'left';
        cardElement.style.height = 'auto';


        const types = pokemon.types
            .map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
            .join(', ');

        const pokeImage =
            pokemon.sprites.front_default ||
            pokemon.sprites.other['official-artwork'].front_default;

        const statsHtml = createStatsBar(pokemon.stats); 

        const htmlContent = `
            <h2>${pokemon.name} (#${pokemon.id})</h2>
            <img src="${pokeImage}" alt="${pokemon.name}" class="detail-img">
            <p><strong>Tipo(s):</strong> ${types}</p>
            <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
            <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
            ${statsHtml} 
        `;
        
        cardElement.innerHTML = htmlContent;

    }
    
    function addToHistory(name) {
        if (!searchHistory.includes(name)) {
            searchHistory.push(name);
        }
        displayHistory();
    }

    function displayHistory() {
        historyList.innerHTML = "";
        searchHistory.forEach(pokeName => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = pokeName;
            link.href = "#";
            link.addEventListener('click', () => {
                fetchAndDisplayDetails(pokeName, pokemonInfoDiv, true); 
            });
            li.appendChild(link);
            historyList.appendChild(li);
        });
    }

    function addCardClickListener(cardElement, pokemonName, pokeId) {
        const handler = () => {
            fetchAndDisplayDetails(pokemonName, pokemonInfoDiv, false);
        };
        cardElement.addEventListener('click', handler);
    }

    function displayPokemonList(pokemonArray) {
        pokemonArray.forEach(pokemon => {
            const card = document.createElement('div');
            card.classList.add('pokemon-card', 'list-item');
            const pokeId = pokemon.url.split('/').filter(Boolean).pop();
            card.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
            `;
            addCardClickListener(card, pokemon.name, pokeId);
            pokemonListDiv.appendChild(card);
        });
    }

    async function fetchPokemonList(offset = 0) {
        try {
            const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=150&offset=${offset}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Não foi possível carregar a lista de Pokémon.');
            }
            const data = await response.json();
            displayPokemonList(data.results);
        } catch (error) {
            console.error(error);
        }
    }

    loadMoreButton.addEventListener('click', () => {
        offset += 150;
        fetchPokemonList(offset);
    });

    fetchPokemonList(offset);
});