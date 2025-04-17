import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Play, Pause, Settings } from 'lucide-react';

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

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Function to select a random exercise
  const selectRandomExercise = () => {
    if (exercises.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * exercises.length);
    return exercises[randomIndex];
  };

  // Handle adding a new exercise
  const handleAddExercise = () => {
    if (newExercise.trim() !== '') {
      setExercises([...exercises, newExercise.trim()]);
      setNewExercise('');
    }
  };

  // Handle removing an exercise
  const handleRemoveExercise = (index) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };

  // Handle keypress for adding exercise
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddExercise();
    }
  };

  // Apply interval settings
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

  // Reset timer with new interval
  const resetTimer = () => {
    setTimeUntilNext(intervalInSeconds);
    setCurrentExercise(selectRandomExercise());
  };

  // Timer effect
  useEffect(() => {
    let interval;
    
    if (isRunning) {
      // Set initial exercise when starting
      if (!currentExercise) {
        setCurrentExercise(selectRandomExercise());
      }
      
      interval = setInterval(() => {
        setTimeUntilNext(prevTime => {
          if (prevTime <= 1) {
            // Select new exercise when timer reaches zero
            const newExercise = selectRandomExercise();
            setCurrentExercise(newExercise);
            
            // Send notification
            if (notificationPermission === "granted" && newExercise) {
              new Notification("Time for exercise!", {
                body: newExercise,
                icon: "/api/placeholder/64/64"
              });
            }
            
            return intervalInSeconds; // Reset to configured interval
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, exercises, notificationPermission, intervalInSeconds]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Save exercises and interval to local storage
  const saveExercises = () => {
    localStorage.setItem('exercises', JSON.stringify(exercises));
    localStorage.setItem('interval', intervalInSeconds.toString());
    alert('Settings saved successfully!');
  };

  // Load exercises and interval from local storage
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
      
      // Calculate hours, minutes, seconds for display
      const hrs = Math.floor(interval / 3600);
      const mins = Math.floor((interval % 3600) / 60);
      const secs = interval % 60;
      
      setHours(hrs);
      setMinutes(mins);
      setSeconds(secs);
    }
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Hourly Exercise Randomizer</h1>
      
      {/* Current exercise display */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow text-center">
        <h2 className="text-lg font-semibold mb-2">Current Exercise:</h2>
        <p className="text-xl font-bold text-blue-600">{currentExercise || 'No exercise selected'}</p>
        
        <div className="mt-4 flex items-center justify-center">
          <Clock className="w-5 h-5 mr-2 text-blue-500" />
          <span className="text-lg font-mono">{formatTime(timeUntilNext)}</span>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          Interval set to: {formatTime(intervalInSeconds)}
        </div>
        
        {isRunning && (
          <button
            onClick={resetTimer}
            className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Skip & New Exercise
          </button>
        )}
      </div>
      
      {/* Timer controls */}
      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center px-4 py-2 rounded-lg shadow ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium`}
        >
          {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
        </button>
        
        <button 
          onClick={() => setShowIntervalSettings(!showIntervalSettings)}
          className="flex items-center px-4 py-2 rounded-lg shadow bg-purple-500 hover:bg-purple-600 text-white font-medium"
        >
          <Settings className="w-4 h-4 mr-2" /> Interval Settings
        </button>
        
        <button 
          onClick={requestNotificationPermission}
          disabled={notificationPermission === 'granted'}
          className={`px-4 py-2 rounded-lg shadow ${notificationPermission === 'granted' ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600 text-white'} font-medium`}
        >
          {notificationPermission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
        </button>
      </div>
      
      {/* Interval settings */}
      {showIntervalSettings && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-3 text-center">Set Interval Time</h3>
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-20">
              <label className="block text-xs text-gray-600 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="w-20">
              <label className="block text-xs text-gray-600 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="w-20">
              <label className="block text-xs text-gray-600 mb-1">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={applyIntervalSettings}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Apply
            </button>
            <button
              onClick={() => setShowIntervalSettings(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add new exercise */}
      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="text"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add new exercise..."
            className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddExercise}
            className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Exercise list */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3 text-gray-700">Exercise List:</h2>
        {exercises.length === 0 ? (
          <p className="text-gray-500 italic">No exercises added yet</p>
        ) : (
          <ul className="space-y-2">
            {exercises.map((exercise, index) => (
              <li key={index} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span>{exercise}</span>
                <button
                  onClick={() => handleRemoveExercise(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Save button */}
      <div className="text-center">
        <button
          onClick={saveExercises}
          className="flex items-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Save className="w-4 h-4 mr-2" /> Save Exercise List
        </button>
      </div>
    </div>
  );
}