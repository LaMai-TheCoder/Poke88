// Global variables
let balance = localStorage.getItem('user_balance') ? parseFloat(localStorage.getItem('user_balance')) : 100.00;
let currentDisplayedCards = [];  // Array of currently fetched (buyable) cards
let currentPreviewCard = null;     // Card currently shown in preview panel
let toggleState = "displayed"; // "displayed" or "stored"

function updateBalanceDisplay() {
  document.getElementById('balanceDisplay').innerText = 'Balance: $' + balance.toFixed(2);
  localStorage.setItem('user_balance', balance.toFixed(2));
}

function clearPreviewPanel() {
  document.getElementById('cardInfoPanel').innerHTML = `<h2>Card Information</h2><p>Select a card to see details here.</p>`;
  currentPreviewCard = null;
}

// Display card details in the preview panel with "Store Card", "Remove Card" and "Sell Card" buttons.
function displayCardDetails(card) {
  currentPreviewCard = card;
  const panel = document.getElementById('cardInfoPanel');
  panel.innerHTML = `
    <div id="previewContainer">
      <div id="previewImage">
        <img src="${card.imageUrl}" alt="${card.name}">
      </div>
      <div id="previewDetails">
        <h2>${card.name}</h2>
        <p><strong>Type:</strong> ${card.type}</p>
        <p><strong>Price:</strong> ${card.displayPrice}</p>
        <button id="storeCurrentCardButton">Store Card</button>
        <button id="removeCurrentCardButton">Remove Card</button>
        <button id="sellCurrentCardButton">Sell Card</button>
      </div>
    </div>
  `;
  document.getElementById('storeCurrentCardButton').addEventListener('click', storeCurrentCard);
  document.getElementById('removeCurrentCardButton').addEventListener('click', removeCurrentCard);
  document.getElementById('sellCurrentCardButton').addEventListener('click', sellCurrentCard);
}

// Store the current preview card: add to localStorage, remove from display, clear preview.
function storeCurrentCard() {
  if (!currentPreviewCard) return;
  let storedCards = localStorage.getItem('stored_cards') ? JSON.parse(localStorage.getItem('stored_cards')) : [];
  storedCards.push(currentPreviewCard);
  localStorage.setItem('stored_cards', JSON.stringify(storedCards, null, 2));
  removeCardFromDisplay(currentPreviewCard.name);
  currentPreviewCard = null;
  clearPreviewPanel();
  alert('Card stored and removed from display.');
}

// Remove the current preview card from display (without storing) and clear preview.
function removeCurrentCard() {
  if (!currentPreviewCard) return;
  removeCardFromDisplay(currentPreviewCard.name);
  currentPreviewCard = null;
  clearPreviewPanel();
  alert('Card removed from display.');
}

// Sell the current preview card: add its price to balance, remove from display, clear preview.
function sellCurrentCard() {
  if (!currentPreviewCard) return;
  let salePrice = parseFloat(currentPreviewCard.numericPrice) || 0;
  balance += salePrice;
  updateBalanceDisplay();
  removeCardFromDisplay(currentPreviewCard.name);
  currentPreviewCard = null;
  clearPreviewPanel();
  alert(`Card sold for $${salePrice.toFixed(2)}`);
}

// Helper: remove a card element from display by matching its data-name,
// and update global array as well as stored cards in localStorage.
function removeCardFromDisplay(cardName) {
  const container = document.getElementById('cardsContainer');
  const cardElements = container.getElementsByClassName('card');
  Array.from(cardElements).forEach(cardElem => {
    if (cardElem.getAttribute('data-name') === cardName) {
      cardElem.classList.remove('highlight');
      cardElem.remove();
    }
  });
  currentDisplayedCards = currentDisplayedCards.filter(card => card.name !== cardName);
  // Also remove from stored cards in localStorage if present.
  let storedCards = localStorage.getItem('stored_cards') ? JSON.parse(localStorage.getItem('stored_cards')) : [];
  const newStoredCards = storedCards.filter(card => card.name !== cardName);
  if(newStoredCards.length !== storedCards.length) {
    localStorage.setItem('stored_cards', JSON.stringify(newStoredCards, null, 2));
  }
}

// Helper: highlight the clicked card by removing highlight from all and adding it to the clicked one.
function highlightCard(clickedCard) {
  const container = document.getElementById('cardsContainer');
  const allCards = container.getElementsByClassName('card');
  Array.from(allCards).forEach(card => {
    card.classList.remove('highlight');
  });
  clickedCard.classList.add('highlight');
}

// Store all displayed cards into localStorage and clear display and global array.
function storeData() {
  const container = document.getElementById('cardsContainer');
  const cardDivs = container.getElementsByClassName('card');
  let unsoldCards = [];
  for (let cardDiv of cardDivs) {
    const cardName = cardDiv.getAttribute('data-name');
    const cardImageUrl = cardDiv.querySelector('img').src;
    const cardType = cardDiv.getAttribute('data-type');
    const numericPrice = cardDiv.getAttribute('data-price') || "0";
    const displayPrice = numericPrice > 0 ? '$' + parseFloat(numericPrice).toFixed(2) : 'N/A';
    unsoldCards.push({
      name: cardName,
      type: cardType,
      numericPrice: numericPrice,
      displayPrice: displayPrice,
      imageUrl: cardImageUrl
    });
  }
  let storedCards = localStorage.getItem('stored_cards') ? JSON.parse(localStorage.getItem('stored_cards')) : [];
  storedCards = storedCards.concat(unsoldCards);
  localStorage.setItem('stored_cards', JSON.stringify(storedCards, null, 2));
  container.innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  alert('Displayed cards have been stored.');
}

// Show stored cards by loading them from localStorage into the display.
function showStoredCards() {
  const storedCardsStr = localStorage.getItem('stored_cards');
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  if (!storedCardsStr) {
    container.innerText = 'No stored cards found.';
    return;
  }
  const storedCards = JSON.parse(storedCardsStr);
  storedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', card.name);
    cardDiv.setAttribute('data-type', card.type);
    cardDiv.setAttribute('data-price', card.numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = card.imageUrl;
    imgElement.alt = card.name;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = card.name;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(card);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    container.appendChild(cardDiv);
  });
  clearPreviewPanel();
}

// Show displayed cards from the global array.
function showDisplayedCards() {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  if (!currentDisplayedCards || currentDisplayedCards.length === 0) {
    container.innerText = 'No displayed cards available.';
    return;
  }
  currentDisplayedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', card.name);
    cardDiv.setAttribute('data-type', card.type);
    cardDiv.setAttribute('data-price', card.numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = card.imageUrl;
    imgElement.alt = card.name;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = card.name;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(card);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    container.appendChild(cardDiv);
  });
  clearPreviewPanel();
}

// Single toggle button: toggles between showing displayed cards and stored cards.
function toggleCardsView() {
  if (toggleState === "displayed") {
    showStoredCards();
    toggleState = "stored";
  } else {
    showDisplayedCards();
    toggleState = "displayed";
  }
}

// Fetch cards from the Pokemon TCG API.
async function fetchCards() {
  const url = 'https://api.pokemontcg.io/v2/cards';
  try {
    const response = await fetch(url, {
      headers: { 'X-Api-Key': '65adfc76-e0e9-4eab-8ea4-36b04bcc14ff' }
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

// Weighted random selection based on card price.
function weightedRandom(cards) {
  const weights = cards.map(card => {
    let price = null;
    if (card.tcgplayer && card.tcgplayer.prices && card.tcgplayer.prices.normal && card.tcgplayer.prices.normal.market)
      price = card.tcgplayer.prices.normal.market;
    else if (card.cardmarket && card.cardmarket.prices && card.cardmarket.prices.averageSellPrice)
      price = card.cardmarket.prices.averageSellPrice;
    if (!price || price <= 0) price = 1;
    return 1 / Math.pow(price, 0.1);
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < cards.length; i++) {
    random -= weights[i];
    if (random <= 0) return cards[i];
  }
  return cards[cards.length - 1];
}

// Fetch and display 5 new Pokemon cards (buy new cards).
async function getPokemonCards() {
  // Clear display and global array to hide any stored view.
  document.getElementById('cardsContainer').innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  if (balance < 40) {
    alert('Insufficient funds to get Pokemon cards.');
    return;
  }
  balance -= 40;
  updateBalanceDisplay();
  const cards = await fetchCards();
  if (cards.length === 0) {
    document.getElementById('cardsContainer').innerText = 'No cards available.';
    return;
  }
  for (let i = 0; i < 5; i++) {
    const selectedCard = weightedRandom(cards);
    const cardName = selectedCard.name || 'Unknown Name';
    const cardTypes = selectedCard.types ? selectedCard.types.join(', ') : 'Unknown Type';
    let numericPrice = 0;
    if (selectedCard.tcgplayer && selectedCard.tcgplayer.prices && selectedCard.tcgplayer.prices.normal && selectedCard.tcgplayer.prices.normal.market)
      numericPrice = selectedCard.tcgplayer.prices.normal.market;
    else if (selectedCard.cardmarket && selectedCard.cardmarket.prices && selectedCard.cardmarket.prices.averageSellPrice)
      numericPrice = selectedCard.cardmarket.prices.averageSellPrice;
    const displayPrice = numericPrice > 0 ? '$' + numericPrice.toFixed(2) : 'N/A';
    let cardImageUrl = '';
    if (selectedCard.images && selectedCard.images.small)
      cardImageUrl = selectedCard.images.small;
    else if (selectedCard.images && selectedCard.images.large)
      cardImageUrl = selectedCard.images.large;
      
    const cardObj = {
      name: cardName,
      type: cardTypes,
      numericPrice: numericPrice,
      displayPrice: displayPrice,
      imageUrl: cardImageUrl
    };
    currentDisplayedCards.push(cardObj);
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', cardName);
    cardDiv.setAttribute('data-type', cardTypes);
    cardDiv.setAttribute('data-price', numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = cardImageUrl;
    imgElement.alt = cardName;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = cardName;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(cardObj);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    document.getElementById('cardsContainer').appendChild(cardDiv);
  }
}

// Sell all displayed cards, clear display and global array, and clear preview.
function sellCards() {
  const container = document.getElementById('cardsContainer');
  const cardDivs = container.getElementsByClassName('card');
  let totalSale = 0;
  for (let cardDiv of cardDivs) {
    totalSale += parseFloat(cardDiv.getAttribute('data-price')) || 0;
  }
  balance += totalSale;
  updateBalanceDisplay();
  container.innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  alert('Sold displayed cards for $' + totalSale.toFixed(2));
}

// Single toggle button: toggles between showing displayed cards and stored cards.
function toggleCardsView() {
  if (toggleState === "displayed") {
    showStoredCards();
    toggleState = "stored";
  } else {
    showDisplayedCards();
    toggleState = "displayed";
  }
}

// Helper: highlight the clicked card by removing highlight from all and adding it to the clicked card.
function highlightCard(clickedCard) {
  const container = document.getElementById('cardsContainer');
  const allCards = container.getElementsByClassName('card');
  Array.from(allCards).forEach(card => {
    card.classList.remove('highlight');
  });
  clickedCard.classList.add('highlight');
}

// Show stored cards by loading them from localStorage into the display.
function showStoredCards() {
  const storedCardsStr = localStorage.getItem('stored_cards');
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  if (!storedCardsStr) {
    container.innerText = 'No stored cards found.';
    return;
  }
  const storedCards = JSON.parse(storedCardsStr);
  storedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', card.name);
    cardDiv.setAttribute('data-type', card.type);
    cardDiv.setAttribute('data-price', card.numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = card.imageUrl;
    imgElement.alt = card.name;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = card.name;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(card);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    container.appendChild(cardDiv);
  });
  clearPreviewPanel();
}

// Show displayed cards from the global array.
function showDisplayedCards() {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  if (!currentDisplayedCards || currentDisplayedCards.length === 0) {
    container.innerText = 'No displayed cards available.';
    return;
  }
  currentDisplayedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', card.name);
    cardDiv.setAttribute('data-type', card.type);
    cardDiv.setAttribute('data-price', card.numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = card.imageUrl;
    imgElement.alt = card.name;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = card.name;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(card);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    container.appendChild(cardDiv);
  });
  clearPreviewPanel();
}

// Fetch cards from the Pokemon TCG API.
async function fetchCards() {
  const url = 'https://api.pokemontcg.io/v2/cards';
  try {
    const response = await fetch(url, {
      headers: { 'X-Api-Key': '65adfc76-e0e9-4eab-8ea4-36b04bcc14ff' }
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

// Weighted random selection based on card price.
function weightedRandom(cards) {
  const weights = cards.map(card => {
    let price = null;
    if (card.tcgplayer && card.tcgplayer.prices && card.tcgplayer.prices.normal && card.tcgplayer.prices.normal.market)
      price = card.tcgplayer.prices.normal.market;
    else if (card.cardmarket && card.cardmarket.prices && card.cardmarket.prices.averageSellPrice)
      price = card.cardmarket.prices.averageSellPrice;
    if (!price || price <= 0) price = 1;
    return 1 / Math.pow(price, 0.1);
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < cards.length; i++) {
    random -= weights[i];
    if (random <= 0) return cards[i];
  }
  return cards[cards.length - 1];
}

// Fetch and display 5 new Pokemon cards (buy new cards).
async function getPokemonCards() {
  // Clear display and global array to hide any stored view.
  document.getElementById('cardsContainer').innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  if (balance < 40) {
    alert('Insufficient funds to get Pokemon cards.');
    return;
  }
  balance -= 40;
  updateBalanceDisplay();
  const cards = await fetchCards();
  if (cards.length === 0) {
    document.getElementById('cardsContainer').innerText = 'No cards available.';
    return;
  }
  for (let i = 0; i < 5; i++) {
    const selectedCard = weightedRandom(cards);
    const cardName = selectedCard.name || 'Unknown Name';
    const cardTypes = selectedCard.types ? selectedCard.types.join(', ') : 'Unknown Type';
    let numericPrice = 0;
    if (selectedCard.tcgplayer && selectedCard.tcgplayer.prices && selectedCard.tcgplayer.prices.normal && selectedCard.tcgplayer.prices.normal.market)
      numericPrice = selectedCard.tcgplayer.prices.normal.market;
    else if (selectedCard.cardmarket && selectedCard.cardmarket.prices && selectedCard.cardmarket.prices.averageSellPrice)
      numericPrice = selectedCard.cardmarket.prices.averageSellPrice;
    const displayPrice = numericPrice > 0 ? '$' + numericPrice.toFixed(2) : 'N/A';
    let cardImageUrl = '';
    if (selectedCard.images && selectedCard.images.small)
      cardImageUrl = selectedCard.images.small;
    else if (selectedCard.images && selectedCard.images.large)
      cardImageUrl = selectedCard.images.large;
      
    const cardObj = {
      name: cardName,
      type: cardTypes,
      numericPrice: numericPrice,
      displayPrice: displayPrice,
      imageUrl: cardImageUrl
    };
    currentDisplayedCards.push(cardObj);
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', cardName);
    cardDiv.setAttribute('data-type', cardTypes);
    cardDiv.setAttribute('data-price', numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = cardImageUrl;
    imgElement.alt = cardName;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = cardName;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(cardObj);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    document.getElementById('cardsContainer').appendChild(cardDiv);
  }
}

// Sell all displayed cards, clear display and global array, and clear preview.
function sellCards() {
  const container = document.getElementById('cardsContainer');
  const cardDivs = container.getElementsByClassName('card');
  let totalSale = 0;
  for (let cardDiv of cardDivs) {
    totalSale += parseFloat(cardDiv.getAttribute('data-price')) || 0;
  }
  balance += totalSale;
  updateBalanceDisplay();
  container.innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  alert('Sold displayed cards for $' + totalSale.toFixed(2));
}

// Single toggle button: toggles between showing displayed cards and stored cards.
function toggleCardsView() {
  if (toggleState === "displayed") {
    showStoredCards();
    toggleState = "stored";
  } else {
    showDisplayedCards();
    toggleState = "displayed";
  }
}

// Helper: highlight the clicked card by removing highlight from all and adding it to the clicked card.
function highlightCard(clickedCard) {
  const container = document.getElementById('cardsContainer');
  const allCards = container.getElementsByClassName('card');
  Array.from(allCards).forEach(card => {
    card.classList.remove('highlight');
  });
  clickedCard.classList.add('highlight');
}

// Show stored cards by loading them from localStorage into the display.
function showStoredCards() {
  const storedCardsStr = localStorage.getItem('stored_cards');
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  if (!storedCardsStr) {
    container.innerText = 'No stored cards found.';
    return;
  }
  const storedCards = JSON.parse(storedCardsStr);
  storedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', card.name);
    cardDiv.setAttribute('data-type', card.type);
    cardDiv.setAttribute('data-price', card.numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = card.imageUrl;
    imgElement.alt = card.name;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = card.name;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(card);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    container.appendChild(cardDiv);
  });
  clearPreviewPanel();
}

// Show displayed cards from the global array.
function showDisplayedCards() {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  if (!currentDisplayedCards || currentDisplayedCards.length === 0) {
    container.innerText = 'No displayed cards available.';
    return;
  }
  currentDisplayedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', card.name);
    cardDiv.setAttribute('data-type', card.type);
    cardDiv.setAttribute('data-price', card.numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = card.imageUrl;
    imgElement.alt = card.name;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = card.name;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(card);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    container.appendChild(cardDiv);
  });
  clearPreviewPanel();
}

// Fetch cards from the Pokemon TCG API.
async function fetchCards() {
  const url = 'https://api.pokemontcg.io/v2/cards';
  try {
    const response = await fetch(url, {
      headers: { 'X-Api-Key': '65adfc76-e0e9-4eab-8ea4-36b04bcc14ff' }
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

// Weighted random selection based on card price.
function weightedRandom(cards) {
  const weights = cards.map(card => {
    let price = null;
    if (card.tcgplayer && card.tcgplayer.prices && card.tcgplayer.prices.normal && card.tcgplayer.prices.normal.market)
      price = card.tcgplayer.prices.normal.market;
    else if (card.cardmarket && card.cardmarket.prices && card.cardmarket.prices.averageSellPrice)
      price = card.cardmarket.prices.averageSellPrice;
    if (!price || price <= 0) price = 1;
    return 1 / Math.pow(price, 0.1);
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < cards.length; i++) {
    random -= weights[i];
    if (random <= 0) return cards[i];
  }
  return cards[cards.length - 1];
}

// Fetch and display 5 new Pokemon cards (buy new cards).
async function getPokemonCards() {
  // Clear display and global array to hide any stored view.
  document.getElementById('cardsContainer').innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  if (balance < 40) {
    alert('Insufficient funds to get Pokemon cards.');
    return;
  }
  balance -= 40;
  updateBalanceDisplay();
  const cards = await fetchCards();
  if (cards.length === 0) {
    document.getElementById('cardsContainer').innerText = 'No cards available.';
    return;
  }
  for (let i = 0; i < 5; i++) {
    const selectedCard = weightedRandom(cards);
    const cardName = selectedCard.name || 'Unknown Name';
    const cardTypes = selectedCard.types ? selectedCard.types.join(', ') : 'Unknown Type';
    let numericPrice = 0;
    if (selectedCard.tcgplayer && selectedCard.tcgplayer.prices && selectedCard.tcgplayer.prices.normal && selectedCard.tcgplayer.prices.normal.market)
      numericPrice = selectedCard.tcgplayer.prices.normal.market;
    else if (selectedCard.cardmarket && selectedCard.cardmarket.prices && selectedCard.cardmarket.prices.averageSellPrice)
      numericPrice = selectedCard.cardmarket.prices.averageSellPrice;
    const displayPrice = numericPrice > 0 ? '$' + numericPrice.toFixed(2) : 'N/A';
    let cardImageUrl = '';
    if (selectedCard.images && selectedCard.images.small)
      cardImageUrl = selectedCard.images.small;
    else if (selectedCard.images && selectedCard.images.large)
      cardImageUrl = selectedCard.images.large;
      
    const cardObj = {
      name: cardName,
      type: cardTypes,
      numericPrice: numericPrice,
      displayPrice: displayPrice,
      imageUrl: cardImageUrl
    };
    currentDisplayedCards.push(cardObj);
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', cardName);
    cardDiv.setAttribute('data-type', cardTypes);
    cardDiv.setAttribute('data-price', numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = cardImageUrl;
    imgElement.alt = cardName;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = cardName;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(cardObj);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    document.getElementById('cardsContainer').appendChild(cardDiv);
  }
}

// Sell all displayed cards, clear display and global array, and clear preview.
function sellCards() {
  const container = document.getElementById('cardsContainer');
  const cardDivs = container.getElementsByClassName('card');
  let totalSale = 0;
  for (let cardDiv of cardDivs) {
    totalSale += parseFloat(cardDiv.getAttribute('data-price')) || 0;
  }
  balance += totalSale;
  updateBalanceDisplay();
  container.innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  alert('Sold displayed cards for $' + totalSale.toFixed(2));
}

// Single toggle button: toggles between showing displayed cards and stored cards.
function toggleCardsView() {
  if (toggleState === "displayed") {
    showStoredCards();
    toggleState = "stored";
  } else {
    showDisplayedCards();
    toggleState = "displayed";
  }
}

// Helper: highlight the clicked card by removing highlight from all and adding it to the clicked card.
function highlightCard(clickedCard) {
  const container = document.getElementById('cardsContainer');
  const allCards = container.getElementsByClassName('card');
  Array.from(allCards).forEach(card => {
    card.classList.remove('highlight');
  });
  clickedCard.classList.add('highlight');
}

// Show stored cards by loading them from localStorage into the display.
function showStoredCards() {
  const storedCardsStr = localStorage.getItem('stored_cards');
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  if (!storedCardsStr) {
    container.innerText = 'No stored cards found.';
    return;
  }
  const storedCards = JSON.parse(storedCardsStr);
  storedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', card.name);
    cardDiv.setAttribute('data-type', card.type);
    cardDiv.setAttribute('data-price', card.numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = card.imageUrl;
    imgElement.alt = card.name;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = card.name;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(card);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    container.appendChild(cardDiv);
  });
  clearPreviewPanel();
}

// Show displayed cards from the global array.
function showDisplayedCards() {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  if (!currentDisplayedCards || currentDisplayedCards.length === 0) {
    container.innerText = 'No displayed cards available.';
    return;
  }
  currentDisplayedCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', card.name);
    cardDiv.setAttribute('data-type', card.type);
    cardDiv.setAttribute('data-price', card.numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = card.imageUrl;
    imgElement.alt = card.name;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = card.name;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(card);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    container.appendChild(cardDiv);
  });
  clearPreviewPanel();
}

// Fetch cards from the Pokemon TCG API.
async function fetchCards() {
  const url = 'https://api.pokemontcg.io/v2/cards';
  try {
    const response = await fetch(url, {
      headers: { 'X-Api-Key': '65adfc76-e0e9-4eab-8ea4-36b04bcc14ff' }
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

// Weighted random selection based on card price.
function weightedRandom(cards) {
  const weights = cards.map(card => {
    let price = null;
    if (card.tcgplayer && card.tcgplayer.prices && card.tcgplayer.prices.normal && card.tcgplayer.prices.normal.market)
      price = card.tcgplayer.prices.normal.market;
    else if (card.cardmarket && card.cardmarket.prices && card.cardmarket.prices.averageSellPrice)
      price = card.cardmarket.prices.averageSellPrice;
    if (!price || price <= 0) price = 1;
    return 1 / Math.pow(price, 0.1);
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < cards.length; i++) {
    random -= weights[i];
    if (random <= 0) return cards[i];
  }
  return cards[cards.length - 1];
}

// Fetch and display 5 new Pokemon cards (buy new cards).
async function getPokemonCards() {
  // Clear display and global array to hide any stored view.
  document.getElementById('cardsContainer').innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  if (balance < 40) {
    alert('Insufficient funds to get Pokemon cards.');
    return;
  }
  balance -= 40;
  updateBalanceDisplay();
  const cards = await fetchCards();
  if (cards.length === 0) {
    document.getElementById('cardsContainer').innerText = 'No cards available.';
    return;
  }
  for (let i = 0; i < 5; i++) {
    const selectedCard = weightedRandom(cards);
    const cardName = selectedCard.name || 'Unknown Name';
    const cardTypes = selectedCard.types ? selectedCard.types.join(', ') : 'Unknown Type';
    let numericPrice = 0;
    if (selectedCard.tcgplayer && selectedCard.tcgplayer.prices && selectedCard.tcgplayer.prices.normal && selectedCard.tcgplayer.prices.normal.market)
      numericPrice = selectedCard.tcgplayer.prices.normal.market;
    else if (selectedCard.cardmarket && selectedCard.cardmarket.prices && selectedCard.cardmarket.prices.averageSellPrice)
      numericPrice = selectedCard.cardmarket.prices.averageSellPrice;
    const displayPrice = numericPrice > 0 ? '$' + numericPrice.toFixed(2) : 'N/A';
    let cardImageUrl = '';
    if (selectedCard.images && selectedCard.images.small)
      cardImageUrl = selectedCard.images.small;
    else if (selectedCard.images && selectedCard.images.large)
      cardImageUrl = selectedCard.images.large;
      
    const cardObj = {
      name: cardName,
      type: cardTypes,
      numericPrice: numericPrice,
      displayPrice: displayPrice,
      imageUrl: cardImageUrl
    };
    currentDisplayedCards.push(cardObj);
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-name', cardName);
    cardDiv.setAttribute('data-type', cardTypes);
    cardDiv.setAttribute('data-price', numericPrice);
    const imgElement = document.createElement('img');
    imgElement.src = cardImageUrl;
    imgElement.alt = cardName;
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-name';
    nameDiv.innerText = cardName;
    cardDiv.addEventListener('click', function(e) {
      highlightCard(this);
      displayCardDetails(cardObj);
    });
    cardDiv.appendChild(imgElement);
    cardDiv.appendChild(nameDiv);
    document.getElementById('cardsContainer').appendChild(cardDiv);
  }
}

// Sell all displayed cards, clear display and global array, and clear preview.
function sellCards() {
  const container = document.getElementById('cardsContainer');
  const cardDivs = container.getElementsByClassName('card');
  let totalSale = 0;
  for (let cardDiv of cardDivs) {
    totalSale += parseFloat(cardDiv.getAttribute('data-price')) || 0;
  }
  balance += totalSale;
  updateBalanceDisplay();
  container.innerHTML = '';
  currentDisplayedCards = [];
  clearPreviewPanel();
  alert('Sold displayed cards for $' + totalSale.toFixed(2));
}

// Single toggle button: toggles between showing displayed cards and stored cards.
function toggleCardsView() {
  if (toggleState === "displayed") {
    showStoredCards();
    toggleState = "stored";
  } else {
    showDisplayedCards();
    toggleState = "displayed";
  }
}

// Helper: highlight the clicked card by removing highlight from all and adding it to the clicked card.
function highlightCard(clickedCard) {
  const container = document.getElementById('cardsContainer');
  const allCards = container.getElementsByClassName('card');
  Array.from(allCards).forEach(card => {
    card.classList.remove('highlight');
  });
  clickedCard.classList.add('highlight');
}

// Event listeners
document.getElementById('getCardsButton').addEventListener('click', getPokemonCards);
document.getElementById('sellCardsButton').addEventListener('click', sellCards);
document.getElementById('storeDataButton').addEventListener('click', storeData);
document.getElementById('toggleCardsButton').addEventListener('click', toggleCardsView);

updateBalanceDisplay();