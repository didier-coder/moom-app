import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function Reservations() {
  // 🧩 États
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [heures, setHeures] = useState([]);

  // 🕓 Charger la table "heure"
  useEffect(() => {
    const fetchHeures = async () => {
      const { data, error } = await supabase
        .from("heure")
        .select("id, horaire")
        .order("horaire", { ascending: true });

      if (error) {
        console.error("❌ Erreur chargement heures:", error);
      } else {
        console.log("✅ Heures chargées :", data);
        setHeures(data);
      }
    };

    fetchHeures();
  }, []);

  // 🧭 Charger la table "reservations"
  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          id,
          name,
          email,
          tel,
          date,
          personnes,
          service,
          societe,
          tva,
          comment,
          created_at,
          heure:heure_id(horaire),
          restaurant:restaurant_id(nom)
        `)
        .order(sortColumn, { ascending: sortOrder === "asc" });

      if (error) console.error("Erreur chargement réservations:", error);
      else setReservations(data || []);
      setLoading(false);
    };

    fetchReservations();
  }, [sortColumn, sortOrder]);

  // 🔁 Tri dynamique
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

  // ✅ Rendu du tableau
  return (
    <div className="p-4 text-[#1a1a1a]">
      <h2 className="text-2xl font-semibold mb-4">🧾 Réservations</h2>

      {loading ? (
        <p className="text-gray-500">Chargement des données...</p>
      ) : reservations.length === 0 ? (
        <p className="text-gray-500">Aucune réservation trouvée.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-xl bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#bad5b7] text-[#1a1a1a]">
              <tr>
                <th
                  onClick={() => handleSort("date")}
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
                >
                  Date <SortIcon column="date" />
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
                >
                  Client <SortIcon column="name" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Restaurant</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Heure</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Personnes</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Service</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Société</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">TVA</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Téléphone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Commentaire</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-[#bad5b7]/10 transition-colors duration-150"
                >
                  <td className="px-4 py-2 text-sm">
                    {r.date ? new Date(r.date).toLocaleDateString("fr-BE") : "—"}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-[#1a1a1a]">
                    {r.name || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm">{r.restaurant?.nom || "—"}</td>
                  <td className="px-4 py-2 text-sm">
                    {r.heure?.horaire
                      ? r.heure.horaire.slice(0, 5).replace(":", "h")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm">{r.personnes || "—"}</td>
                  <td className="px-4 py-2 text-sm">{r.service || "—"}</td>
                  <td className="px-4 py-2 text-sm">{r.societe || "—"}</td>
                  <td className="px-4 py-2 text-sm">{r.tva || "—"}</td>
                  <td className="px-4 py-2 text-sm">{r.tel || "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{r.comment || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
