import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { Home, RotateCcw, Award, Clock } from 'lucide-react';
import { GameSettings, GameStats, MathPair, GameElement } from '../types';
import { MathGenerator } from '../utils/mathGenerator';
import { PositionGenerator } from '../utils/positionGenerator';

interface GameInterfaceProps {
  settings: GameSettings;
  onReturnHome: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  settings,
  onReturnHome
}) => {
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [gameElements, setGameElements] = useState<GameElement[]>([]);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    totalPairs: 0,
    startTime: Date.now()
  });
  const [gameState, setGameState] = useState<'playing' | 'won' | 'over'>('playing');
  const [currentPairs, setCurrentPairs] = useState<MathPair[]>([]);

  const CONTAINER_SIZE = { width: 600, height: 600 };
  const ELEMENT_SIZE = 100;
  const MAX_ELEMENTS = 20;

  // Initialize physics engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = Matter.Engine.create({
      enableSleeping: false
    });
    
    engine.world.gravity.y = 1.2;
    engineRef.current = engine;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Create walls
    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      collisionFilter: { group: -1 }
    };

    const walls = [
      Matter.Bodies.rectangle(CONTAINER_SIZE.width / 2, 0, CONTAINER_SIZE.width, 1, wallOptions),
      Matter.Bodies.rectangle(CONTAINER_SIZE.width / 2, CONTAINER_SIZE.height, CONTAINER_SIZE.width, 1, wallOptions),
      Matter.Bodies.rectangle(0, CONTAINER_SIZE.height / 2, 1, CONTAINER_SIZE.height, wallOptions),
      Matter.Bodies.rectangle(CONTAINER_SIZE.width, CONTAINER_SIZE.height / 2, 1, CONTAINER_SIZE.height, wallOptions)
    ];

    Matter.Composite.add(engine.world, walls);

    // Start initial game
    initializeGame();

    Matter.Runner.run(runner, engine);

    return () => {
      if (runnerRef.current && engineRef.current) {
        Matter.Runner.stop(runnerRef.current);
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, []);

  const initializeGame = useCallback(() => {
    const pairs = MathGenerator.generatePairs(settings, 10);
    setCurrentPairs(pairs);
    setStats(prev => ({ ...prev, totalPairs: pairs.length }));
    createGameElements(pairs);
  }, [settings]);

  const createGameElements = useCallback((pairs: MathPair[]) => {
    if (!containerRef.current || !engineRef.current) return;

    const positions = PositionGenerator.generateRandomPositions(pairs.length * 2);
    const elements: GameElement[] = [];
    const bodies: Matter.Body[] = [];

    pairs.forEach((pair, index) => {
      const answerPos = positions[index * 2];
      const examplePos = positions[index * 2 + 1];

      // Create answer element
      const answerElement: GameElement = {
        id: `answer-${pair.id}`,
        value: pair.answer,
        type: 'answer',
        position: { x: answerPos.left, y: answerPos.top }
      };

      // Create example element
      const exampleElement: GameElement = {
        id: `example-${pair.id}`,
        value: pair.example,
        type: 'example',
        position: { x: examplePos.left, y: examplePos.top }
      };

      elements.push(answerElement, exampleElement);
    });

    setGameElements(elements);
    createPhysicsBodies(elements);
  }, []);

  const createPhysicsBodies = useCallback((elements: GameElement[]) => {
    if (!engineRef.current) return;

    const bodies: Matter.Body[] = [];

    elements.forEach(element => {
      const radius = ELEMENT_SIZE / 2;
      const x = element.position.x + radius;
      const y = element.position.y + radius;

      const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.8,
        frictionAir: 0.05,
        density: 0.05,
        render: { visible: false }
      });

      body.gameElement = element;
      element.body = body;
      bodies.push(body);
    });

    Matter.Composite.add(engineRef.current.world, bodies);
  }, []);

  const handleElementClick = useCallback((element: GameElement, domElement: HTMLElement) => {
    if (gameState !== 'playing') return;

    if (selectedElement === domElement) {
      domElement.classList.remove('selected');
      setSelectedElement(null);
      return;
    }

    if (selectedElement) {
      const selectedGameElement = gameElements.find(el => 
        el.id === selectedElement.getAttribute('data-element-id')
      );

      if (!selectedGameElement) return;

      const isValidPair = 
        (element.type === 'answer' && selectedGameElement.type === 'example' &&
         MathGenerator.validatePair(selectedGameElement.value, element.value)) ||
        (element.type === 'example' && selectedGameElement.type === 'answer' &&
         MathGenerator.validatePair(element.value, selectedGameElement.value));

      if (isValidPair) {
        handleCorrectMatch(element, selectedGameElement, domElement, selectedElement);
      } else {
        handleIncorrectMatch(domElement, selectedElement);
      }

      selectedElement.classList.remove('selected');
      setSelectedElement(null);
    } else {
      domElement.classList.add('selected');
      setSelectedElement(domElement);
    }
  }, [selectedElement, gameElements, gameState]);

  const handleCorrectMatch = useCallback((
    element1: GameElement,
    element2: GameElement,
    domElement1: HTMLElement,
    domElement2: HTMLElement
  ) => {
    // Play success sound
    playSound('success');

    // Add fade effect
    domElement1.classList.add('fading');
    domElement2.classList.add('fading');

    // Remove from physics world
    setTimeout(() => {
      if (engineRef.current && element1.body && element2.body) {
        Matter.World.remove(engineRef.current.world, [element1.body, element2.body]);
      }

      // Update game elements
      setGameElements(prev => 
        prev.filter(el => el.id !== element1.id && el.id !== element2.id)
      );

      setStats(prev => ({
        ...prev,
        correct: prev.correct + 1
      }));

      // Check win condition
      const remainingElements = gameElements.filter(el => 
        el.id !== element1.id && el.id !== element2.id
      );

      if (remainingElements.length === 0) {
        setGameState('won');
      }
    }, 500);
  }, [gameElements]);

  const handleIncorrectMatch = useCallback((
    domElement1: HTMLElement,
    domElement2: HTMLElement
  ) => {
    // Play error sound
    playSound('error');

    // Add shake effect
    domElement1.classList.add('shake');
    domElement2.classList.add('shake');

    setTimeout(() => {
      domElement1.classList.remove('shake');
      domElement2.classList.remove('shake');
    }, 500);

    setStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1
    }));

    // Add new pairs
    addNewPairs();
  }, []);

  const addNewPairs = useCallback(() => {
    if (gameElements.length + 4 > MAX_ELEMENTS) {
      setGameState('over');
      return;
    }

    // Generate 2 new pairs (4 elements total)
    const newPairs = MathGenerator.generatePairs(settings, 2);
    const positions = PositionGenerator.generateRandomPositions(4);
    const newElements: GameElement[] = [];
    const bodies: Matter.Body[] = [];

    newPairs.forEach((pair, index) => {
      const answerPos = positions[index * 2];
      const examplePos = positions[index * 2 + 1];

      // Create answer element
      const answerElement: GameElement = {
        id: `answer-${pair.id}-${Date.now()}`,
        value: pair.answer,
        type: 'answer',
        position: { x: answerPos.left, y: answerPos.top }
      };

      // Create example element
      const exampleElement: GameElement = {
        id: `example-${pair.id}-${Date.now()}`,
        value: pair.example,
        type: 'example',
        position: { x: examplePos.left, y: examplePos.top }
      };

      newElements.push(answerElement, exampleElement);
    });

    // Create physics bodies for new elements
    newElements.forEach(element => {
      const radius = ELEMENT_SIZE / 2;
      const x = element.position.x + radius;
      const y = element.position.y + radius;

      const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.8,
        frictionAir: 0.05,
        density: 0.05,
        render: { visible: false }
      });

      body.gameElement = element;
      element.body = body;
      bodies.push(body);
    });

    // Add bodies to physics world
    if (engineRef.current) {
      Matter.Composite.add(engineRef.current.world, bodies);
    }

    // Update state
    setGameElements(prev => [...prev, ...newElements]);
    setCurrentPairs(prev => [...prev, ...newPairs]);
  }, [gameElements.length, currentPairs, settings]);

  const playSound = useCallback((type: 'success' | 'error') => {
    // Audio implementation would go here
    // For now, using simple browser beep
    if (type === 'success') {
      // Success tone
    } else {
      // Error tone
    }
  }, []);

  const restartGame = useCallback(() => {
    setGameState('playing');
    setStats({
      correct: 0,
      incorrect: 0,
      totalPairs: 0,
      startTime: Date.now()
    });
    setSelectedElement(null);
    
    if (engineRef.current) {
      // Remove all bodies except walls
      const bodiesToRemove = engineRef.current.world.bodies.filter(body => body.gameElement);
      if (bodiesToRemove.length > 0) {
        Matter.World.remove(engineRef.current.world, bodiesToRemove);
      }
    }
    
    initializeGame();
  }, [initializeGame]);

  const formatTime = useCallback((startTime: number) => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Update physics positions
  useEffect(() => {
    const updatePositions = () => {
      if (!engineRef.current || !containerRef.current) return;

      gameElements.forEach(element => {
        if (!element.body) return;

        const domElement = containerRef.current?.querySelector(
          `[data-element-id="${element.id}"]`
        ) as HTMLElement;

        if (domElement) {
          const radius = ELEMENT_SIZE / 2;
          const x = element.body.position.x - radius;
          const y = element.body.position.y - radius;
          
          domElement.style.transform = `translate(${x}px, ${y}px) rotate(${element.body.angle}rad)`;
        }
      });

      requestAnimationFrame(updatePositions);
    };

    updatePositions();
  }, [gameElements]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-between">
          <button
            onClick={onReturnHome}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            Главная
          </button>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-600" />
              <span className="font-medium">Правильно: {stats.correct}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{formatTime(stats.startTime)}</span>
            </div>
          </div>

          <button
            onClick={restartGame}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Заново
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div className="max-w-4xl mx-auto flex justify-center">
        <div
          ref={containerRef}
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-200"
          style={{ width: CONTAINER_SIZE.width, height: CONTAINER_SIZE.height }}
        >
          {/* Counter */}
          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium text-sm z-10">
            Элементы: {gameElements.length}/{MAX_ELEMENTS}
          </div>

          {/* Game Elements */}
          {gameElements.map(element => (
            <div
              key={element.id}
              data-element-id={element.id}
              className={`absolute w-[100px] h-[100px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg select-none ${
                element.type === 'answer' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
              }`}
              style={{
                left: 0,
                top: 0,
                transform: `translate(${element.position.x}px, ${element.position.y}px)`
              }}
              onClick={(e) => handleElementClick(element, e.currentTarget)}
            >
              <span className={`font-bold ${
                element.type === 'answer' ? 'text-2xl' : 'text-lg'
              }`}>
                {element.value}
              </span>
            </div>
          ))}

          {/* Game Over Modal */}
          {gameState === 'over' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Игра окончена!</h2>
                <p className="text-gray-600 mb-6">
                  Правильных ответов: {stats.correct}<br />
                  Время игры: {formatTime(stats.startTime)}
                </p>
                <button
                  onClick={restartGame}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          )}

          {/* Game Won Modal */}
          {gameState === 'won' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Поздравляем!</h2>
                <p className="text-gray-600 mb-6">
                  Вы решили все примеры!<br />
                  Правильных ответов: {stats.correct}<br />
                  Время игры: {formatTime(stats.startTime)}
                </p>
                <button
                  onClick={restartGame}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors mr-3"
                >
                  Играть еще
                </button>
                <button
                  onClick={onReturnHome}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Главная
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};