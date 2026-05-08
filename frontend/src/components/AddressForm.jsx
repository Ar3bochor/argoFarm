/**
 * File: src/components/AddressForm.jsx
 * Description: Reusable address form component used to 
 * collect and submit delivery address details.
 */

import { useState } from "react";

/**
 * Component-specific CSS.
 * These styles control the form layout, input fields, label pills, checkbox, and submit button.
 */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400;500;600&display=swap');

  .af * { box-sizing: border-box; }
  .af { font-family: 'Instrument Sans', sans-serif; color: #0d0d0d; }

  /* Two-column form layout */
  .af-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Switch to a single-column layout on smaller screens */
  @media (max-width: 580px) {
    .af-grid { grid-template-columns: 1fr; }
    .af-col-2 { grid-column: span 1 !important; }
  }

  /* Allows selected fields to span both columns */
  .af-col-2 { grid-column: span 2; }

  .af-field-group { display: flex; flex-direction: column; }

  /* Field label styling */
  .af-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 8px;
  }

  /* Shared input styling for text fields, select fields, and textarea */
  .af-input {
    display: block;
    width: 100%;
    height: 48px;
    border: 1px solid #e8e6e1;
    background: #fff;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    color: #0d0d0d;
    padding: 0 14px;
    outline: none;
    border-radius: 0;
    transition: border-color 0.15s, background 0.15s;
    -webkit-appearance: none;
    appearance: none;
  }

  .af-input::placeholder { color: #bbb; }
  .af-input:hover { background: #fafaf8; }
  .af-input:focus { border-color: #0d0d0d; background: #fff; }

  /* Textarea-specific spacing and resizing */
  .af-textarea {
    height: auto;
    min-height: 88px;
    padding: 12px 14px;
    resize: vertical;
    line-height: 1.6;
  }

  /* Select field styling with custom arrow icon */
  .af-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
    cursor: pointer;
  }

  /* Address label option buttons */
  .af-label-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .af-pill {
    height: 36px;
    padding: 0 16px;
    border: 1px solid #e8e6e1;
    background: #fff;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #555;
    cursor: pointer;
    border-radius: 0;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
  }

  .af-pill:hover { border-color: #888; }

  /* Highlights the selected address label */
  .af-pill.active {
    background: #0d0d0d;
    border-color: #0d0d0d;
    color: #fff;
  }

  /* Default address checkbox container */
  .af-check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid #e8e6e1;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s;
    user-select: none;
  }

  .af-check-row:hover { border-color: #888; }

  .af-check-row input[type="checkbox"] {
    width: 15px; height: 15px;
    accent-color: #0d0d0d;
    cursor: pointer;
    flex-shrink: 0;
  }

  .af-check-text {
    font-size: 13px;
    font-weight: 500;
    color: #555;
    line-height: 1.4;
  }

  /* Submit button styling */
  .af-submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    padding: 0 28px;
    background: #0d0d0d;
    color: #fff;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    border-radius: 0;
    transition: background 0.15s, transform 0.1s;
  }

  .af-submit-btn:hover { background: #222; }
  .af-submit-btn:active { transform: scale(0.99); }
`;

/**
 * Preset address label options shown as selectable pills.
 */
const LABEL_OPTIONS = ["Home", "Office", "Other"];

/**
 * Default form values used when no existing address data is provided.
 */
const initial = {
  label: "Home",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  postalCode: "",
  country: "Bangladesh",
  isDefault: true
};

export default function AddressForm({ onSubmit, defaultValues, submitLabel = "Save address" }) {
  /**
   * Store all address form fields in a single state object.
   * Existing address data can be passed through defaultValues when editing an address.
   */
  const [form, setForm] = useState({ ...initial, ...(defaultValues || {}) });

  /**
   * Handles changes for both regular inputs and checkbox inputs.
   */
  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /**
   * Prevents the default form reload and sends the completed address data to the parent component.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="af">
      <style>{css}</style>

      <div className="af-grid">

        {/* Address label selection */}
        <div className="af-field-group af-col-2">
          <span className="af-label" style={{ marginBottom: 10 }}>Label</span>

          <div className="af-label-pills">
            {LABEL_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                className={`af-pill${form.label === opt ? " active" : ""}`}
                onClick={() => setForm(p => ({ ...p, label: opt }))}
              >
                {opt}
              </button>
            ))}

            {/* Shows a custom label input when the selected label is not one of the preset options */}
            {!LABEL_OPTIONS.includes(form.label) && (
              <input
                name="label"
                value={form.label}
                onChange={change}
                className="af-input"
                placeholder="Custom label"
                style={{ height: 36, width: 140 }}
              />
            )}
          </div>
        </div>

        {/* Receiver full name */}
        <div className="af-field-group">
          <label className="af-label">Full name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={change}
            className="af-input"
            placeholder="Receiver name"
          />
        </div>

        {/* Receiver contact number */}
        <div className="af-field-group">
          <label className="af-label">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={change}
            className="af-input"
            placeholder="01XXXXXXXXX"
          />
        </div>

        {/* Detailed street address */}
        <div className="af-field-group af-col-2">
          <label className="af-label">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={change}
            required
            className="af-input af-textarea"
            placeholder="House no., road, area…"
          />
        </div>

        {/* City name */}
        <div className="af-field-group">
          <label className="af-label">City</label>
          <input
            name="city"
            value={form.city}
            onChange={change}
            required
            className="af-input"
            placeholder="Dhaka"
          />
        </div>

        {/* District name */}
        <div className="af-field-group">
          <label className="af-label">District</label>
          <input
            name="district"
            value={form.district}
            onChange={change}
            className="af-input"
            placeholder="Dhaka"
          />
        </div>

        {/* Postal code */}
        <div className="af-field-group">
          <label className="af-label">Postal code</label>
          <input
            name="postalCode"
            value={form.postalCode}
            onChange={change}
            className="af-input"
            placeholder="1207"
          />
        </div>

        {/* Country field, defaulted to Bangladesh */}
        <div className="af-field-group">
          <label className="af-label">Country</label>
          <input
            name="country"
            value={form.country}
            onChange={change}
            className="af-input"
            placeholder="Bangladesh"
          />
        </div>

        {/* Option to mark this address as the user's default delivery address */}
        <label className="af-check-row af-col-2">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={change}
          />
          <span className="af-check-text">Make this my default delivery address</span>
        </label>

        {/* Form submission button */}
        <div className="af-col-2">
          <button type="submit" className="af-submit-btn">
            {submitLabel} →
          </button>
        </div>

      </div>
    </form>
  );
}