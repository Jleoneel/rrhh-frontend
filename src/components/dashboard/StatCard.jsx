export default function StatCard({ title, value, icon, color = "blue", description }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    yellow: "bg-yellow-50 text-yellow-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}