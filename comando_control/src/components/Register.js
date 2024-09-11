import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Usa los mismos estilos que para el login

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!username) newErrors.username = 'El campo de usuario es obligatorio';
    if (!email) newErrors.email = 'El campo de correo electrónico es obligatorio';
    if (!validateEmail(email)) newErrors.email = 'El correo electrónico no es válido';
    if (!password) newErrors.password = 'El campo de contraseña es obligatorio';
    if (!confirmPassword) newErrors.confirmPassword = 'Debes confirmar la contraseña';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Guardar el usuario en el almacenamiento local (localStorage)
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);

    alert('Registro exitoso');
    navigate('/login'); // Redirige al login después del registro
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Registro</h2>
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
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChage={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" className="btn-login">Registrar</button>
        </form>
        <p className="register-link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
