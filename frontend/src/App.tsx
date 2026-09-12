import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AlertMessage } from './components/AlertMessage';

import { Dashboard } from './pages/Dashboard';
import { DataPage } from './pages/DataPage';
import { ForecastPage } from './pages/ForecastPage';
import { ModelPerformance } from './pages/ModelPerformance';
import { BusinessInsights } from './pages/BusinessInsights';
import { DataQuality } from './pages/DataQuality';
import { AboutPage } from './pages/AboutPage';

import { api } from './services/api';
import {
  DataSummaryResponse,
  PerformanceResponse,
  ForecastResponse,
  BusinessInsightsResponse
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(30);

  const [dataSummary, setDataSummary] = useState<DataSummaryResponse | null>(null);
  const [performance, setPerformance] = useState<PerformanceResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [insights, setInsights] = useState<BusinessInsightsResponse | null>(null);

  const [apiStatus, setApiStatus] = useState<boolean>(true);
  const [modelStatus, setModelStatus] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading ForecastIQ ML System...');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadAllData = async (horizon: number = selectedHorizon) => {
    setIsProcessing(true);
    setLoadingMessage('Synchronizing machine learning data & model state...');
    setErrorMsg(null);
    try {
      const health = await api.checkHealth();
      setApiStatus(health.status === 'online');
      setModelStatus(health.model_trained);

      const summaryRes = await api.getDataSummary();
      setDataSummary(summaryRes);

      const perfRes = await api.getPerformance();
      setPerformance(perfRes);
      setModelStatus(true);

      const forecastRes = await api.getForecast(horizon);
      setForecast(forecastRes);

      const insightsRes = await api.getBusinessInsights(horizon);
      setInsights(insightsRes);
    } catch (err: any) {
      console.error('API Sync Error:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to connect to backend server.');
      setApiStatus(false);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setLoadingMessage('Uploading & inspecting CSV dataset...');
    setErrorMsg(null);
    try {
      const summaryRes = await api.uploadCSV(file);
      setDataSummary(summaryRes);
      setSuccessMsg(`Successfully uploaded "${file.name}". Click "Train Machine Learning Model" to update predictions.`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to upload CSV file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsProcessing(true);
    setLoadingMessage('Resetting to 3-Year Sample Retail Dataset...');
    setErrorMsg(null);
    try {
      const summaryRes = await api.loadDemoData();
      setDataSummary(summaryRes);
      setSuccessMsg('Reset to sample dataset successfully.');
      await loadAllData(selectedHorizon);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to reset demo dataset.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrainModel = async (dateCol?: string, salesCol?: string) => {
    setIsProcessing(true);
    setLoadingMessage('Cleaning dataset, engineering time features, & training Random Forest model...');
    setErrorMsg(null);
    try {
      const perfRes = await api.trainModel(dateCol, salesCol);
      setPerformance(perfRes);
      setModelStatus(true);

      const forecastRes = await api.getForecast(selectedHorizon);
      setForecast(forecastRes);

      const insightsRes = await api.getBusinessInsights(selectedHorizon);
      setInsights(insightsRes);

      setSuccessMsg('Random Forest model trained and evaluated successfully! Predictions updated.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Model training failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHorizonChange = async (newHorizon: number) => {
    setSelectedHorizon(newHorizon);
    setIsProcessing(true);
    setLoadingMessage(`Generating ${newHorizon}-day recursive ML forecast...`);
    setErrorMsg(null);
    try {
      const forecastRes = await api.getForecast(newHorizon);
      setForecast(forecastRes);

      const insightsRes = await api.getBusinessInsights(newHorizon);
      setInsights(insightsRes);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update forecast horizon.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      {isProcessing && <LoadingOverlay message={loadingMessage} />}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="pl-64 flex flex-col min-h-screen">
        <Navbar
          apiStatus={apiStatus}
          modelStatus={modelStatus}
          onRefresh={() => loadAllData(selectedHorizon)}
          isRefreshing={isProcessing}
          selectedHorizon={selectedHorizon}
        />

        <main className="w-full pt-16 bg-background flex-1">
          <div className="p-gutter-desktop flex flex-col gap-space-lg max-w-[1680px] mx-auto w-full">
            {errorMsg && (
              <AlertMessage
                type="error"
                title="Application Error"
                message={errorMsg}
                onClose={() => setErrorMsg(null)}
              />
            )}

            {successMsg && (
              <AlertMessage
                type="success"
                title="Success"
                message={successMsg}
                onClose={() => setSuccessMsg(null)}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                dataSummary={dataSummary}
                performance={performance}
                forecast={forecast}
                insights={insights}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'data' && (
              <DataPage
                dataSummary={dataSummary}
                onFileUpload={handleFileUpload}
                onLoadDemo={handleLoadDemo}
                onTrainModel={handleTrainModel}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'forecast' && (
              <ForecastPage
                forecast={forecast}
                selectedHorizon={selectedHorizon}
                onHorizonChange={handleHorizonChange}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'performance' && (
              <ModelPerformance
                performance={performance}
                onRetrain={() => handleTrainModel()}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'insights' && (
              <BusinessInsights insights={insights} />
            )}

            {activeTab === 'quality' && (
              <DataQuality dataSummary={dataSummary} />
            )}

            {activeTab === 'about' && (
              <AboutPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
