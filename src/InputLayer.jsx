// InputLayer.jsx
import React, { useState, useEffect, useRef } from 'react';

// -------------------------------------------
// INPUT LAYER - User input handling
// -------------------------------------------
function InputLayer({ gameContext }) {
  const {
    pool = [],
    gameStarted = false,
    isGameOver = false,
    targetDinosaur, // Needed to enable/disable input
    submitGuess,
    answerList = [] // Get answerList to filter out already guessed dinosaurs
  } = gameContext || {};

  const [guessInput, setGuessInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null); // Ref for the input element

  // Filter out already guessed dinosaurs from the pool for suggestions
  const availableForGuessing = React.useMemo(() => {
      const guessedNames = new Set(answerList.map(d => d.name.toLowerCase()));
      return pool.filter(d => !guessedNames.has(d.name.toLowerCase()));
  }, [pool, answerList]);


  // Handle input changes and update suggestions
  const handleInputChange = (event) => {
    const value = event.target.value;
    setGuessInput(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const lowerCaseValue = value.toLowerCase();
    // Suggest from available dinosaurs only
    const matched = availableForGuessing
      .filter(d => d.name.toLowerCase().includes(lowerCaseValue))
      .slice(0, 10); // Limit suggestions

    setSuggestions(matched);
  };

  // Handle clicking a suggestion
  const handleSuggestionClick = (dinoName) => {
    setGuessInput(dinoName);
    setSuggestions([]);
    // Optionally focus the input again after selection
    inputRef.current?.focus();
  };

  // Submit the guess
  const handleGuessSubmit = () => {
    if (!guessInput.trim() || isGameOver || !targetDinosaur || !submitGuess) return;

    const guessLower = guessInput.trim().toLowerCase();
    // Find in the original pool (or availableForGuessing, should be the same result)
    const foundDino = pool.find(d => d.name.toLowerCase() === guessLower);

    if (!foundDino) {
      alert(`"${guessInput}" is not a valid dinosaur in the current filter set.`);
      // Do not clear input if invalid
      return;
    }

    // Check if already guessed
     if (answerList.some(d => d.name.toLowerCase() === guessLower)) {
        alert(`You've already guessed "${foundDino.name}".`);
        return;
     }


    submitGuess(foundDino);
    setGuessInput(''); // Clear input after successful guess
    setSuggestions([]); // Clear suggestions
  };

  // Handle Enter key press in the input field
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
       // If suggestions are visible, Enter might be intended to select one (future enhancement)
       // For now, just submit the current input value
       handleGuessSubmit();
    }
  };

  // Clear suggestions when input loses focus (unless clicking on a suggestion)
  const handleBlur = () => {
      // Delay clearing suggestions slightly to allow suggestion click handler to fire
      setTimeout(() => {
          setSuggestions([]);
      }, 150);
  };


  // Don't render the input layer if the game hasn't started
  if (!gameStarted) {
    return null;
  }

  return (
    <div className="guess-input-container">
      <input
        ref={inputRef}
        type="text"
        className="guess-input"
        placeholder={targetDinosaur ? "Type a dinosaur name..." : "Waiting for target..."}
        value={guessInput}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur} // Add blur handler
        disabled={isGameOver || !targetDinosaur} // Disable when game over or no target
        autoComplete="off" // Prevent browser autocomplete interfering
        aria-label="Enter dinosaur guess"
        aria-autocomplete="list" // Indicate suggestions are available
        aria-controls="suggestions-list" // Link to suggestions list id
      />
      <button
        onClick={handleGuessSubmit}
        disabled={isGameOver || !guessInput.trim() || !targetDinosaur || !submitGuess}
        aria-label="Submit Guess"
      >
        Guess
      </button>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <ul id="suggestions-list" className="suggestions-list" role="listbox">
          {suggestions.map(dino => (
            <li
              key={dino.name}
              // Use onMouseDown to trigger before onBlur clears suggestions
              onMouseDown={() => handleSuggestionClick(dino.name)}
              role="option"
              aria-selected="false" // Manage selection state if adding keyboard navigation
              tabIndex={-1} // Make list items focusable programmatically if needed
            >
              {dino.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default InputLayer;