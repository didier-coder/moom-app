import React from "react";

export default function ModalForm({
  open,
  title,
  fields = [],
  initialValues = {},
  onClose,
  onSubmit,
  submitLabel = "Enregistrer",
}) {
  // ✅ Tous les hooks doivent être au tout début :
  const [formValues, setFormValues] = React.useState(initialValues);

  React.useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  // ✅ On ne retourne la modale que si `open` est vrai
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="px-2 py-1 border rounded-md">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {fields.map((f) => (
            <div key={f.name} className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">{f.label}</label>
              <input
                type={f.type || "text"}
                name={f.name}
                value={formValues[f.name] || ""}
                onChange={handleChange}
                className="border rounded-lg p-2"
              />
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="border rounded-lg px-4 py-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-[#bad5b7] hover:bg-[#a8c9a3] rounded-lg px-4 py-2 text-[#1a1a1a]"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
