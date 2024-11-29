import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting login data:', formData);
    // Add your login logic here
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-8 
        bg-white 
        rounded-lg 
        border 
        border-gray-200 
        shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back
        </h2>
        <p className="text-xs text-gray-600 mb-12">
          Don't have an account?
          <span
            onClick={handleRegisterClick}
            className="text-blue-500 
              ml-1 
              cursor-pointer 
              underline"
          >
            Sign up
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <div className="mt-12">
            <Button type="submit">
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;