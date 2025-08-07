import React, { useState } from 'react';
import { GameSettings } from './components/GameSettings';
import { GameInterface } from './components/GameInterface';
import { GameSettings as GameSettingsType } from './types';

function App() {
  const [gameState, setGameState] = useState<'settings' | 'playing'>('settings');
  const [settings, setSettings] = useState<GameSettingsType>({
    difficulty: 'easy',
    operation: 'multiplication'
  });

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleReturnHome = () => {
    setGameState('settings');
  };

  return (
    <div className="App">
      {gameState === 'settings' ? (
        <GameSettings
          settings={settings}
          onSettingsChange={setSettings}
          onStartGame={handleStartGame}
        />
      ) : (
        <GameInterface
          settings={settings}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
}

export default App;