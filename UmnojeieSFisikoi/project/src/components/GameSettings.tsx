import React from 'react';
import { Settings, Play } from 'lucide-react';
import { GameSettings as GameSettingsType } from '../types';

interface GameSettingsProps {
  settings: GameSettingsType;
  onSettingsChange: (settings: GameSettingsType) => void;
  onStartGame: () => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({
  settings,
  onSettingsChange,
  onStartGame
}) => {
  const difficultyOptions = [
    { value: 'easy' as const, label: 'Легкий', description: 'Числа 2-5', color: 'bg-green-500' },
    { value: 'medium' as const, label: 'Средний', description: 'Числа 6-9', color: 'bg-yellow-500' },
    { value: 'expert' as const, label: 'Экспертный', description: 'Числа 2-9', color: 'bg-red-500' }
  ];

  const operationOptions = [
    { value: 'multiplication' as const, label: 'Умножение', symbol: '×', color: 'bg-blue-500' },
    { value: 'division' as const, label: 'Деление', symbol: '÷', color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MathMaster</h1>
          <p className="text-gray-600">Изучаем математику играя!</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Уровень сложности</h3>
            <div className="space-y-3">
              {difficultyOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.difficulty === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={option.value}
                    checked={settings.difficulty === option.value}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      difficulty: e.target.value as GameSettingsType['difficulty']
                    })}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full ${option.color} mr-3`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                  {settings.difficulty === option.value && (
                    <div className="w-6 h-6 border-2 border-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Тип операции</h3>
            <div className="grid grid-cols-2 gap-3">
              {operationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.operation === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="operation"
                    value={option.value}
                    checked={settings.operation === option.value}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      operation: e.target.value as GameSettingsType['operation']
                    })}
                    className="sr-only"
                  />
                  <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center mb-2`}>
                    <span className="text-2xl font-bold text-white">{option.symbol}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onStartGame}
          className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Начать игру
        </button>
      </div>
    </div>
  );
};