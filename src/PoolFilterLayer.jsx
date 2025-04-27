// PoolFilterLayer.jsx
import React, {  useState, useEffect, useMemo, useCallback, useRef } from 'react';
import TipPopup from './TipPopup';

// --- PLACEHOLDER IMAGE URLS ---
import easyIconURL from  './image/easy.png'; 
import hardIconURL from  './image/hard.png'; 

import theropodOn from './image/T.png';
import theropodOff from './image/TX.png';
import sauropodomorphOn from './image/S.png';
import sauropodomorphOff from './image/SX.png';
import ornithischianOn from './image/O.png';
import ornithischianOff from './image/OX.png';

function PoolFilterLayer({ gameContext }) {
    const {
      allDinosaurs = [],
      gameStarted = false,
      initializePool,
      startGame,
      resetGame,
      resultMessage
    } = gameContext || {};
  
    // --- State ---
    // Difficulty: Boolean, false = Easy, true = Hard
    const [isHardMode, setIsHardMode] = useState(false);
    const [localResultMessage, setLocalResultMessage] = useState('');
    const [showTip, setShowTip] = useState(false);
  
    // --- Memoized Derived Data ---
    // Get unique clades available from the data
    const availableClades = useMemo(() => {
      if (!allDinosaurs || allDinosaurs.length === 0) return [];
      const clades = new Set(allDinosaurs.map(d => d.Clade).filter(clade => !!clade));
      return Array.from(clades).sort();
    }, [allDinosaurs]);
  
    // --- Helper to create default clade state ---
    // Creates an object with all availableClades set to true
    const createDefaultCladeState = useCallback(() => {
      const defaultState = {};
      availableClades.forEach(clade => {
        defaultState[clade] = true; // Default to checked
      });
      return defaultState;
    }, [availableClades]); // Dependency: availableClades array
  
    // --- State for Clades (Initialized via Effect) ---
    const [selectedClades, setSelectedClades] = useState({}); // Start empty
    const isInitialCladeSet = useRef(false); // Flag to prevent effect re-running unnecessarily
  
    // --- Effects ---
    // Effect to set the initial default state for clades once availableClades is populated
    useEffect(() => {
      // Only run if clades are available AND we haven't set the initial state yet
      if (availableClades.length > 0 && !isInitialCladeSet.current) {
        setSelectedClades(createDefaultCladeState());
        isInitialCladeSet.current = true; // Mark as set
      }
    }, [availableClades, createDefaultCladeState]); // Re-run if clades list or helper changes
  
  
    // Update local error message from context
    useEffect(() => {
      if (resultMessage && resultMessage.includes("No dinosaurs match")) {
        setLocalResultMessage(resultMessage);
      } else {
        setLocalResultMessage('');
      }
    }, [resultMessage]);
  
    // --- Event Handlers ---
    // Handle Clade Checkbox Change
    const handleCladeChange = useCallback((cladeName, isChecked) => {
      if (!gameStarted) {
        setSelectedClades(prev => ({
          ...prev,
          [cladeName]: isChecked
        }));
        setLocalResultMessage('');
      }
    }, [gameStarted]);
  
    // Handle Difficulty Toggle Button Click
    const handleDifficultyToggle = useCallback(() => {
      if (!gameStarted) {
        setIsHardMode(prev => !prev);
        setLocalResultMessage('');
      }
    }, [gameStarted]);
  
    // Apply filters and start game (No changes needed here from previous version)
    const handleStartGame = useCallback(() => {
      if (!initializePool || !startGame) return;
      const cladesToFilter = Object.keys(selectedClades).filter(clade => selectedClades[clade]);
      const difficultyToFilter = isHardMode ? 'Hard' : 'Easy';
      const filteredPool = initializePool(cladesToFilter, difficultyToFilter);
  
      if (filteredPool.length > 0) {
        setLocalResultMessage('');
        startGame(filteredPool);
      } else {
        startGame(filteredPool); // Let GameLayer handle message
      }
    }, [initializePool, startGame, selectedClades, isHardMode]);
  
  
    // Handle reset - call context's resetGame and reset local state
    // MODIFIED: Reset clades back to all checked
    const handleReset = useCallback(() => {
      if (resetGame) {
        resetGame(); // Call context reset first
        // Reset local filter state
        setSelectedClades(createDefaultCladeState()); // Use helper to set all to true
        setIsHardMode(false); // Default back to Easy
        setLocalResultMessage('');
        isInitialCladeSet.current = true; // Ensure effect knows state is intentionally set
      }
    }, [resetGame, createDefaultCladeState]); // Added createDefaultCladeState dependency
  

  // --- Render ---
  return (
    <div className="filters-container">
      {/* Display local error/info message */}
      {localResultMessage && <div className="filter-message error">{localResultMessage}</div>}

      {/* Clade Filter Checkboxes */}
      <fieldset className="filter-group clade-filters" disabled={gameStarted || availableClades.length === 0}>
        <legend>Filter by Clade </legend>
        {availableClades.length > 0 ? (
            availableClades.map(clade => {
            // Determine the correct images for each clade
            const isChecked = !!selectedClades[clade];
            let imageSrc;

            if (clade === 'Theropod') {
                imageSrc = isChecked ? theropodOn : theropodOff;
            } else if (clade === 'Sauropodomorph') {
                imageSrc = isChecked ? sauropodomorphOn : sauropodomorphOff;
            } else if (clade === 'Ornithischian') {
                imageSrc = isChecked ? ornithischianOn : ornithischianOff;
            }

            return (
                <div key={clade} className="checkbox-wrapper">
                <button
                    type="button"
                    className="clade-toggle-button"
                    onClick={() => handleCladeChange(clade, !isChecked)}
                    disabled={gameStarted}
                    aria-pressed={isChecked}
                >
                    <img
                    src={imageSrc}
                    alt={`${clade} ${isChecked ? 'selected' : 'unselected'}`}
                    className="clade-icon"
                    />
                </button>
                </div>
            );
            })
        ) : (
            <p>Loading clades...</p>
        )}
       </fieldset>

      {/* Difficulty Filter Toggle Button */}
      <div className="filter-group difficulty-filter">
        <label id="difficulty-label">Difficulty:</label>
        <div>
            <button
            type="button"
            className="difficulty-image-button"
            onClick={handleDifficultyToggle}
            disabled={gameStarted || allDinosaurs.length === 0}
            aria-pressed={isHardMode}
            aria-labelledby="difficulty-label"
            >
            <img
                src={isHardMode ? hardIconURL : easyIconURL}
                alt={isHardMode ? 'Hard Mode Active' : 'Easy Mode Active'}
                className="difficulty-image"
            />
            </button>
        </div>
        </div>


      {/* Start/Reset Buttons */}
      <div className="filter-actions">
        <button
            className="tip-button"
            onClick={() => setShowTip(true)}
            aria-label="Show Tip"
            >
            Tip
        </button>
        {!gameStarted ? (
          <button
            className="start-button"
            onClick={handleStartGame}
            // Disable if functions aren't ready OR if no dinosaurs loaded at all
            disabled={!initializePool || !startGame || allDinosaurs.length === 0}
            aria-label="Start Game with selected filters"
          >
            Start Game
          </button>
        ) : (
          <button
            className="reset-button"
            onClick={handleReset}
            disabled={!resetGame} // Disable if context function not ready
            aria-label="Reset game and filters"
          >
            Reset Filters
          </button>
        )}
      </div>
      <TipPopup isOpen={showTip} onClose={() => setShowTip(false)} />
    </div>
  );
}

export default PoolFilterLayer;