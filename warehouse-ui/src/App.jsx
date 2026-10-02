import { useState, useEffect } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState("");

  // Load all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch(`${API}/products/`);
    const data = await res.json();
    setProducts(data);
  }

  // Create a new product
  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API}/products/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.detail || "Something went wrong");
      return;
    }
    setName(""); setPrice(""); setStock("");
    fetchProducts();
  }

  // Update stock inline
  async function handleUpdateStock(id) {
    await fetch(`${API}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: parseInt(editStock) }),
    });
    setEditingId(null);
    fetchProducts();
  }

  // Delete a product
  async function handleDelete(id) {
    await fetch(`${API}/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
        Product Warehouse
      </h1>

      {/* Add product form */}
      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Price"
          type="number"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
          style={{ ...inputStyle, width: 100 }}
        />
        <input
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={e => setStock(e.target.value)}
          required
          style={{ ...inputStyle, width: 80 }}
        />
        <button type="submit" style={btnStyle}>Add product</button>
      </form>

      {error && (
        <div style={{ color: "#A32D2D", background: "#FCEBEB", padding: "8px 12px", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Product table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={tdStyle}>{p.id}</td>
              <td style={tdStyle}>{p.name}</td>
              <td style={tdStyle}>₹{p.price.toFixed(2)}</td>
              <td style={tdStyle}>
                {editingId === p.id ? (
                  <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="number"
                      value={editStock}
                      onChange={e => setEditStock(e.target.value)}
                      style={{ ...inputStyle, width: 70, padding: "4px 8px" }}
                      autoFocus
                    />
                    <button onClick={() => handleUpdateStock(p.id)} style={smallBtnStyle}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ ...smallBtnStyle, color: "#888" }}>✕</button>
                  </span>
                ) : (
                  <span
                    onClick={() => { setEditingId(p.id); setEditStock(p.stock); }}
                    style={{ cursor: "pointer", padding: "2px 6px", borderRadius: 4, background: "#f5f5f5" }}
                    title="Click to edit"
                  >
                    {p.stock}
                  </span>
                )}
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ ...smallBtnStyle, color: "#A32D2D", borderColor: "#F09595" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={5} style={{ padding: "20px 0", color: "#aaa", textAlign: "center" }}>No products yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = {
  padding: "8px 12px", borderRadius: 6,
  border: "1px solid #ddd", fontSize: 14,
  outline: "none", width: 160,
};
const btnStyle = {
  padding: "8px 16px", borderRadius: 6,
  border: "1px solid #ccc", background: "transparent",
  fontSize: 14, cursor: "pointer",
};
const smallBtnStyle = {
  padding: "3px 10px", borderRadius: 4,
  border: "1px solid #ddd", background: "transparent",
  fontSize: 12, cursor: "pointer",
};
const thStyle = { padding: "8px 12px", fontWeight: 500, color: "#666", fontSize: 12 };
const tdStyle = { padding: "10px 12px" };