import React from 'react';
import { Route, Routes } from 'react-router-dom'

import "./app.css";
import "./components/css/pagination.css"

import HeaderAndFooter from './components/HeaderAndFooter';

import Drug from './pages/Drug';
import AdverseReaction from './pages/AdverseReaction';
import SearchResults from './pages/SearchResults';

const Home = React.lazy(() => import('./pages/Home'));
const Download = React.lazy(() => import('./pages/Download'));
const DrugsList = React.lazy(() => import('./pages/DrugsList'));
const AdverseReactionsList = React.lazy(() => import('./pages/AdverseReactionsList'));
const PageDoesNotExist = React.lazy(() => import('./pages/PageDoesNotExist'));



function App() {
  return (
    <div className="app">

      <Routes>

        <Route path="/" element={ <HeaderAndFooter /> }>
          
          <Route exact path="/drugs/:id" element={ <Drug/> } />
          <Route exact path="/adverse/:id" element={ <AdverseReaction/> } />
          <Route exact path="/search" element={ <SearchResults/> } />
          <Route exact path="/drugs" element={ <DrugsList/> } />
          <Route exact path="/adverse" element={ <AdverseReactionsList/> } />
          <Route exact path="/download" element={ <Download/> } />
          <Route exact path="" element={ <Home/> } />
          <Route path="*" element={ <PageDoesNotExist/> } />

        </Route> 
       
      </Routes>


    </div>
  );
}

export default App;
