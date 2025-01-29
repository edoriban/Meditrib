import { Link } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Menú</h2>
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block p-2 hover:bg-gray-700 rounded">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/inventory" className="block p-2 hover:bg-gray-700 rounded">
                Inventario
              </Link>
            </li>
            <li>
              <Link to="/reports" className="block p-2 hover:bg-gray-700 rounded">
                Reportes
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}