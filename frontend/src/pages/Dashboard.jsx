import { useState, useEffect, useRef } from "react";
import DropCard from "../components/DropCard";
import CreateDropModal from "../components/CreateDropModal";
import { getDrops, reserveDrop, completePurchase } from "../services/api";
import { useSocket } from "../hooks/useSocket";

export default function Dashboard() {
  const [drops, setDrops] = useState([]);
  const [activeReservation, setActiveReservation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const user_id = 1; // Hardcoded for demo
  const timerRef = useRef(null);

  // Auto-Refresh Strategy (Replaces Socket.io for Vercel Stability)
  useEffect(() => {
    fetchDrops(); // Initial fetch

    // Poll every 2 seconds to keep data fresh across all devices
    const interval = setInterval(() => {
      fetchDrops();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const onStockUpdate = (data) => {
    console.log("Stock update received:", data);
    setDrops((prev) =>
      prev.map((d) =>
        d.id === parseInt(data.drop_id)
          ? { ...d, available_stock: data.available_stock }
          : d
      )
    );
  };

  const onPurchaseUpdate = (data) => {
    console.log("Purchase update received:", data);
    setDrops((prev) =>
      prev.map((d) =>
        d.id === parseInt(data.drop_id)
          ? {
            ...d,
            recentPurchasers: [
              data.user.username,
              ...(d.recentPurchasers || []),
            ].slice(0, 3), // Keep top 3
          }
          : d
      )
    );
  };

  // Hybrid Approach: Socket for "Assessment" + Polling for "Vercel Stability"
  useSocket(onStockUpdate, onPurchaseUpdate);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Limited Edition Sneaker Drop</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-bold"
        >
          + Create New Drop
        </button>
      </div>

      {showCreateModal && (
        <CreateDropModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDrops();
          }}
        />
      )}

      {activeReservation && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 fixed top-4 right-4 shadow-lg z-50 w-80">
          <p className="font-bold">Item Reserved!</p>
          <p>Time remaining: {timeLeft}s</p>
          <button
            onClick={onPurchase}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
          >
            Complete Purchase
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drops.map((drop) => (
          <DropCard
            key={drop.id}
            drop={drop}
            onReserve={onReserve}
            isReserved={activeReservation?.reservation.drop_id === drop.id}
          />
        ))}
      </div>
    </div>
  );
}
