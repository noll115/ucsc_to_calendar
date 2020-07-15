import React from 'react';
import './App.scss';
import { CourseSelector, SlugHeader } from './components';
import QuarterSelect from './components/QuarterSelect/QuarterSelect';
function App() {
  return (
    <div className="App">
      <SlugHeader />
      <QuarterSelect />
    </div>
  );
}

export default App;
