import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!username) newErrors.username = 'El campo de usuario es obligatorio';
    if (!password) newErrors.password = 'El campo de contraseña es obligatorio';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password
      });

      if (response.status === 200) {
        const userData = { username }; // Almacena el nombre de usuario
        login(userData); // Actualiza el estado de autenticación
        navigate('/dashboard', { replace: true }); // Redirige al dashboard
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrors({ general: 'Credenciales incorrectas' });
      } else {
        console.error('Error en el inicio de sesión:', error);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          {errors.general && <p className="error">{errors.general}</p>}
          <button type="submit" className="btn-login">Iniciar Sesión</button>
        </form>
        <p className="register-link" style={{ color: 'white' }}>
          ¿No tienes una cuenta? <a href="/register" style={{ color: 'purple' }}>Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
