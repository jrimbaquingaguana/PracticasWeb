import React from 'react';
import ReactDOM from 'react-dom'; // Asegúrate de que sea 'ReactDOM', no 'RReactDOM'
import App from './App';
import { AuthProvider } from './components/AuthContext'; // Asegúrate de que la ruta sea correcta

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById('root')
)