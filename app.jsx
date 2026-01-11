import React, { useState, useEffect } from 'react';
import { Activity, Droplets, Wifi, Eye, AlertTriangle, RefreshCw, Bell, ThermometerSun } from 'lucide-react';

export default function SilkwormMonitor() {
  const [sensorData, setSensorData] = useState({
    temp: 25,
    humidity: 0,
    water: 0,
    ir: 1,
    timestamp: null
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const THRESHOLDS = {
    HIGH_HUMIDITY: 85,
    LOW_HUMIDITY: 40,
    LOW_WATER: 200,
    HIGH_TEMP: 30,
    LOW_TEMP: 20
  };

  const checkAlerts = (data) => {
    const newAlerts = [];
    
    if (data.humidity > THRESHOLDS.HIGH_HUMIDITY) {
      newAlerts.push({
        type: 'critical',
        icon: '🚨',
        title: 'HIGH HUMIDITY ALERT',
        message: `${data.humidity.toFixed(1)}% (Limit: ${THRESHOLDS.HIGH_HUMIDITY}%)`,
        time: new Date()
      });
    }
    
    if (data.humidity < THRESHOLDS.LOW_HUMIDITY) {
      newAlerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Humidity Warning',
        message: `${data.humidity.toFixed(1)}% (Minimum: ${THRESHOLDS.LOW_HUMIDITY}%)`,
        time: new Date()
      });
    }
    
    if (data.water < THRESHOLDS.LOW_WATER) {
      newAlerts.push({
        type: 'warning',
        icon: '💧',
        title: 'Low Water Level',
        message: `${data.water} (Minimum: ${THRESHOLDS.LOW_WATER})`,
        time: new Date()
      });
    }
    
    if (data.temp > THRESHOLDS.HIGH_TEMP) {
      newAlerts.push({
        type: 'warning',
        icon: '🌡️',
        title: 'High Temperature',
        message: `${data.temp}°C (Max: ${THRESHOLDS.HIGH_TEMP}°C)`,
        time: new Date()
      });
    }
    
    if (data.temp < THRESHOLDS.LOW_TEMP) {
      newAlerts.push({
        type: 'warning',
        icon: '🌡️',
        title: 'Low Temperature',
        message: `${data.temp}°C (Min: ${THRESHOLDS.LOW_TEMP}°C)`,
        time: new Date()
      });
    }
    
    if (data.ir === 0) {
      newAlerts.push({
        type: 'info',
        icon: '👁️',
        title: 'Motion Detected',
        message: 'IR sensor triggered',
        time: new Date()
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  };

  const fetchSensorData = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const temp = parseFloat(urlParams.get('temp')) || 25;
      const humidity = parseFloat(urlParams.get('humidity')) || 0;
      const water = parseInt(urlParams.get('water')) || 0;
      const ir = parseInt(urlParams.get('ir')) || 1;

      const newData = { temp, humidity, water, ir, timestamp: new Date() };
      
      setSensorData(newData);
      checkAlerts(newData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch sensor data', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getHumidityStatus = () => {
    if (sensorData.humidity > THRESHOLDS.HIGH_HUMIDITY) 
      return { text: 'CRITICAL', color: 'bg-red-500', textColor: 'text-red-600', ring: 'ring-red-500' };
    if (sensorData.humidity < THRESHOLDS.LOW_HUMIDITY) 
      return { text: 'LOW', color: 'bg-yellow-500', textColor: 'text-yellow-600', ring: 'ring-yellow-500' };
    return { text: 'Normal', color: 'bg-green-500', textColor: 'text-green-600', ring: 'ring-green-500' };
  };

  const getTempStatus = () => {
    if (sensorData.temp > THRESHOLDS.HIGH_TEMP) 
      return { text: 'Too High', color: 'text-red-600' };
    if (sensorData.temp < THRESHOLDS.LOW_TEMP) 
      return { text: 'Too Low', color: 'text-blue-600' };
    return { text: 'Optimal', color: 'text-green-600' };
  };

  const getWaterStatus = () => {
    if (sensorData.water < THRESHOLDS.LOW_WATER) 
      return { text: 'LOW - Refill Soon', color: 'text-red-600' };
    if (sensorData.water < 400) 
      return { text: 'Moderate', color: 'text-yellow-600' };
    return { text: 'Good', color: 'text-green-600' };
  };

  const humidityStatus = getHumidityStatus();
  const tempStatus = getTempStatus();
  const waterStatus = getWaterStatus();
  const hasActiveAlerts = alerts.filter(a => a.type === 'critical' || a.type === 'warning').length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Activity className="text-green-600" size={36} />
                Silkworm IoT Monitor
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Real-time monitoring with Telegram alerts</p>
              {lastUpdate && (
                <p className="text-xs md:text-sm text-gray-500 mt-2">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
                <Bell className="text-green-600" size={18} />
                <span className="text-sm font-medium text-green-700">Telegram Active</span>
              </div>
              <button
                onClick={fetchSensorData}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {sensorData.humidity > THRESHOLDS.HIGH_HUMIDITY && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-lg animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
              <div className="flex-1">
                <p className="font-bold text-red-800">🚨 CRITICAL: High Humidity Alert!</p>
                <p className="text-red-700 text-sm mt-1">
                  Current: {sensorData.humidity.toFixed(1)}% | Limit: {THRESHOLDS.HIGH_HUMIDITY}%
                </p>
                <p className="text-red-600 text-xs mt-2">✓ Telegram notification sent • Buzzer activated</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-700">Temperature</h3>
                  <div className="bg-orange-100 p-2 rounded-full">
                    <ThermometerSun className="text-orange-600" size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {sensorData.temp.toFixed(1)}°C
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${tempStatus.color}`}>
                    {tempStatus.text}
                  </span>
                  <span className="text-xs text-gray-500">
                    Range: {THRESHOLDS.LOW_TEMP}-{THRESHOLDS.HIGH_TEMP}°C
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((sensorData.temp / 40) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className={`bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all ${
                sensorData.humidity > THRESHOLDS.HIGH_HUMIDITY ? 'ring-4 ring-red-500' : ''
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-700">Humidity</h3>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Droplets className="text-blue-600" size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {sensorData.humidity.toFixed(1)}%
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${humidityStatus.textColor}`}>
                    {humidityStatus.text}
                  </span>
                  <span className="text-xs text-gray-500">
                    Safe: {THRESHOLDS.LOW_HUMIDITY}-{THRESHOLDS.HIGH_HUMIDITY}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${humidityStatus.color}`}
                    style={{ width: `${Math.min(sensorData.humidity, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-700">Water Level</h3>
                  <div className="bg-cyan-100 p-2 rounded-full">
                    <Droplets className="text-cyan-600" size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {sensorData.water}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${waterStatus.color}`}>
                    {waterStatus.text}
                  </span>
                  <span className="text-xs text-gray-500">Min: {THRESHOLDS.LOW_WATER}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((sensorData.water / 1024) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-700">Motion Detection</h3>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Eye className="text-purple-600" size={20} />
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    sensorData.ir === 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}>
                    <Eye className="text-white" size={28} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {sensorData.ir === 0 ? 'Detected' : 'Clear'}
                    </div>
                    <div className="text-xs text-gray-500">IR Sensor Status</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Value: {sensorData.ir} (0 = Detected, 1 = Clear)
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5">
              <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Wifi className="text-green-600" size={20} />
                System Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">WiFi Online</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">LED: ON</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    sensorData.humidity > THRESHOLDS.HIGH_HUMIDITY ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs font-medium text-gray-700">
                    Buzzer: {sensorData.humidity > THRESHOLDS.HIGH_HUMIDITY ? 'ACTIVE' : 'Off'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Bell className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Telegram: ON</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-5 sticky top-6">
              <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Bell className={hasActiveAlerts ? "text-red-600" : "text-gray-600"} size={20} />
                Recent Alerts
                {hasActiveAlerts && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No alerts</p>
                    <p className="text-xs mt-1">All systems normal</p>
                  </div>
                ) : (
                  alerts.map((alert, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{alert.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {alert.time.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-xs md:text-sm">
          <p>ESP8266 Silkworm Monitoring System v2.0 with Telegram Integration</p>
          <p className="mt-1">Auto-refresh: 5s • Alert cooldown: 5min</p>
        </div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<SilkwormMonitor />);
