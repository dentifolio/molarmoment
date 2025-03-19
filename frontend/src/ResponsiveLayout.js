import React, { useState } from "react";

const ResponsiveLayout = () => {
    const [sidebarWidth, setSidebarWidth] = useState(250); // Initial sidebar width
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleResize = (e) => {
        setSidebarWidth(e.clientX); // Dynamically adjusts sidebar width
    };

    return (
        <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} h-screen flex`}>
            {/* Sidebar */}
            <div className="relative bg-gray-800 text-white p-4"
                style={{ width: `${sidebarWidth}px`, minWidth: "200px", maxWidth: "400px" }}>
                <h2 className="text-xl font-bold">Dashboard</h2>
                <ul className="mt-4">
                    <li className="p-2 hover:bg-gray-700 rounded">Home</li>
                    <li className="p-2 hover:bg-gray-700 rounded">Appointments</li>
                    <li className="p-2 hover:bg-gray-700 rounded">Settings</li>
                </ul>
                <button
                    className="mt-6 p-2 w-full bg-blue-500 hover:bg-blue-600 rounded"
                    onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>

                {/* Draggable Resizer */}
                <div
                    className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-gray-600"
                    onMouseDown={() => document.addEventListener("mousemove", handleResize)}
                    onMouseUp={() => document.removeEventListener("mousemove", handleResize)}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-semibold">Welcome to Your Dashboard</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Adjust the sidebar width, toggle dark mode, and enjoy a fully responsive layout!
                </p>

                {/* Example Content Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded shadow-md">📌 Feature 1</div>
                    <div className="p-4 bg-white rounded shadow-md">📌 Feature 2</div>
                    <div className="p-4 bg-white rounded shadow-md">📌 Feature 3</div>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveLayout;
