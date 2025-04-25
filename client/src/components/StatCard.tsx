import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgColor = "bg-primary-100", 
  iconColor = "text-primary-600" 
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
        </div>
      </div>
    </div>
  );
}
