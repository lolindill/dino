// App.jsx
import React from 'react';
import './App.css'; // Your main CSS file

// Import the separated components
import GameLayer from './GameLayer';
import PoolFilterLayer from './PoolFilterLayer';
import InputLayer from './InputLayer';
import AnswerListLayer from './AnswerListLayer';

// -------------------------------------------
// MAIN APP - Compose all layers
// -------------------------------------------
function App() {
  return (
    <div className="container">
      <header className="logo-container"> {/* Use header tag for semantic meaning */}
        <img
          className="logo"
          // Consider hosting the image locally or using a more permanent URL
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiH3GlivSp1kX2hZOkBen12XxLyXyrZ_wC8DLa5fk6bVJKUoeCsigfk2kuFDpP6Nc3ZlBxqyDpyFPD__sTkIRr-VWTZUulZHST9VKt5IhfoEjXbvj2XWV-6x2nZfSFz0By-6_Rr6gIxGf0-Rn3FHulUo3r70fGyXjISSA9Q0L8NVvWb9gV4iZFa0Wyr2gA/s1788/Dinodle%20logo.png"
          alt="Dinodle Game Logo" // More descriptive alt text
        />
        {/* Maybe add an <h1>Dinodle</h1> here */}
      </header>

      <main> {/* Wrap main content area */}
        <GameLayer>
          {/* Components inside GameLayer will receive gameContext via props */}
          <PoolFilterLayer />
          <InputLayer />
          <AnswerListLayer />
        </GameLayer>
      </main>

      <footer> {/* Optional footer */}
          {/* Add copyright, links, etc. here */}
      </footer>
    </div>
  );
}

export default App;