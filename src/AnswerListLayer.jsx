// AnswerListLayer.jsx
import React from 'react';

// -------------------------------------------
// ANSWER LIST LAYER - Display guesses history
// -------------------------------------------
function AnswerListLayer({ gameContext }) {
  const {
    answerList = [],
    targetDinosaur,
    resultMessage = '',
    isGameOver = false,
    // Don't need resetGame here, using startGame for "New Game"
    startGame, // Use startGame to restart with the same pool
    pool = [], // Need pool to pass to startGame
    // Comparison functions from context
    compareInitial,
    compareAttribute,
    compareCladeTree,
    compareLength
  } = gameContext || {};

  // Ensure comparison functions exist before calling them
  const safeCompareInitial = (name) => compareInitial ? compareInitial(name) : { icon: '?', className: 'unknown' };
  const safeCompareAttribute = (guessAttr, targetAttr) => compareAttribute ? compareAttribute(guessAttr, targetAttr) : { icon: '?', className: 'unknown' };
  const safeCompareCladeTree = (guessTree, targetTree) => compareCladeTree ? compareCladeTree(guessTree, targetTree) : { icon: '?', className: 'unknown' };
  const safeCompareLength = (length) => compareLength ? compareLength(length) : { icon: '?', className: 'unknown' };


  const handleNewGame = () => {
      if (startGame && pool) {
          startGame(pool); // Restart with the current filtered pool
      }
  }

  // Don't render anything if the game hasn't started and there are no answers
  if (!gameContext?.gameStarted && answerList.length === 0 && !resultMessage) {
      return null;
  }


  return (
    <div className="answer-list-container">
      {/* Result Message */}
      {resultMessage && <div className={`result-message ${isGameOver ? (resultMessage.includes('🎉') ? 'win' : 'lose') : ''}`}>{resultMessage}</div>}

      {/* New Game Button (appears when game is over) */}
      {isGameOver && (
        <button
            className="new-game-button" // Use a different class if needed
            onClick={handleNewGame}
            disabled={!startGame || !pool} // Disable if function/pool not available
            aria-label="Start a new game with the same filters"
        >
          New Game (Same Filters)
        </button>
      )}

      {/* Guess History Table - More structured than divs */}
      {answerList.length > 0 && (
        <div className="history-container">
           {/* Header Row (Optional but good for clarity) */}
           <div className="history-header history-item">
                <strong>Dinosaur</strong>
                <div>Initial</div>
                <div>Period</div>
                <div>Clade</div>
                <div>Subclade</div>
                <div>Diet</div>
                <div>Location</div>
                <div>Length (m)</div>
           </div>

           {/* Guess Rows */}
          {answerList.map((dino, index) => {
            // Ensure targetDinosaur exists before attempting comparisons
            if (!targetDinosaur) return <div key={index} className="history-item loading">Processing guess...</div>;

            // Perform comparisons safely
            const initialComp = safeCompareInitial(dino.name);
            const eraComp = safeCompareAttribute(dino.era, targetDinosaur.era);
            const clade1Comp = safeCompareAttribute(dino.Clade, targetDinosaur.Clade);
            // Assuming cladeTree comparison logic handles potential undefined 'type' if needed
            const clade2Comp = safeCompareCladeTree(dino.cladeTree, targetDinosaur.cladeTree);
            const dietComp = safeCompareAttribute(dino.diet, targetDinosaur.diet);
            const habitatComp = safeCompareAttribute(dino.habitat, targetDinosaur.habitat);
            const lengthComp = safeCompareLength(dino.length);

            return (
              <div key={index} className="history-item">
                <strong>{dino.name}</strong>
                {/* Use divs for grid layout (or spans if inline) */}
                <div title={`Guess: ${dino.name.charAt(0)}`}><span className={initialComp.className}>{initialComp.icon}</span></div>
                <div title={`Guess: ${dino.era || 'N/A'}`}><span className={eraComp.className}>{eraComp.icon}</span></div>
                <div title={`Guess: ${dino.Clade || 'N/A'}`}><span className={clade1Comp.className}>{clade1Comp.icon}</span></div>
                <div title={`Guess: ${dino.type || 'N/A'}` /* Use 'type' if that's the intended display */}><span className={clade2Comp.className}>{clade2Comp.icon}</span></div>
                <div title={`Guess: ${dino.diet || 'N/A'}`}><span className={dietComp.className}>{dietComp.icon}</span></div>
                <div title={`Guess: ${dino.habitat || 'N/A'}`}><span className={habitatComp.className}>{habitatComp.icon}</span></div>
                <div title={`Guess: ${dino.length || 'N/A'}`}><span className={lengthComp.className}>{lengthComp.icon}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AnswerListLayer;