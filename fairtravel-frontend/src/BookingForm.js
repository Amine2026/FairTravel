import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function BookingForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // expected encoded URI or "new"
  const isEdit = Boolean(id && id !== "new");

  const [formData, setFormData] = useState({
    bookingID: "",
    bookingDate: "",
    checkInDate: "",
    checkOutDate: "",
    totalPrice: "",
    paymentStatus: "Pending", // default
    forAccommodation: ""
  });

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Load existing booking when editing
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      setFetchError(null);
      try {
        const decoded = decodeURIComponent(id);
        const res = await fetch(
          `http://localhost:5000/booking-details?uri=${encodeURIComponent(decoded)}`
        );
        if (!res.ok) throw new Error("Failed to load booking details");
        const data = await res.json();

        setFormData({
          bookingID: data["http://www.fairtravel.com/fairtravel#bookingID"] || "",
          bookingDate: data["http://www.fairtravel.com/fairtravel#bookingDate"] || "",
          checkInDate: data["http://www.fairtravel.com/fairtravel#checkInDate"] || "",
          checkOutDate: data["http://www.fairtravel.com/fairtravel#checkOutDate"] || "",
          totalPrice: data["http://www.fairtravel.com/fairtravel#totalPrice"] || "",
          paymentStatus: data["http://www.fairtravel.com/fairtravel#paymentStatus"] || "Pending",
          forAccommodation:
            (data["http://www.fairtravel.com/fairtravel#forAccommodation"] || "").split("#").pop() || ""
        });
      } catch (err) {
        console.error(err);
        setFetchError(err.message || "Error loading booking data");
      }
    };

    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookingID || !formData.forAccommodation) {
      alert("Booking ID and Accommodation are required.");
      return;
    }

    setLoading(true);
    try {
      const properties = {
        bookingDate: formData.bookingDate,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        totalPrice: formData.totalPrice === "" ? null : parseFloat(formData.totalPrice),
        paymentStatus: formData.paymentStatus,
        forAccommodation: formData.forAccommodation
      };

      let res;
      if (isEdit) {
        res = await fetch(`http://localhost:5000/bookings/${encodeURIComponent(formData.bookingID)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ properties })
        });
      } else {
        res = await fetch("http://localhost:5000/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: formData.bookingID,
            type: "Booking",
            properties
          })
        });
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed with status ${res.status}`);
      }

      alert(isEdit ? "Booking updated successfully" : "Booking created successfully");
      navigate("/bookings");
    } catch (err) {
      console.error(err);
      alert("Error saving booking: " + (err.message || "Unknown error"));
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
      <h2>{isEdit ? "Edit Booking" : "New Booking"}</h2>

      {fetchError && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {fetchError}</div>}

      <form onSubmit={handleSubmit}>
        {/* Booking ID */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Booking ID *
          </label>
          <input
            name="bookingID"
            value={formData.bookingID}
            onChange={handleChange}
            disabled={isEdit}
            required
            placeholder="ex: BKG12345"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Booking Date */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Booking Date
          </label>
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Check-In */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Check-In Date
          </label>
          <input
            type="date"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Check-Out */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Check-Out Date
          </label>
          <input
            type="date"
            name="checkOutDate"
            value={formData.checkOutDate}
            onChange={handleChange}
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Total Price */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Total Price (€)
          </label>
          <input
            type="number"
            name="totalPrice"
            min="0"
            step="0.01"
            value={formData.totalPrice}
            onChange={handleChange}
            placeholder="ex: 450"
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>

        {/* Payment Status */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Payment Status
          </label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            style={{ width: "100%", padding: ".5rem", borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Accommodation */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: ".25rem", fontWeight: "bold" }}>
            Accommodation *
          </label>
          <input
            name="forAccommodation"
            value={formData.forAccommodation}
            onChange={handleChange}
            placeholder="ex: GreenValleyEcoLodge"
            required
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
            onClick={() => navigate("/bookings")}
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

export default BookingForm;
