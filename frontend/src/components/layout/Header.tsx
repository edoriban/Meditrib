import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Gestión de Farmacia</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/inventory" className="text-gray-600 hover:text-gray-900">
                Inventario
              </Link>
            </li>
            <li>
              <Link to="/reports" className="text-gray-600 hover:text-gray-900">
                Reportes
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}