import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AccommodationForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // expected encoded URI or "new"
  const isEdit = Boolean(id && id !== "new");

  const [formData, setFormData] = useState({
    id: "",
    type: "Accommodation",
    accommodationName: "",
    pricePerNight: "",
    capacity: "",
    starRating: "",
    description: "",
    availabilityStatus: true,
    hasLocation: "",
    hasSustainabilityPractice: ""
  });

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Get JWT and role
  const token = localStorage.getItem('token');
  let role = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.sub && payload.sub.role ? payload.sub.role : null;
    } catch {}
  }

  // Load existing data when editing
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      setFetchError(null);
      try {
        const decoded = decodeURIComponent(id); // full URI
        const res = await fetch(
          `http://localhost:5000/accommodation-details?uri=${encodeURIComponent(decoded)}`
        );
        if (!res.ok) throw new Error("Failed to load accommodation details");
        const data = await res.json();

        const extractedId = decoded.includes("#") ? decoded.split("#").pop() : decoded;

        setFormData({
          id: extractedId,
          type:
            (data["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] &&
              data["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"].split("#").pop()) ||
            "Accommodation",
          accommodationName: data["http://www.fairtravel.com/fairtravel#accommodationName"] || "",
          pricePerNight: data["http://www.fairtravel.com/fairtravel#pricePerNight"] || "",
          capacity: data["http://www.fairtravel.com/fairtravel#capacity"] || "",
          starRating: data["http://www.fairtravel.com/fairtravel#starRating"] || "",
          description: data["http://www.fairtravel.com/fairtravel#description"] || "",
          availabilityStatus:
            data["http://www.fairtravel.com/fairtravel#availabilityStatus"] === "true",
          hasLocation:
            (data["http://www.fairtravel.com/fairtravel#hasLocation"] || "").split("#").pop() || "",
          hasSustainabilityPractice:
            (data["http://www.fairtravel.com/fairtravel#hasSustainabilityPractice"] || "")
              .split("#")
              .pop() || ""
        });
      } catch (err) {
        console.error(err);
        setFetchError(err.message || "Error loading data");
      }
    };

    load();
  }, [id, isEdit]);

  // Conditional rendering after hooks
  if (role !== 'admin') {
    return (
      <div style={{maxWidth:500,margin:'2rem auto',padding:'2rem',color:'red',textAlign:'center'}}>
        <h2>Access Denied</h2>
        <p>Only admins can create or edit accommodations.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id || !formData.accommodationName) {
      alert("ID and accommodation name are required.");
      return;
    }

    setLoading(true);
    try {
      const properties = {
        accommodationName: formData.accommodationName,
        pricePerNight:
          formData.pricePerNight === "" ? null : parseFloat(formData.pricePerNight),
        capacity: formData.capacity === "" ? null : parseInt(formData.capacity, 10),
        starRating: formData.starRating === "" ? null : parseInt(formData.starRating, 10),
        description: formData.description,
        availabilityStatus: Boolean(formData.availabilityStatus)
      };

      if (formData.hasLocation) properties.hasLocation = formData.hasLocation;
      if (formData.hasSustainabilityPractice)
        properties.hasSustainabilityPractice = formData.hasSustainabilityPractice;

      let res;
      if (isEdit) {
        res = await fetch(
          `http://localhost:5000/accommodations/${encodeURIComponent(formData.id)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ properties })
          }
        );
      } else {
        res = await fetch("http://localhost:5000/accommodations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: formData.id,
            type: formData.type,
            properties
          })
        });
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed with status ${res.status}`);
      }

      alert(isEdit ? "Accommodation updated successfully" : "Accommodation created successfully");
      navigate("/accommodations");
    } catch (err) {
      console.error(err);
      alert("Error saving accommodation: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "2rem auto",
        padding: "1.5rem",
        background: "white",
        borderRadius: 8,
        boxShadow: "0 2px 8px #ddd"
      }}
    >
      <h2>{isEdit ? "Edit Accommodation" : "New Accommodation"}</h2>

      {fetchError && (
        <div style={{ color: "red", marginBottom: "1rem" }}>Error: {fetchError}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ID */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            ID (unique) *
          </label>
          <input
            name="id"
            value={formData.id}
            onChange={handleChange}
            disabled={isEdit}
            required
            placeholder="ex: GreenValleyEcoLodge"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Accommodation Name *
          </label>
          <input
            name="accommodationName"
            value={formData.accommodationName}
            onChange={handleChange}
            required
            placeholder="ex: Green Valley Eco Lodge"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Price */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Price per night (€)
          </label>
          <input
            name="pricePerNight"
            type="number"
            min="0"
            step="0.01"
            value={formData.pricePerNight}
            onChange={handleChange}
            placeholder="ex: 120"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Capacity */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Capacity (people)
          </label>
          <input
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="ex: 4"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Star rating */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Star Rating (0-5)
          </label>
          <input
            name="starRating"
            type="number"
            min="0"
            max="5"
            value={formData.starRating}
            onChange={handleChange}
            placeholder="ex: 4"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="ex: Eco-friendly lodge in the mountains..."
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Availability */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <input
              name="availabilityStatus"
              type="checkbox"
              checked={Boolean(formData.availabilityStatus)}
              onChange={handleChange}
            />
            <span>Available for booking</span>
          </label>
        </div>

        {/* Location */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Location (place name, e.g., AlpinePark)
          </label>
          <input
            name="hasLocation"
            value={formData.hasLocation}
            onChange={handleChange}
            placeholder="ex: AlpinePark"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Sustainability practice */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Sustainability Practice (e.g., SolarEnergyUse)
          </label>
          <input
            name="hasSustainabilityPractice"
            value={formData.hasSustainabilityPractice}
            onChange={handleChange}
            placeholder="ex: SolarEnergyUse"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: ".75rem",
              background: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/accommodations")}
            style={{
              flex: 1,
              padding: ".75rem",
              background: "#666",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AccommodationForm;
