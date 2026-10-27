'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AlgorithmConvergenceStep } from '@/lib/types';

interface QuantumConvergenceChartProps {
  qigaData: AlgorithmConvergenceStep[];
  gaData?: AlgorithmConvergenceStep[];
  metricType?: 'fitness' | 'cost' | 'diversity';
}

export function QuantumConvergenceChart({
  qigaData,
  gaData,
  metricType = 'fitness',
}: QuantumConvergenceChartProps) {
  // Merge convergence data for simultaneous charting
  const chartData = qigaData.map((step, idx) => {
    const gaStep = gaData?.[idx];
    return {
      generation: step.generation,
      qigaBestFitness: step.bestFitness,
      qigaAvgFitness: step.avgFitness,
      qigaCost: step.bestCostScore,
      qigaDiversity: step.diversityMetric ? Number((step.diversityMetric * 100).toFixed(1)) : undefined,
      gaBestFitness: gaStep?.bestFitness,
      gaCost: gaStep?.bestCostScore,
      gaDiversity: gaStep?.diversityMetric ? Number((gaStep.diversityMetric * 100).toFixed(1)) : undefined,
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis
            dataKey="generation"
            label={{ value: 'Generation / Iteration', position: 'insideBottom', offset: -4, fill: '#888888', fontSize: 11 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            label={{
              value: metricType === 'fitness' ? 'Fitness Score (Higher is Better)' : 'Objective Cost J(r)',
              angle: -90,
              position: 'insideLeft',
              fill: '#888888',
              fontSize: 11,
              style: { textAnchor: 'middle' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

          {metricType === 'fitness' && (
            <>
              <Line
                type="monotone"
                dataKey="qigaBestFitness"
                name="QIGA Best Fitness (Quantum-Inspired)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="qigaAvgFitness"
                name="QIGA Population Average"
                stroke="#0891b2"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
              {gaData && (
                <Line
                  type="monotone"
                  dataKey="gaBestFitness"
                  name="Classical GA Best Fitness"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </>
          )}

          {metricType === 'cost' && (
            <>
              <Line
                type="monotone"
                dataKey="qigaCost"
                name="QIGA Multi-Objective Cost J(r)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
              />
              {gaData && (
                <Line
                  type="monotone"
                  dataKey="gaCost"
                  name="Classical GA Cost J(r)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </>
          )}

          {metricType === 'diversity' && (
            <>
              <Line
                type="monotone"
                dataKey="qigaDiversity"
                name="Qubit Shannon Superposition Entropy (%)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              {gaData && (
                <Line
                  type="monotone"
                  dataKey="gaDiversity"
                  name="Classical GA Chromosome Uniqueness (%)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
