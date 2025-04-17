import { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, Trash2, Save, Play, Pause, Settings, Bell } from 'lucide-react';
import './App.css';

export default function ExerciseRandomizer() {
  const [exercises, setExercises] = useState([
    'Push-ups x10', 
    'Squats x15', 
    'Jumping jacks x30', 
    'Plank 30 seconds',
    'Lunges x10 each leg',
    'Crunches x15',
    'Mountain climbers x20'
  ]);
  const [newExercise, setNewExercise] = useState('');
  const [currentExercise, setCurrentExercise] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [intervalInSeconds, setIntervalInSeconds] = useState(3600); // Default: 1 hour in seconds
  const [timeUntilNext, setTimeUntilNext] = useState(intervalInSeconds);
  const [showIntervalSettings, setShowIntervalSettings] = useState(false);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState('default');

  const selectRandomExercise = useCallback(() => {
    if (exercises.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * exercises.length);
    return exercises[randomIndex];
  }, [exercises]);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [currentExercise, selectRandomExercise]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleAddExercise = () => {
    if (newExercise.trim() !== '') {
      setExercises([...exercises, newExercise.trim()]);
      setNewExercise('');
    }
  };

  const handleRemoveExercise = (index) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddExercise();
    }
  };

  const applyIntervalSettings = () => {
    const totalSeconds = (hours * 3600) + (minutes * 60) + parseInt(seconds);
    if (totalSeconds > 0) {
      setIntervalInSeconds(totalSeconds);
      setTimeUntilNext(totalSeconds);
      setShowIntervalSettings(false);
    } else {
      alert('Please set a time interval greater than zero');
    }
  };

  const resetTimer = () => {
    setTimeUntilNext(intervalInSeconds);
    setCurrentExercise(selectRandomExercise());
  };

  useEffect(() => {
    let interval;
    
    if (isRunning) {
      if (!currentExercise) {
        setCurrentExercise(selectRandomExercise());
      }
      
      interval = setInterval(() => {
        setTimeUntilNext(prevTime => {
          if (prevTime <= 1) {
            const newExercise = selectRandomExercise();
            setCurrentExercise(newExercise);
            
            if (notificationPermission === "granted" && newExercise) {
              new Notification("Time for exercise!", {
                body: newExercise,
                icon: "/api/placeholder/64/64"
              });
            }
            
            return intervalInSeconds;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, exercises, notificationPermission, intervalInSeconds, currentExercise, selectRandomExercise]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const saveExercises = () => {
    localStorage.setItem('exercises', JSON.stringify(exercises));
    localStorage.setItem('interval', intervalInSeconds.toString());
    alert('Settings saved successfully!');
  };

  useEffect(() => {
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
      setExercises(JSON.parse(savedExercises));
    }
    
    const savedInterval = localStorage.getItem('interval');
    if (savedInterval) {
      const interval = parseInt(savedInterval);
      setIntervalInSeconds(interval);
      setTimeUntilNext(interval);
      
      const hrs = Math.floor(interval / 3600);
      const mins = Math.floor((interval % 3600) / 60);
      const secs = interval % 60;
      
      setHours(hrs);
      setMinutes(mins);
      setSeconds(secs);
    }
  }, []);

  return (
    <div className="app-container">
      <div className="exercise-card">
        <h2>Current Exercise:</h2>
        <div className="timer-display">
          {currentExercise || 'No exercise selected'}
        </div>
        
        <div className="controls">
          <Clock className="text-blue-500" />
          <span className="text-xl font-mono">{formatTime(timeUntilNext)}</span>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          Interval set to: {formatTime(intervalInSeconds)}
        </div>
        
        {isRunning && (
          <button
            onClick={resetTimer}
            className="btn btn-secondary mx-auto mt-4"
          >
            Skip & New Exercise
          </button>
        )}
      </div>
      
      <div className="controls">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
        >
          {isRunning ? <Pause /> : <Play />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button 
          onClick={() => setShowIntervalSettings(!showIntervalSettings)}
          className="btn btn-secondary"
        >
          <Settings />
          Interval Settings
        </button>
        
        <button 
          onClick={requestNotificationPermission}
          disabled={notificationPermission === 'granted'}
          className="btn btn-secondary"
        >
          <Bell />
          {notificationPermission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
        </button>
      </div>

      {showIntervalSettings && (
        <div className="exercise-card">
          <h3 className="text-lg font-semibold text-center mb-4">Set Interval Time</h3>
          <div className="flex justify-center gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="time-input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="time-input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                className="time-input"
              />
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={applyIntervalSettings}
              className="btn btn-primary"
            >
              Apply
            </button>
            <button
              onClick={() => setShowIntervalSettings(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add new exercise..."
          />
          <button
            onClick={handleAddExercise}
            className="btn btn-primary"
          >
            <Plus />
          </button>
        </div>
      </div>

      <div className="exercise-card mt-6">
        <h2 className="text-xl font-semibold mb-4">Exercise List</h2>
        {exercises.length === 0 ? (
          <p className="text-gray-500 italic text-center">No exercises added yet</p>
        ) : (
          <div>
            {exercises.map((exercise, index) => (
              <div key={index} className="exercise-list-item">
                <span>{exercise}</span>
                <button
                  onClick={() => handleRemoveExercise(index)}
                  className="remove-btn"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={saveExercises}
          className="btn btn-primary"
        >
          <Save />
          Save Exercise List
        </button>
      </div>
    </div>
  );
}