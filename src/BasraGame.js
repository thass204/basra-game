import { useState, useEffect } from "react";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export default function BasraGame() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [botHand, setBotHand] = useState([]);
  const [tableCards, setTableCards] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [round, setRound] = useState(1);
  const [burned7Diamonds, setBurned7Diamonds] = useState(false);
  const [basras, setBasras] = useState({ player: 0, bot: 0 });
  const [winningTotal, setWinningTotal] = useState(150);
  const [message, setMessage] = useState("Welcome to Basra!");
  const [playerCaptured, setPlayerCaptured] = useState([]);
  const [botCaptured, setBotCaptured] = useState([]);

  useEffect(() => {
    startNewGame();
  }, []);

  function generateDeck() {
    const suits = ["♠", "♣", "♥", "♦"];
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    return suits.flatMap(suit => ranks.map(rank => ({ rank, suit })));
  }

  function shuffle(deck) {
    const array = [...deck];
    for (let i = array.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function startNewGame() {
    const newDeck = shuffle(generateDeck());
    const initialTable = newDeck.splice(0, 4);
    const playerCards = newDeck.splice(0, 4);
    const botCards = newDeck.splice(0, 4);
    setDeck(newDeck);
    setTableCards(initialTable);
    setPlayerHand(playerCards);
    setBotHand(botCards);
    setPlayerCaptured([]);
    setBotCaptured([]);
    setMessage("Game started. Your move.");
  }

  function isJack(card) {
    return card.rank === "J";
  }

  function isSevenDiamonds(card) {
    return card.rank === "7" && card.suit === "♦";
  }

  function playCard(card, isPlayer = true) {
    let newTable = [...tableCards];
    let capture = false;
    let isBasra = false;
    let capturedCards = [];

    if (isSevenDiamonds(card)) {
      setBurned7Diamonds(true);
      setMessage("7♦ has been burned!");
    }

    if (burned7Diamonds) {
      isBasra = true;
      capturedCards = [...newTable];
      newTable = [];
    } else if (isJack(card)) {
      if (newTable.length > 0) {
        capturedCards = [...newTable];
        newTable = [];
        isBasra = true;
      }
    } else {
      const matchIndex = newTable.findIndex(c => c.rank === card.rank);
      if (matchIndex !== -1) {
        capturedCards.push(newTable[matchIndex]);
        newTable.splice(matchIndex, 1);
        capture = true;
        if (newTable.length === 0) isBasra = true;
      } else {
        newTable.push(card);
      }
    }

    if (isPlayer) {
      setPlayerHand(prev => prev.filter(c => c !== card));
      setPlayerCaptured(prev => [...prev, ...capturedCards, card]);
      if (isBasra) setBasras(prev => ({ ...prev, player: prev.player + 1 }));
    } else {
      setBotHand(prev => prev.filter(c => c !== card));
      setBotCaptured(prev => [...prev, ...capturedCards, card]);
      if (isBasra) setBasras(prev => ({ ...prev, bot: prev.bot + 1 }));
    }

    setTableCards(newTable);
    setMessage(isBasra ? (isJack(card) ? "Jack Basra! +30 points" : "Basra!") : capture ? "Captured card!" : "Card placed on table.");
  }

  function botMove() {
    const hand = [...botHand];
    const card = hand[getRandomInt(hand.length)];
    playCard(card, false);
  }

  function calculateScore(captured, basraCount, isJackBasra = false) {
    let score = basraCount * 10;
    if (isJackBasra) score += 30;
    if (captured.length > 26) score += 30; // majority of cards
    return score;
  }

  function endRound() {
    const playerJackBasra = playerCaptured.some(c => isJack(c));
    const botJackBasra = botCaptured.some(c => isJack(c));
    const pScore = calculateScore(playerCaptured, basras.player, playerJackBasra);
    const bScore = calculateScore(botCaptured, basras.bot, botJackBasra);
    setPlayerScore(prev => prev + pScore);
    setBotScore(prev => prev + bScore);
    setMessage(`Round ${round} ended. P1: ${pScore}, Bot: ${bScore}`);
    setRound(prev => prev + 1);
    if (playerScore + pScore >= winningTotal || botScore + bScore >= winningTotal) {
      setMessage(playerScore + pScore >= winningTotal ? "You win the match!" : "Bot wins the match!");
    } else {
      startNewGame();
    }
  }

  return (
    <div className="min-h-screen bg-green-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">🃏 Basra - Egyptian Café Edition</h1>
      <div className="bg-black bg-opacity-60 rounded p-4 mb-4">
        <p>{message}</p>
        <label className="block mt-4">Winning Score:
          <input
            type="range"
            min="150"
            max="500"
            step="10"
            value={winningTotal}
            onChange={(e) => setWinningTotal(parseInt(e.target.value))}
          /> {winningTotal}
        </label>
        <p className="mt-2">Scores — You: {playerScore} | Bot: {botScore}</p>
        <p>Basras — You: {basras.player} | Bot: {basras.bot}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Table</h2>
        <div className="flex gap-2 flex-wrap p-2 bg-yellow-100 bg-opacity-80 rounded shadow-inner">
          {tableCards.map((card, idx) => (
            <div key={idx} className="w-16 h-24 border border-black bg-white text-black text-lg flex items-center justify-center rounded">
              {card.rank}{card.suit}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Your Hand</h2>
        <div className="flex gap-2 flex-wrap">
          {playerHand.map((card, idx) => (
            <button
              key={idx}
              onClick={() => {
                playCard(card);
                setTimeout(botMove, 1000);
              }}
              className="w-16 h-24 bg-white text-black text-lg font-semibold rounded border border-gray-800 hover:bg-gray-200"
            >
              {card.rank}{card.suit}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={endRound}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          End Round
        </button>
      </div>
    </div>
  );
}
