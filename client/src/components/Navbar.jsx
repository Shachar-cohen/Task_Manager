import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Task Manager
        </h1>

        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
