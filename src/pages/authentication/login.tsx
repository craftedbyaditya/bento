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
    navigate('/dashboard');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-8 bg-white rounded-lg border border-gray-200 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back
        </h2>
        <p className="text-xs text-gray-600 mb-12">
          Don't have an account?{' '}
          <button
            onClick={handleRegisterClick}
            className="text-blue-500 hover:text-blue-600 font-medium ml-1"
          >
            Sign up
          </button>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <TextField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;