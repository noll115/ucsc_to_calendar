import React from 'react';
import './App.scss';
import { QuarterSelect, SlugHeader, CourseSearch } from './components';
import CoursePanel from './components/CoursePanel/CoursePanel';
import KeyDatePanel from './components/KeyDatePanel/KeyDatePanel';
function App() {
  return (
    <div className="App">
      <SlugHeader />
      <div className="container">
        <QuarterSelect />
        <CourseSearch />
      </div>
      <div className="container"></div>
      <div className="container"></div>
      <CoursePanel />
      <KeyDatePanel />
    </div>
  );
}

export default App;
