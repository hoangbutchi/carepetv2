import { useState, useEffect } from 'react';
import { 
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { FiTrendingUp, FiFilter } from 'react-icons/fi';
import { statsAPI } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Spinner } from '../common/UI';

const RevenueChart = ({ role }) => {
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [period, setPeriod] = useState('month');
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [period, year]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await statsAPI.getRevenue({ period, year });
            setData(res.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Fallback mock data if API fails
            setData(getMockData(period));
        } finally {
            setLoading(false);
        }
    };

    const getMockData = (p) => {
        if (p === 'month') {
            return Array.from({ length: 12 }, (_, i) => ({
                label: language === 'en' ? `Month ${i + 1}` : `Tháng ${i + 1}`,
                value: Math.floor(Math.random() * 50000000) + 10000000
            }));
        }
        return [];
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value) + '₫';
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-lg shadow-xl border ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-100'}`}>
                    <p className="font-bold text-theme mb-1">{label}</p>
                    <p className="text-primary-400 font-semibold">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card-glass p-6 animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-theme flex items-center gap-2">
                        <FiTrendingUp className="text-green-400" />
                        {language === 'en' ? 'Revenue Analytics' : 'Phân tích doanh thu'}
                    </h2>
                    <p className="text-sm text-theme-secondary">
                        {language === 'en' ? 'Track your growth and performance' : 'Theo dõi mức độ tăng trưởng'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select 
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="input py-2 pl-3 pr-8 text-sm appearance-none"
                        >
                            <option value="month">{language === 'en' ? 'Monthly' : 'Theo tháng'}</option>
                            <option value="week">{language === 'en' ? 'Weekly' : 'Theo tuần'}</option>
                            <option value="day">{language === 'en' ? 'Daily' : 'Theo ngày'}</option>
                        </select>
                        <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary pointer-events-none" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-[350px] flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Bar Chart - Comparison */}
                    <div className="h-[350px] w-full">
                        <p className="text-sm font-medium text-theme-secondary mb-4">
                            {language === 'en' ? 'Revenue Comparison' : 'So sánh doanh thu'}
                        </p>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#00000010'} />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}Mđ` : val >= 1000 ? `${(val/1000).toFixed(0)}Kđ` : `${val}đ`}
                                    width={60}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="value" 
                                    fill="url(#colorValue)" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={period === 'month' ? 30 : 15}
                                />
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Area Chart - Trend */}
                    <div className="h-[350px] w-full">
                        <p className="text-sm font-medium text-theme-secondary mb-4">
                            {language === 'en' ? 'Growth Trend' : 'Xu hướng tăng trưởng'}
                        </p>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#00000010'} />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                                    tickFormatter={(val) => val >= 1000000 ? `${val/1000000}M` : val}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#3b82f6" 
                                    fillOpacity={1} 
                                    fill="url(#colorBlue)" 
                                    strokeWidth={3}
                                />
                                <defs>
                                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Data Table */}
                    <div className="lg:col-span-2 mt-8 overflow-hidden rounded-xl border border-theme">
                        <div className="p-4 bg-white/5 border-b border-theme flex justify-between items-center">
                            <h3 className="font-semibold text-theme">
                                {language === 'en' ? 'Revenue Details' : 'Chi tiết doanh thu'}
                            </h3>
                            <div className="text-right">
                                <p className="text-xs text-theme-secondary uppercase tracking-wider">
                                    {language === 'en' ? 'Total Period Revenue' : 'Tổng doanh thu giai đoạn'}
                                </p>
                                <p className="text-xl font-bold text-gradient">
                                    {formatCurrency(data.reduce((acc, curr) => acc + curr.value, 0))}
                                </p>
                            </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className={`sticky top-0 ${isDark ? 'bg-[#1e293b]' : 'bg-gray-50'} text-theme-secondary`}>
                                    <tr>
                                        <th className="p-4 font-medium">{language === 'en' ? 'Time Period' : 'Thời gian'}</th>
                                        <th className="p-4 font-medium text-right">{language === 'en' ? 'Revenue' : 'Doanh thu'}</th>
                                        <th className="p-4 font-medium text-right">{language === 'en' ? 'Share' : 'Tỷ trọng'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme">
                                    {data.map((item, index) => {
                                        const total = data.reduce((acc, curr) => acc + curr.value, 0);
                                        const share = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                                        return (
                                            <tr key={index} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                                                <td className="p-4 text-theme font-medium">{item.label}</td>
                                                <td className="p-4 text-right text-theme">{formatCurrency(item.value)}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-primary-500" 
                                                                style={{ width: `${share}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-theme-secondary w-8 text-right">{share}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenueChart;
