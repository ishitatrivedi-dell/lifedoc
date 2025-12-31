import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface HealthSparklineProps {
    data: any[];
    dataKey: string;
    color: string;
    label: string;
    unit: string;
    latestValue: string | number;
}

const HealthSparkline: React.FC<HealthSparklineProps> = ({ data, dataKey, color, label, unit, latestValue }) => {
    return (
        <div className="flex flex-col bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
                <span className="text-sm font-bold text-gray-900">{latestValue} <span className="text-xs text-gray-400 font-normal">{unit}</span></span>
            </div>
            <div className="h-20 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.length > 0 ? data : [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }]}>
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={data.length > 0 ? color : "#e5e7eb"} // Gray for empty
                            strokeWidth={3}
                            dot={{ r: 3, strokeWidth: 1 }}
                            activeDot={{ r: 5 }}
                            strokeDasharray={data.length > 0 ? "" : "3 3"} // Dashed for empty
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {data.length === 0 && <div className="text-[9px] text-gray-300 text-center -mt-2 relative z-10">No recent data</div>}
        </div>
    );
};

export default HealthSparkline;
