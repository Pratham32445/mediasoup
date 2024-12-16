import React, { useContext, useEffect } from "react";
import { mediaSoupContext } from "./Mediasoup";

const App = () => {
  const { ws, initializeDevice } = useContext(mediaSoupContext);
  useEffect(() => {
    if (ws) {
      initializeDevice(ws);
    }
  }, [ws]);

  return <div>App</div>;
};

export default App;
