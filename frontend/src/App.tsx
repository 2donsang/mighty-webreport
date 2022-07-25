import React, { Profiler, ProfilerOnRenderCallback } from 'react';
import Routing from "./router/Routing";
import GlobalStyle from "./styles/GlobalStyle";
import Footer from "./components/layout/footer/Footer";
import Header from "./components/layout/header/Header";
import Popup from "./components/common/Popup";
import {useSelector} from "react-redux";
import {RootState} from "./modules";

function App() {
    const alertState = useSelector((state:RootState)=>state.alertReducer);
  
    return (
      <div className="App">
          <GlobalStyle />
          <Header />
          <Routing />
          <Footer />
          <Popup
              show={alertState.show}
              header={alertState.header}
              bold={alertState.bold}
              text={alertState.text}
              callback={alertState.callback}
          />
      </div>
  );
}

export default App;
