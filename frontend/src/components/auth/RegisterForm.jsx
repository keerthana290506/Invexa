import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RegisterForm = () => {
  const { register, authLoading } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await register(form);

    if (res.success) {
      navigate("/dashboard");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Register to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
  name="role"
  value={form.role}
  onChange={handleChange}
  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="staff">Staff</option>
  <option value="admin">Admin</option>
</select>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            {authLoading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="text-center text-sm mt-5 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterForm;