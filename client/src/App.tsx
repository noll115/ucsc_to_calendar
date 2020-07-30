import React from 'react';
import './App.scss';
import { QuarterSelect, SlugHeader, CourseSearch } from './components';
import CoursePanel from './components/CoursePanel/CoursePanel';
import KeyDatePanel from './components/KeyDatePanel/KeyDatePanel';
import CoursesSelectedList from './components/CoursesSelectedList/CoursesSelectedList';
import ErrorDisplay from './components/ErrorDisplay/ErrorDisplay';


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
      <div className="container"></div>
      <CoursePanel />
      <KeyDatePanel />
      <ErrorDisplay />
    </div>
  );
}

export default App;
