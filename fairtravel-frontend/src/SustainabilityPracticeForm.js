import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function SustainabilityPracticeForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // encoded URI or "new"
  const isEdit = Boolean(id && id !== "new");

  const [formData, setFormData] = useState({
    practiceID: "",
    practiceName: "",
    practiceType: "",
    impactLevel: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Load existing data when editing
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      setFetchError(null);
      try {
        const decoded = decodeURIComponent(id);
        const res = await fetch(
          `http://localhost:5000/sustainability-details?uri=${encodeURIComponent(decoded)}`
        );
        if (!res.ok) throw new Error("Failed to load sustainability practice details");
        const data = await res.json();

        setFormData({
          practiceID: data["http://www.fairtravel.com/fairtravel#practiceID"] || decoded.split("#").pop() || "",
          practiceName: data["http://www.fairtravel.com/fairtravel#practiceName"] || "",
          practiceType: data["http://www.fairtravel.com/fairtravel#practiceType"] || "",
          impactLevel: data["http://www.fairtravel.com/fairtravel#impactLevel"] || "",
          description: data["http://www.fairtravel.com/fairtravel#description"] || ""
        });
      } catch (err) {
        console.error(err);
        setFetchError(err.message || "Error loading sustainability practice data");
      }
    };

    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.practiceID || !formData.practiceName) {
      alert("Practice ID and Name are required.");
      return;
    }

    setLoading(true);
    try {
      const properties = {
        practiceName: formData.practiceName,
        practiceType: formData.practiceType,
        impactLevel: formData.impactLevel,
        description: formData.description
      };

      let res;
      if (isEdit) {
        res = await fetch(
          `http://localhost:5000/sustainability-practices/${encodeURIComponent(formData.practiceID)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ properties })
          }
        );
      } else {
        res = await fetch("http://localhost:5000/sustainability-practices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: formData.practiceID,
            type: "SustainabilityPractice",
            properties
          })
        });
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed with status ${res.status}`);
      }

      alert(isEdit ? "Sustainability practice updated successfully" : "Sustainability practice created successfully");
      navigate("/sustainability-practices");
    } catch (err) {
      console.error(err);
      alert("Error saving sustainability practice: " + (err.message || "Unknown error"));
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
      <h2>{isEdit ? "Edit Sustainability Practice" : "New Sustainability Practice"}</h2>

      {fetchError && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {fetchError}</div>}

      <form onSubmit={handleSubmit}>
        {/* Practice ID */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Practice ID *
          </label>
          <input
            name="practiceID"
            value={formData.practiceID}
            onChange={handleChange}
            disabled={isEdit}
            required
            placeholder="ex: SolarEnergyUse"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Practice Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Practice Name *
          </label>
          <input
            name="practiceName"
            value={formData.practiceName}
            onChange={handleChange}
            required
            placeholder="ex: Solar Energy Use"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Practice Type */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Type
          </label>
          <input
            name="practiceType"
            value={formData.practiceType}
            onChange={handleChange}
            placeholder="ex: Renewable Energy"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Impact Level */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Impact Level
          </label>
          <input
            name="impactLevel"
            value={formData.impactLevel}
            onChange={handleChange}
            placeholder="ex: High"
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
            placeholder="ex: Solar panels installed across all facilities..."
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
            onClick={() => navigate("/sustainability-practices")}
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

export default SustainabilityPracticeForm;
