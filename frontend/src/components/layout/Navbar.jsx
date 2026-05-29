import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-14 bg-white shadow flex justify-between items-center px-4">
      <h1 className="font-semibold">Dashboard</h1>

      <div className="flex gap-3 items-center">
        <span>{user?.name}</span>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;