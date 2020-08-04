import React from 'react';
import './App.scss';
import { QuarterSelect, SlugHeader, CourseSearch, CoursePanel, KeyDatePanel, CoursesSelectedList, ErrorDisplay, Calendar } from './components';


function App() {
  return (
    <div className="App">
      <SlugHeader />
      <div className="container">
        <QuarterSelect />
        <CourseSearch />
      </div>
      <div className="container">
        <CoursesSelectedList />
      </div>
      <div className="container">
        <Calendar />
      </div>
      <CoursePanel />
      <KeyDatePanel />
      <ErrorDisplay />
    </div>
  );
}

export default App;
