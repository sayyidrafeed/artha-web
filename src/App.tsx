import { Routes, Route } from 'react-router-dom';

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<div>Artha - Personal Finance Tracker</div>} />
      </Routes>
    </div>
  );
}

export default App;
