export default function DropCard({ drop, onReserve, isReserved }) {
  const purchasers = Array.isArray(drop.recentPurchasers) ? drop.recentPurchasers : [];
  return (
    <div className="border p-4 rounded shadow hover:shadow-lg transition bg-white">
      <h2 className="font-bold text-xl mb-2">{drop.name}</h2>
      <p className="text-gray-700">Price: <span className="font-semibold">${drop.price}</span></p>
      <p className={`text-lg font-bold ${drop.available_stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
        {drop.available_stock > 0 ? `${drop.available_stock} Available` : 'Sold Out'}
      </p>

      <div className="mt-4">
        <p className="text-sm text-gray-500 font-semibold">Recent Purchasers:</p>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          {purchasers.length > 0 ? (
            purchasers.map((p, i) => <li key={i}>{p}</li>)
          ) : (
            <li>No recent purchases</li>
          )}
        </ul>
      </div>

      <button
        className={`w-full mt-4 py-2 px-4 rounded font-bold text-white transition
            ${drop.available_stock <= 0 || isReserved
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'}`}
        onClick={() => onReserve(drop.id)}
        disabled={drop.available_stock <= 0 || isReserved}
      >
        {isReserved ? "Reserved" : (drop.available_stock <= 0 ? "Sold Out" : "Reserve")}
      </button>
    </div>
  );
}