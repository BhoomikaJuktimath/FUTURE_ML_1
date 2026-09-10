import React, { useState } from 'react';
import {
  Upload,
  Database,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Play,
  Calendar,
  IndianRupee as IndianRupeeIcon,
  AlertCircle
} from 'lucide-react';

import { DataSummaryResponse } from '../types';

interface DataPageProps {
  dataSummary: DataSummaryResponse | null;
  onFileUpload: (file: File) => Promise<void>;
  onLoadDemo: () => Promise<void>;
  onTrainModel: (dateCol?: string, salesCol?: string) => Promise<void>;
  isProcessing: boolean;
}

export const DataPage: React.FC<DataPageProps> = ({
  dataSummary,
  onFileUpload,
  onLoadDemo,
  onTrainModel,
  isProcessing
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedDateCol, setSelectedDateCol] = useState<string>('');
  const [selectedSalesCol, setSelectedSalesCol] = useState<string>('');

  const qr = dataSummary?.quality_report;
  const cols = qr?.columns || [];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleTrainClick = () => {
    onTrainModel(
      selectedDateCol || qr?.detected_date_column,
      selectedSalesCol || qr?.detected_sales_column
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Ingestion & Quality Hub</h2>
          <p className="text-sm text-slate-400">
            Upload custom business CSV files or use the default 3-year retail dataset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLoadDemo}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleTrainClick}
            disabled={isProcessing || !dataSummary}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Train Machine Learning Model</span>
          </button>
        </div>
      </div>

      {/* Upload Zone & Metadata Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CSV Dropzone */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-semibold text-white text-base mb-1">Dataset Upload</h3>
            <p className="text-xs text-slate-400 mb-4">Accepts CSV format with date and target sales columns.</p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-brand-400 bg-brand-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                id="csv-upload-input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="csv-upload-input" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-slate-200">
                  Drag & drop CSV file here or <span className="text-brand-400 underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-500">Supports files up to 50MB</p>
              </label>
            </div>
          </div>

          {/* Current File Info */}
          {dataSummary && (
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Dataset:</span>
                <span className="font-semibold text-brand-400 flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  {dataSummary.filename}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Source Type:</span>
                <span className="text-slate-200">{dataSummary.is_sample ? 'Demo Retail Dataset' : 'User Uploaded CSV'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Column Mapper & Quality Summary */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white text-base">Intelligent Column Detection</h3>
              <p className="text-xs text-slate-400">Verify auto-detected fields or select custom mapping.</p>
            </div>

            {qr && (
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  qr.health_status === 'Good'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : qr.health_status === 'Needs Attention'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                Health: {qr.health_status} ({qr.health_score}/100)
              </span>
            )}
          </div>

          {/* Select Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                Date Column
              </label>
              <select
                value={selectedDateCol || qr?.detected_date_column || ''}
                onChange={(e) => setSelectedDateCol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {cols.map((c) => (
                  <option key={c} value={c}>
                    {c} {c === qr?.detected_date_column ? '(Auto-Detected)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <IndianRupeeIcon className="w-3.5 h-3.5 text-emerald-400" />
                Sales / Demand Target Column
              </label>
              <select
                value={selectedSalesCol || qr?.detected_sales_column || ''}
                onChange={(e) => setSelectedSalesCol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {cols.map((c) => (
                  <option key={c} value={c}>
                    {c} {c === qr?.detected_sales_column ? '(Auto-Detected)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Badges */}
          {qr && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Rows</p>
                <p className="text-lg font-bold text-white">{qr.total_rows}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Columns</p>
                <p className="text-lg font-bold text-white">{qr.total_columns}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Missing Values</p>
                <p className="text-lg font-bold text-emerald-400">{qr.missing_values_count}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Date Span</p>
                <p className="text-xs font-bold text-brand-400 mt-1">{qr.total_days} Days</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Data Preview Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-400" />
            Dataset Preview (First 10 Rows)
          </h3>
          <span className="text-xs text-slate-400">Chronological raw records</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                {cols.map((col) => (
                  <th key={col} className="px-4 py-3">
                    <span className={col === qr?.detected_date_column ? 'text-brand-400 font-bold' : col === qr?.detected_sales_column ? 'text-emerald-400 font-bold' : ''}>
                      {col}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dataSummary?.preview_data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  {cols.map((col) => (
                    <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
