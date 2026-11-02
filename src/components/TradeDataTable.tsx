import React, { useState, useMemo } from 'react';
import { ComtradeRecord } from '../types';
import { getCountryName, getCommodityName, getFlowName } from '../services/comtradeService';
import { formatExactUSD, formatUSD, formatWeight, downloadCSV, downloadJSON } from '../lib/utils';
import { 
  Table, 
  Download, 
  Search, 
  ArrowUpDown, 
  FileText, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface TradeDataTableProps {
  records: ComtradeRecord[];
  language: 'fa' | 'en';
}

export const TradeDataTable: React.FC<TradeDataTableProps> = ({ records, language }) => {
  const isFa = language === 'fa';
  const [searchTerm, setSearchTerm] = useState('');
  const [flowFilter, setFlowFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<string>('primaryValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const pageSize = 15;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Flow filter
      if (flowFilter !== 'ALL' && (r.flowCode || '').toUpperCase() !== flowFilter) {
        return false;
      }

      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const repName = getCountryName(r.reporterCode, language).toLowerCase();
      const partName = getCountryName(r.partnerCode, language).toLowerCase();
      const cmdName = getCommodityName(r.cmdCode, language).toLowerCase();
      const period = String(r.period || '');
      const cmdCode = String(r.cmdCode || '');

      return (
        repName.includes(term) ||
        partName.includes(term) ||
        cmdName.includes(term) ||
        period.includes(term) ||
        cmdCode.includes(term)
      );
    });
  }, [records, searchTerm, flowFilter, language]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a: any, b: any) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'primaryValue' || sortField === 'netWgt') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCopy = () => {
    const textData = JSON.stringify(sortedRecords, null, 2);
    navigator.clipboard.writeText(textData);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExportCSV = () => {
    const exportData = sortedRecords.map(r => ({
      Period: r.period,
      Reporter_Code: r.reporterCode,
      Reporter: r.reporterDesc || getCountryName(r.reporterCode, 'en'),
      Partner_Code: r.partnerCode,
      Partner: r.partnerDesc || getCountryName(r.partnerCode, 'en'),
      Flow: r.flowDesc || r.flowCode,
      Commodity_Code: r.cmdCode,
      Commodity: r.cmdDesc || getCommodityName(r.cmdCode, 'en'),
      Trade_Value_USD: r.primaryValue,
      Net_Weight_kg: r.netWgt || '',
      Gross_Weight_kg: r.grossWgt || '',
      Qty: r.qty || ''
    }));
    downloadCSV(exportData, `un-comtrade-export-${Date.now()}.csv`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full inline-block"></span>
            <span>{isFa ? 'جدول رکوردهای آماری گمرک' : 'Customs Records & Data Table'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isFa 
              ? `${sortedRecords.length.toLocaleString()} رکورد ثبت شده در پایگاه داده‌های سازمان ملل` 
              : `Showing ${sortedRecords.length.toLocaleString()} records`}
          </p>
        </div>

        {/* Search, Filter & Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isFa ? 'جستجو در کشور یا کالا...' : 'Filter country / commodity...'}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md ps-9 pe-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-900 w-44 sm:w-52"
            />
          </div>

          {/* Flow filter */}
          <select
            value={flowFilter}
            onChange={(e) => { setFlowFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">{isFa ? 'همه جریان‌ها' : 'All Flows'}</option>
            <option value="X">{isFa ? 'صادرات (X)' : 'Exports (X)'}</option>
            <option value="M">{isFa ? 'واردات (M)' : 'Imports (M)'}</option>
            <option value="RX">{isFa ? 'صادرات مجدد (RX)' : 'Re-exports'}</option>
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title={isFa ? 'کپی داده‌ها به صورت JSON' : 'Copy JSON to clipboard'}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* CSV Export */}
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {/* JSON Export */}
          <button
            onClick={() => downloadJSON(sortedRecords, `un-comtrade-${Date.now()}.json`)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-start border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 text-start">
                <button onClick={() => handleSort('period')} className="flex items-center gap-1 hover:text-slate-900">
                  <span>{isFa ? 'دوره / سال' : 'Period'}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-start">
                <span>{isFa ? 'کشور گزارش‌دهنده' : 'Reporter'}</span>
              </th>
              <th className="py-3 px-4 text-start">
                <span>{isFa ? 'طرف تجاری' : 'Partner'}</span>
              </th>
              <th className="py-3 px-4 text-start">
                <span>{isFa ? 'جریان' : 'Flow'}</span>
              </th>
              <th className="py-3 px-4 text-start">
                <span>{isFa ? 'کد و شرح کالا' : 'Commodity'}</span>
              </th>
              <th className="py-3 px-4 text-end">
                <button onClick={() => handleSort('primaryValue')} className="flex items-center gap-1 justify-end w-full hover:text-slate-900">
                  <span>{isFa ? 'ارزش (USD)' : 'Trade Value (USD)'}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-end">
                <button onClick={() => handleSort('netWgt')} className="flex items-center gap-1 justify-end w-full hover:text-slate-900">
                  <span>{isFa ? 'وزن خالص' : 'Net Weight'}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  {isFa ? 'هیچ رکوردی برای نمایش وجود ندارد.' : 'No trade records found.'}
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r, idx) => {
                const flowInfo = getFlowName(r.flowCode, language);
                const flowCode = (r.flowCode || '').toUpperCase();
                return (
                  <tr key={`row-${idx}-${r.period}-${r.partnerCode}-${r.cmdCode}`} className="hover:bg-slate-50/80 transition-colors">
                    {/* Period */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {r.period || r.refYear}
                    </td>

                    {/* Reporter */}
                    <td className="py-3 px-4 text-slate-900 font-medium whitespace-nowrap">
                      {getCountryName(r.reporterCode, language)}
                    </td>

                    {/* Partner */}
                    <td className="py-3 px-4 text-slate-900 whitespace-nowrap">
                      {getCountryName(r.partnerCode, language)}
                    </td>

                    {/* Flow Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        flowCode === 'X'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : flowCode === 'M'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : flowCode === 'RX'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {flowInfo.name} ({flowCode})
                      </span>
                    </td>

                    {/* Commodity */}
                    <td className="py-3 px-4 max-w-xs truncate" title={r.cmdDesc || getCommodityName(r.cmdCode, language)}>
                      <span className="font-mono text-blue-600 font-semibold me-1.5">[{r.cmdCode}]</span>
                      <span className="text-slate-700">{r.cmdDesc || getCommodityName(r.cmdCode, language)}</span>
                    </td>

                    {/* Primary Value in USD */}
                    <td className="py-3 px-4 text-end font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatExactUSD(r.primaryValue)}
                    </td>

                    {/* Net Weight */}
                    <td className="py-3 px-4 text-end font-mono text-slate-600 whitespace-nowrap">
                      {formatWeight(r.netWgt, language)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div>
          {isFa ? (
            <span>صفحه {currentPage} از {totalPages} (کل: {sortedRecords.length})</span>
          ) : (
            <span>Page {currentPage} of {totalPages} ({sortedRecords.length} items)</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
          </button>
          <span className="font-mono font-bold px-2">{currentPage}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
