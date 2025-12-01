import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';

interface WeeklyData {
  week: string;
  [key: string]: string | number;
}

export function WeeklyChart() {
  const [chartData, setChartData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [colors] = useState(['#2563eb', '#dc2626', '#059669', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899']);

  useEffect(() => {
    loadWeeklyData();
    const interval = setInterval(loadWeeklyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWeeklyData = async () => {
    try {
      const { data, error } = await supabase
        .from('anecdote_history')
        .select('*')
        .order('week_start', { ascending: true });

      if (error) throw error;

      const grouped: { [key: string]: { [key: string]: number } } = {};

      if (data) {
        data.forEach((item) => {
          const weekStart = new Date(item.week_start);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const weekLabel = `${weekStart.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}`;

          if (!grouped[weekLabel]) {
            grouped[weekLabel] = {};
          }
          grouped[weekLabel][item.person_name] = (grouped[weekLabel][item.person_name] || 0) + item.count;
        });
      }

      const chartDataArray = Object.entries(grouped).map(([week, people]) => ({
        week,
        ...people,
      }));

      setChartData(chartDataArray);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Chargement du graphique...</div>;
  }

  if (chartData.length === 0) {
    return <div className="text-center py-8 text-slate-500">Aucune donnée disponible</div>;
  }

  const personNames = chartData.length > 0
    ? Object.keys(chartData[0]).filter(key => key !== 'week')
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Évolution par semaine (Barres)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value, '']}
            />
            <Legend />
            {personNames.map((name, index) => (
              <Bar
                key={name}
                dataKey={name}
                fill={colors[index % colors.length]}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Évolution par semaine (Courbes)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value, '']}
            />
            <Legend />
            {personNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], r: 5 }}
                activeDot={{ r: 7 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
