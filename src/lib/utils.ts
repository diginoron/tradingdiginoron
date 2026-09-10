import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values in USD ($ billions, millions, thousands)
 */
export function formatUSD(value: number | undefined | null, language: 'fa' | 'en' = 'en'): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0';
  }

  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absVal >= 1e12) {
    const formatted = (absVal / 1e12).toFixed(2);
    return language === 'fa' ? `${sign}$${formatted} تریلیون` : `${sign}$${formatted}T`;
  }
  if (absVal >= 1e9) {
    const formatted = (absVal / 1e9).toFixed(2);
    return language === 'fa' ? `${sign}$${formatted} میلیارد` : `${sign}$${formatted}B`;
  }
  if (absVal >= 1e6) {
    const formatted = (absVal / 1e6).toFixed(2);
    return language === 'fa' ? `${sign}$${formatted} میلیون` : `${sign}$${formatted}M`;
  }
  if (absVal >= 1e3) {
    const formatted = (absVal / 1e3).toFixed(1);
    return language === 'fa' ? `${sign}$${formatted} هزار` : `${sign}$${formatted}K`;
  }

  return `${sign}$${Math.round(absVal).toLocaleString()}`;
}

/**
 * Format exact USD number with thousand separators
 */
export function formatExactUSD(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format weight in kilograms or metric tons
 */
export function formatWeight(kg: number | undefined | null, language: 'fa' | 'en' = 'en'): string {
  if (!kg || isNaN(kg) || kg <= 0) return language === 'fa' ? 'ثبت نشده' : 'N/A';

  if (kg >= 1e6) {
    const tons = (kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 });
    return language === 'fa' ? `${tons} تن متریک` : `${tons} Metric Tons`;
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} tons`;
  }
  return `${Math.round(kg).toLocaleString()} kg`;
}

export function formatKG(kg: number | undefined | null): string {
  if (!kg || isNaN(kg) || kg <= 0) return '-';
  if (kg >= 1e6) return `${(kg / 1e6).toFixed(2)}k Tons`;
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} Tons`;
  return `${Math.round(kg).toLocaleString()} kg`;
}

export function formatWeightKg(kg: number | undefined | null, language: 'fa' | 'en' = 'en'): string {
  return formatWeight(kg, language);
}

export function calculateUnitValue(usd: number | undefined | null, weightKg: number | undefined | null): number | null {
  if (!usd || !weightKg || weightKg <= 0 || usd <= 0) return null;
  return usd / weightKg;
}

/**
 * Export data array to CSV file download
 */
export function downloadCSV(data: any[], filename = 'un-comtrade-data.csv') {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to formatted JSON file download
 */
export function downloadJSON(data: any, filename = 'un-comtrade-data.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
