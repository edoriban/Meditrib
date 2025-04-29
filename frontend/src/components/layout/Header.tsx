import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Gestión de Farmacia</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-gray-300 hover:text-white">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/inventory" className="text-gray-300 hover:text-white">
                Inventario
              </Link>
            </li>
            <li>
              <Link to="/reports" className="text-gray-300 hover:text-white">
                Reportes
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}