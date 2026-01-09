import { useState } from "react";
import { createDrop } from "../services/api";

export default function CreateDropModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        total_stock: "",
        starts_at: new Date().toISOString().slice(0, 16), // Default to now
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createDrop(formData);
            alert("Drop Created Successfully!");
            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to create drop");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                <h2 className="text-xl font-bold mb-4">Create New Drop</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Item Name</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Price ($)</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Total Stock</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            required
                            value={formData.total_stock}
                            onChange={(e) => setFormData({ ...formData, total_stock: e.target.value })}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Start Time</label>
                        <input
                            type="datetime-local"
                            className="w-full border p-2 rounded"
                            required
                            value={formData.starts_at}
                            onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Drop"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
