import { useState } from "react";

const initial = { label: "Home", fullName: "", phone: "", address: "", city: "", district: "", postalCode: "", country: "Bangladesh", isDefault: true };

export default function AddressForm({ onSubmit, defaultValues, submitLabel = "Save address" }) {
  const [form, setForm] = useState({ ...initial, ...(defaultValues || {}) });

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="field-label">Label<input name="label" value={form.label} onChange={change} className="field" placeholder="Home / Office" /></label>
      <label className="field-label">Full name<input name="fullName" value={form.fullName} onChange={change} className="field" placeholder="Receiver name" /></label>
      <label className="field-label">Phone<input name="phone" value={form.phone} onChange={change} className="field" placeholder="01XXXXXXXXX" /></label>
      <label className="field-label">City<input name="city" value={form.city} onChange={change} required className="field" placeholder="Dhaka" /></label>
      <label className="field-label md:col-span-2">Address<textarea name="address" value={form.address} onChange={change} required className="field min-h-24" placeholder="House, road, area" /></label>
      <label className="field-label">District<input name="district" value={form.district} onChange={change} className="field" placeholder="Dhaka" /></label>
      <label className="field-label">Postal code<input name="postalCode" value={form.postalCode} onChange={change} className="field" placeholder="1207" /></label>
      <label className="field-label md:col-span-2 flex-row items-center gap-3 rounded-2xl bg-leaf-50 p-4 text-sm text-slate-700">
        <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={change} className="h-4 w-4 accent-leaf-600" /> Make this my default delivery address
      </label>
      <div className="md:col-span-2">
        <button className="btn-primary w-full md:w-auto">{submitLabel}</button>
      </div>
    </form>
  );
}
