import React, { useState } from "react";
import axios from "axios";

const SearchBar = ({ setOffices }) => {
    const [zipCode, setZipCode] = useState("");
    const [radius, setRadius] = useState(5);

    const handleSearch = async () => {
        if (!zipCode) return alert("Enter a ZIP code");

        try {
            const response = await axios.post("http://findopendentist.onrender.com/search-offices", { zipCode, radius });
            setOffices(response.data);
        } catch (error) {
            console.error("Search error:", error);
            alert("No results found.");
        }
    };

    return (
        <div style={styles.container}>
            <input
                type="text"
                placeholder="Enter ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                style={styles.input}
            />
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} style={styles.select}>
                <option value={1}>1 Mile</option>
                <option value={5}>5 Miles</option>
                <option value={10}>10 Miles</option>
            </select>
            <button onClick={handleSearch} style={styles.button}>Search</button>
        </div>
    );
};

const styles = {
    container: { display: "flex", gap: "10px", marginBottom: "20px" },
    input: { padding: "8px", borderRadius: "5px", border: "1px solid #ccc" },
    select: { padding: "8px", borderRadius: "5px", border: "1px solid #ccc" },
    button: { padding: "8px 12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }
};

export default SearchBar;
