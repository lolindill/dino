// GameLayer.jsx
import React, { useState, useCallback } from 'react';
import dinosaurData from './dino_data.json'; // Make sure dino_data.json is in the same directory or adjust path

// -------------------------------------------
// GAME LAYER - Core game mechanics and state
// -------------------------------------------
function GameLayer({ children }) {
  // Core game state
  const [allDinosaurs] = useState(dinosaurData); // Removed setAllDinosaurs if not used directly
  const [pool, setPool] = useState([]);
  const [targetDinosaur, setTargetDinosaur] = useState(null);
  const [answerList, setAnswerList] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const maxGuesses = 10;

  // Initialize pool based on filters
  const initializePool = useCallback((selectedCladesArray, difficultyFilter) => {
    const filtered = allDinosaurs.filter(d => {
      // MODIFIED: Check if the array is empty (meaning "All") OR if the dino's clade is in the array
      const matchesClade = selectedCladesArray.length === 0 || (d.Clade && selectedCladesArray.includes(d.Clade));

      const matchesDifficulty =
        difficultyFilter === "Easy" ? d.level === "Easy" :
        difficultyFilter === "Hard" ? (d.level === "Hard" || d.level === "Easy") : true; // Hard includes Easy
      return matchesClade && matchesDifficulty;
    });

    setPool(filtered);
    return filtered; // Return filtered pool for immediate use in startGame
  // MODIFIED: Dependency remains allDinosaurs
  }, [allDinosaurs]);


  // Start a new game with selected target
  const startGame = useCallback((filteredPool) => {
    if (filteredPool.length > 0) {
      const newTarget = filteredPool[Math.floor(Math.random() * filteredPool.length)];
      setTargetDinosaur(newTarget);
      setGameStarted(true);
      setIsGameOver(false);
      setAnswerList([]);
      setResultMessage('');
    } else {
      // Handle case where filters result in no dinosaurs
      setTargetDinosaur(null);
      setPool([]); // Clear the pool as well
      setGameStarted(false); // Can't start the game
      setResultMessage("No dinosaurs match the current filters.");
    }
  }, []); // Dependencies: none, as it uses the passed filteredPool

  // Submit a guess
  const submitGuess = useCallback((dinosaur) => {
    if (!gameStarted || isGameOver || !targetDinosaur) return;

    const newAnswerList = [dinosaur, ...answerList];
    setAnswerList(newAnswerList);

    // Check win/lose conditions
    if (dinosaur.name === targetDinosaur.name) {
      setResultMessage(`🎉 You got it! The answer was ${targetDinosaur.name}.`);
      setIsGameOver(true);
    } else if (newAnswerList.length >= maxGuesses) {
      setResultMessage(`😢 Out of guesses! The answer was ${targetDinosaur.name}.`);
      setIsGameOver(true);
    }
  }, [gameStarted, isGameOver, targetDinosaur, answerList, maxGuesses]); // Added missing dependency maxGuesses

  // Reset game (back to filter selection)
  const resetGame = useCallback(() => {
    setGameStarted(false);
    setIsGameOver(false);
    setAnswerList([]);
    setResultMessage('');
    setTargetDinosaur(null);
    setPool([]); // Clear the pool when resetting filters
  }, []);

  // --- Comparison logic ---
  const compareLength = useCallback((guessLengthStr) => {
    if (!targetDinosaur || !guessLengthStr) return { icon: '', className: '' }; // Return default object
    // Ensure consistent string format before parsing
    const guessVal = parseFloat(String(guessLengthStr).replace("m", "").trim());
    const targetVal = parseFloat(String(targetDinosaur.length).replace("m", "").trim());

    if (isNaN(guessVal) || isNaN(targetVal)) return { icon: '?', className: 'unknown' }; // Handle parsing errors

    if (guessVal === targetVal) return { icon: '✅', className: 'correct' };
    return guessVal > targetVal
        ? { icon: '⬇️', className: 'close-down' }
        : { icon: '⬆️', className: 'close-up' };
  }, [targetDinosaur]); // Dependency: targetDinosaur

  const compareAttribute = useCallback((guessAttr, targetAttr) => {
    // Handle potential undefined/null values
    if (guessAttr === undefined || targetAttr === undefined || guessAttr === null || targetAttr === null) {
        return { icon: '?', className: 'unknown' };
    }
    return guessAttr === targetAttr
      ? { icon: '✅', className: 'correct' }
      : { icon: '❌', className: 'incorrect' };
  }, []); // No external dependencies if targetAttr comes from targetDinosaur context

   const compareCladeTree = useCallback((guessTree, targetTree) => {
    if (!guessTree || !targetTree || !Array.isArray(guessTree) || !Array.isArray(targetTree)) {
        return { icon: '❌', className: 'incorrect' };
    }

    const minLength = Math.min(guessTree.length, targetTree.length);
    let match = true;

    for (let i = 0; i < minLength; i++) {
        if (guessTree[i] !== targetTree[i]) {
            match = false;
            break; // Exit loop as soon as a mismatch is found
        }
    }

    if (match && guessTree.length === targetTree.length) {
        return { icon: '✅', className: 'correct' }; // Perfect match
    } else if (match && guessTree.length < targetTree.length) {
        // Check if the guess is a *direct* ancestor (all matching elements are the same)
         let isAncestor = true;
         for(let i = 0; i < guessTree.length; i++) {
            if (guessTree[i] !== targetTree[i]) {
                isAncestor = false;
                break;
            }
         }
         if (isAncestor) {
            return { icon: '🔼', className: 'partial-match' }; // Guess is higher up the tree
         } else {
             return { icon: '❌', className: 'incorrect' }; // Mismatch somewhere even if lengths differ
         }

    }
    // If lengths differ but the common part doesn't match, or guess is longer but doesn't match fully
    else {
        // Let's refine this: Check if *any* part matches to give partial credit
        let partialMatchFound = false;
        for (let i = 0; i < minLength; i++) {
           if (guessTree[i] === targetTree[i]) {
               partialMatchFound = true;
               // You could potentially return a different icon/class here if needed
               // For now, stick to the original logic's outcome for non-exact/ancestor matches
               break; // Found at least one common ancestor level
           }
        }
        // If we reached here, it means either guessTree.length > targetTree.length
        // or there was a mismatch before the end of the shorter array.
        // The original logic returned 'incorrect' in these cases.
         return { icon: '❌', className: 'incorrect' };
    }
}, []); // No external dependencies if targetTree comes from targetDinosaur context

  const compareInitial = useCallback((guessName) => {
    if (!targetDinosaur || !guessName) return { icon: '', className: ''}; // Return default object
    return targetDinosaur.name.charAt(0).toLowerCase() === guessName.charAt(0).toLowerCase()
      ? { icon: '✅', className: 'correct' }
      : { icon: '❌', className: 'incorrect' };
  }, [targetDinosaur]); // Dependency: targetDinosaur


  // Game context to pass to children
  // Memoize context value to prevent unnecessary re-renders of consumers
  const gameContext = React.useMemo(() => ({
    allDinosaurs,
    pool,
    targetDinosaur,
    answerList,
    gameStarted,
    isGameOver,
    resultMessage,
    maxGuesses,
    // Functions
    initializePool,
    startGame,
    submitGuess,
    resetGame,
    // Comparison functions
    compareLength,
    compareAttribute,
    compareCladeTree,
    compareInitial
  }), [
      allDinosaurs, pool, targetDinosaur, answerList, gameStarted, isGameOver, resultMessage, maxGuesses,
      initializePool, startGame, submitGuess, resetGame, compareLength, compareAttribute, compareCladeTree, compareInitial
  ]);


  // Pass context down using React.cloneElement
  // (Alternative: Use React Context API for cleaner propagation)
  return (
    <div className="game-layer">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { gameContext })
          : child
      )}
    </div>
  );
}

export default GameLayer;