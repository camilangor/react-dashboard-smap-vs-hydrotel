import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ScatterChart, Scatter
} from 'recharts';

function App() {
  const [selectedMetric, setSelectedMetric] = useState('All');
  const [selectedView, setSelectedView] = useState('bar');

  const data = {
      "Dataset": [
          "Forest10_AM_SMAP", "Forest10_AM_HYD", "Forest10_PM_SMAP", "Forest10_PM_HYD",
          "Field10_AM_SMAP", "Field10_AM_HYD", "Field10_PM_SMAP", "Field10_PM_HYD",
          "Forest5_AM_SMAP", "Forest5_PM_SMAP", "Forest5_AM_HYD", "Forest5_PM_HYD",
          "Field5_AM_SMAP", "Field5_PM_SMAP", "Field5_AM_HYD", "Field5_PM_HYD"
      ],
      "Accuracy": [0.745, 0.842, 0.761, 0.824, 0.743, 0.884, 0.774, 0.869,
                   0.770, 0.811, 0.907, 0.907, 0.751, 0.763, 0.944, 0.935],
      "Precision": [0.947, 1.000, 0.973, 1.000, 0.942, 1.000, 0.952, 1.000,
                    0.855, 0.907, 0.943, 0.914, 1.000, 1.000, 0.978, 0.978],
      "Recall": [0.608, 0.717, 0.616, 0.679, 0.580, 0.792, 0.623, 0.764,
                 0.663, 0.697, 0.892, 0.914, 0.629, 0.653, 0.947, 0.937],
      "F1": [0.740, 0.835, 0.755, 0.809, 0.718, 0.884, 0.753, 0.866,
             0.747, 0.788, 0.917, 0.914, 0.772, 0.790, 0.962, 0.957],
      "MCC": [0.562, 0.727, 0.598, 0.698, 0.556, 0.791, 0.604, 0.768,
              0.557, 0.640, 0.813, 0.813, 0.598, 0.611, 0.853, 0.831]
  };

  const rawData = data.Dataset.map((dataset, index) => ({
      dataset,
      accuracy: data.Accuracy[index],
      precision: data.Precision[index],
      recall: data.Recall[index],
      f1: data.F1[index],
      mcc: data.MCC[index]
  }));

  const processedData = rawData.map(item => {
      const parts = item.dataset.split('_');
    return {
      ...item,
        station: parts[0],
        depth: parts[1],
        time: parts[2],
        model: parts[3],
        label: `${parts[0]} ${parts[1]}cm ${parts[2]} - ${parts[3]}`
};
});

  const groupedData = [];
  const conditions = [
    { key: 'Forest10_AM', label: 'Forest 10cm AM' },
    { key: 'Forest10_PM', label: 'Forest 10cm PM' },
    { key: 'Field10_AM', label: 'Field 10cm AM' },
    { key: 'Field10_PM', label: 'Field 10cm PM' },
    { key: 'Forest5_AM', label: 'Forest 5cm AM' },
    { key: 'Forest5_PM', label: 'Forest 5cm PM' },
    { key: 'Field5_AM', label: 'Field 5cm AM' },
    { key: 'Field5_PM', label: 'Field 5cm PM' }
  ];

conditions.forEach(condition => {
    const smapData = rawData.find(d => d.dataset === `${condition.key}_SMAP`);
    const hydData = rawData.find(d => d.dataset === `${condition.key}_HYD`);
    
if (smapData && hydData) {
    groupedData.push({
        condition: condition.label,
        station: condition.key.includes('Forest') ? 'Forest' : 'Field',
        depth: condition.key.includes('10') ? '10cm' : '5cm',
        time: condition.key.includes('AM') ? 'AM' : 'PM',
        SMAP_Accuracy: smapData.accuracy,
        HYD_Accuracy: hydData.accuracy,
        SMAP_Precision: smapData.precision,
        HYD_Precision: hydData.precision,
        SMAP_Recall: smapData.recall,
        HYD_Recall: hydData.recall,
        SMAP_F1: smapData.f1,
        HYD_F1: hydData.f1,
        SMAP_MCC: smapData.mcc,
        HYD_MCC: hydData.mcc
    });
}
});

  const smapEntries = rawData.filter(d => d.dataset.includes('SMAP'));
  const hydEntries = rawData.filter(d => d.dataset.includes('HYD'));

  const avg = (arr, key) => arr.reduce((sum, d) => sum + d[key], 0) / arr.length;
  const avgSMAP = {
      accuracy: avg(smapEntries, 'accuracy'),
      precision: avg(smapEntries, 'precision'),
      recall: avg(smapEntries, 'recall'),
      f1: avg(smapEntries, 'f1'),
      mcc: avg(smapEntries, 'mcc')
  };
  const avgHYD = {
      accuracy: avg(hydEntries, 'accuracy'),
      precision: avg(hydEntries, 'precision'),
      recall: avg(hydEntries, 'recall'),
      f1: avg(hydEntries, 'f1'),
      mcc: avg(hydEntries, 'mcc')
  };

  const radarData = [
    { metric: 'Accuracy', SMAP: avgSMAP.accuracy, HYD: avgHYD.accuracy },
    { metric: 'Precision', SMAP: avgSMAP.precision, HYD: avgHYD.precision },
    { metric: 'Recall', SMAP: avgSMAP.recall, HYD: avgHYD.recall },
    { metric: 'F1 Score', SMAP: avgSMAP.f1, HYD: avgHYD.f1 },
    { metric: 'MCC', SMAP: avgSMAP.mcc, HYD: avgHYD.mcc }
  ];

  const scatterData = groupedData.map(d => ({
      name: d.condition,
      smap: d.SMAP_F1,
      hyd: d.HYD_F1,
      station: d.station,
      depth: d.depth
  }));

  const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid gray' }}>
          <p>{label}</p>
{payload.map((entry, i) => (
  <p key={i} style={{ color: entry.color }}>
{`${entry.dataKey}: ${entry.value.toFixed(3)}`}
</p>
          ))}
</div>
      );
}
return null;
};

return (
  <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
    <h1>SMAP vs Hydrotel Model Performance</h1>
    <label>
      Select view:
    <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
      <option value="bar">Bar Chart</option>
      <option value="radar">Radar Chart</option>
      <option value="scatter">F1 Scatter</option>
    </select>
  </label>
  <br />
  {selectedView === 'bar' && (
    <>
      <label>
          Metric:
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
              <option value="All">All</option>
              <option value="Accuracy">Accuracy</option>
              <option value="F1">F1</option>
              <option value="MCC">MCC</option>
            </select>
          </label>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="condition" angle={-45} textAnchor="end" interval={0} />
              <YAxis domain={[0, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(selectedMetric === 'All' || selectedMetric === 'Accuracy') && <>
                <Bar dataKey="SMAP_Accuracy" fill="#3B82F6" />
                <Bar dataKey="HYD_Accuracy" fill="#10B981" />
              </>}
              {(selectedMetric === 'All' || selectedMetric === 'F1') && <>
                <Bar dataKey="SMAP_F1" fill="#6366F1" />
                <Bar dataKey="HYD_F1" fill="#059669" />
              </>}
              {(selectedMetric === 'All' || selectedMetric === 'MCC') && <>
                <Bar dataKey="SMAP_MCC" fill="#8B5CF6" />
                <Bar dataKey="HYD_MCC" fill="#047857" />
              </>}
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
      {selectedView === 'radar' && (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis domain={[0, 1]} />
            <Radar name="SMAP" dataKey="SMAP" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            <Radar name="HYD" dataKey="HYD" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      )}
{selectedView === 'scatter' && (
  <ResponsiveContainer width="100%" height={400}>
    <ScatterChart>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="smap" name="SMAP F1" domain={[0.6, 1]} />
      <YAxis dataKey="hyd" name="Hydrotel F1" domain={[0.6, 1]} />
      <Tooltip content={<CustomTooltip />} />
      <Scatter data={scatterData.filter(d => d.station === 'Forest')} fill="#8B5CF6" name="Forest" />
      <Scatter data={scatterData.filter(d => d.station === 'Field')} fill="#F59E0B" name="Field" />
      <Legend />
    </ScatterChart>
  </ResponsiveContainer>
      )}
</div>
  );
}

export default App;
