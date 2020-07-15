import React from 'react';
import './App.scss';
import { QuarterSelect, SlugHeader } from './components';
function App() {
  return (
    <div className="App">
      <SlugHeader />
      <div className="container">
        <QuarterSelect />
      </div>
      <div className="container"></div>
      <div className="container"></div>
    </div>
  );
}

export default App;
