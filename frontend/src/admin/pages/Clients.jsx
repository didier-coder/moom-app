import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [sortColumn, setSortColumn] = useState("client_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);

  // 🧭 Charger les données depuis la vue clients_stats
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients_stats")
        .select("*")
        .order(sortColumn, { ascending: sortOrder === "asc" });

      if (error) console.error("Erreur chargement clients:", error);
      else setClients(data || []);
      setLoading(false);
    };

    fetchClients();
  }, [sortColumn, sortOrder]);

  // 🔁 Fonction de tri dynamique
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <FaSort className="inline ml-1 opacity-40" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="inline ml-1" />
    ) : (
      <FaSortDown className="inline ml-1" />
    );
  };

  return (
    <div className="p-4 text-[#1a1a1a]">
      <h2 className="text-2xl font-semibold mb-4 text-[#1a1a1a]">
        👥 Liste des Clients
      </h2>

      {loading ? (
        <p className="text-gray-500">Chargement des données...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-500">Aucun client trouvé.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-xl bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#bad5b7] text-[#1a1a1a]">
              <tr>
                <th
                  onClick={() => handleSort("client_name")}
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
                >
                  Nom <SortIcon column="client_name" />
                </th>
                <th
                  onClick={() => handleSort("client_email")}
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
                >
                  Email <SortIcon column="client_email" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Téléphone</th>
                <th
                  onClick={() => handleSort("total_reservations")}
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
                >
                  Réservations <SortIcon column="total_reservations" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Restaurants</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Première visite</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Dernière visite</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {clients.map((client, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#f3f8f3] transition-colors duration-150"
                >
                  <td className="px-4 py-2 text-sm font-medium text-[#1a1a1a]">
                    {client.client_name || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm">{client.client_email || "—"}</td>
                  <td className="px-4 py-2 text-sm">{client.client_phone || "—"}</td>
                  <td className="px-4 py-2 text-center font-semibold text-[#a8c9a3]">
                    {client.total_reservations}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {client.restaurant_names?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {client.first_date
                      ? new Date(client.first_date).toLocaleDateString("fr-BE")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {client.last_date
                      ? new Date(client.last_date).toLocaleDateString("fr-BE")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
