import { Link, Outlet } from 'react-router-dom';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-800">
          Admin Hubb
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin"
            className="block px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="block px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
          >
            Users
          </Link>
          <a
            href="#"
            className="block px-4 py-2 rounded text-gray-500 cursor-not-allowed"
            title="Coming soon"
          >
            Moderation
          </a>
          <a
            href="#"
            className="block px-4 py-2 rounded text-gray-500 cursor-not-allowed"
            title="Coming soon"
          >
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};
