import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg transition ${
      isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 bg-white shadow-lg p-5 min-h-screen">

      <h1 className="text-xl font-bold mb-6">Invexa</h1>

      <nav className="space-y-2">

        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/products" className={linkClass}>
          Products
        </NavLink>

        <NavLink to="/stocks" className={linkClass}>
          Stock
        </NavLink>

        <NavLink to="/sales" className={linkClass}>
          Sales
        </NavLink>

        <NavLink to="/billing" className={linkClass}>
          Billing 
        </NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;