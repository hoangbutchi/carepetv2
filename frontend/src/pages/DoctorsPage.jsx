import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiAward, FiBriefcase, FiMessageCircle, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import { useLanguage } from '../i18n/LanguageContext';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

// Placeholder images for doctors
const doctorImages = [
    'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg',
    'https://images.pexels.com/photos/14438787/pexels-photo-14438787.jpeg',
    'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg',
    'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg',
    'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg',
    'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg',
    'https://images.pexels.com/photos/15641080/pexels-photo-15641080.jpeg',
    'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg',
    'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg',
    'https://images.pexels.com/photos/32254667/pexels-photo-32254667.jpeg',
    'https://images.pexels.com/photos/19438566/pexels-photo-19438566.jpeg',
    'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg'
];

const specializations = {
    en: ['General Practice', 'Surgery', 'Dermatology', 'Dentistry', 'Internal Medicine', 'Cardiology'],
    vi: ['Khám tổng quát', 'Phẫu thuật', 'Da liễu', 'Nha khoa', 'Nội khoa', 'Tim mạch']
};

const DoctorsPage = () => {
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, [language]);

    const fetchDoctors = async () => {
        try {
            const response = await authAPI.getDoctors();
            let doctorsData = response.data.doctors || [];

            doctorsData = doctorsData.map((doc, index) => ({
                ...doc,
                avatar: doc.avatar || doctorImages[index % doctorImages.length],
                specialization: doc.specialization || specializations[language][index % specializations[language].length],
                experience: doc.experience || (5 + (index * 2)),
                bio: doc.bio || (language === 'en'
                    ? `Experienced veterinarian specializing in pet care with a passion for helping animals.`
                    : `Bác sĩ thú y giàu kinh nghiệm chuyên về chăm sóc thú cưng với niềm đam mê giúp đỡ động vật.`),
                certificates: doc.certificates?.length ? doc.certificates : [
                    { name: 'DVM', year: 2015 },
                    { name: 'Certified Pet Care', year: 2018 }
                ]
            }));

            setDoctors(doctorsData);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setDoctors([
                {
                    _id: '1',
                    name: 'Dr. Nguyễn Văn An',
                    avatar: doctorImages[0],
                    specialization: specializations[language][0],
                    experience: 10,
                    bio: language === 'en' ? 'Senior veterinarian with expertise in surgery and emergency care.' : 'Bác sĩ thú y cấp cao chuyên về phẫu thuật và cấp cứu.',
                    certificates: [{ name: 'DVM', year: 2012 }, { name: 'Surgery Specialist', year: 2015 }]
                },
                {
                    _id: '2',
                    name: 'Dr. Trần Thị Mai',
                    avatar: doctorImages[1],
                    specialization: specializations[language][1],
                    experience: 8,
                    bio: language === 'en' ? 'Passionate about pet wellness and preventive care.' : 'Đam mê sức khỏe thú cưng và chăm sóc phòng ngừa.',
                    certificates: [{ name: 'DVM', year: 2014 }, { name: 'Pet Nutrition', year: 2017 }]
                },
                {
                    _id: '3',
                    name: 'Dr. Lê Minh Hoàng',
                    avatar: doctorImages[2],
                    specialization: specializations[language][2],
                    experience: 12,
                    bio: language === 'en' ? 'Expert in exotic pets and dermatology conditions.' : 'Chuyên gia về thú cưng ngoại lai và các bệnh da liễu.',
                    certificates: [{ name: 'DVM', year: 2010 }, { name: 'Dermatology', year: 2014 }]
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-theme pt-24 pb-12 transition-colors duration-300 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Light mode gradient */}
                {!isDark && <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 opacity-70"></div>}
                {/* Dark mode gradient */}
                {isDark && <div className="absolute inset-0 bg-gradient-to-br from-dark-300 via-dark-200 to-indigo-900/10 opacity-80"></div>}

                {/* Decorative Background Pet Icons */}
                <div className={`absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay ${isDark ? 'opacity-60' : 'opacity-40'}`}>
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-20 right-[15%] w-24 h-24 rounded-full object-cover transform rotate-45 animate-float shadow-lg" />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-40 left-[10%] w-28 h-28 rounded-full object-cover transform -rotate-12 animate-float shadow-lg" style={{ animationDelay: '1s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/3 left-[20%] w-20 h-20 rounded-full object-cover transform -rotate-45 animate-float shadow-lg" style={{ animationDelay: '2s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-1/2 right-[10%] w-32 h-32 rounded-full object-cover transform -rotate-15 animate-float shadow-lg flex" style={{ animationDelay: '3s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute -bottom-10 right-[35%] w-16 h-16 rounded-full object-cover transform rotate-180 animate-float shadow-lg" style={{ animationDelay: '1.5s' }} />
                </div>
            </div>

            <div className="container-custom relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                    <span className="badge-primary mb-4">{language === 'en' ? 'Our Team' : 'Đội ngũ'}</span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1e293b] mb-4">
                        {language === 'en' ? 'Expert Veterinarians' : 'Đội Ngũ Bác Sĩ Chuyên Nghiệp'}
                    </h1>
                    <p className="text-xl text-gray-400">
                        {language === 'en'
                            ? 'Meet our experienced veterinarians dedicated to caring for your beloved pets'
                            : 'Gặp gỡ đội ngũ bác sĩ thú y giàu kinh nghiệm tận tâm chăm sóc thú cưng của bạn'
                        }
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 animate-fade-in-up delay-100">
                    {[
                        { value: '50+', label: language === 'en' ? 'Expert Vets' : 'Bác sĩ', icon: '👨‍⚕️' },
                        { value: '10K+', label: language === 'en' ? 'Happy Pets' : 'Thú cưng', icon: '🐕' },
                        { value: '8+', label: language === 'en' ? 'Years Experience' : 'Năm kinh nghiệm', icon: '🏆' },
                        { value: '24/7', label: language === 'en' ? 'Available' : 'Sẵn sàng', icon: '🕐' },
                    ].map((stat, index) => (
                        <div key={index} className="card-glass p-6 text-center">
                            <span className="text-3xl mb-2 block">{stat.icon}</span>
                            <p className="stats-number text-2xl md:text-3xl">{stat.value}</p>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Doctors Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card p-0">
                                <div className="skeleton h-64" />
                                <div className="p-6">
                                    <div className="skeleton h-6 w-3/4 mb-2" />
                                    <div className="skeleton h-4 w-1/2 mb-4" />
                                    <div className="skeleton h-20 mb-4" />
                                    <div className="flex gap-2">
                                        <div className="skeleton h-10 flex-1" />
                                        <div className="skeleton h-10 flex-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map((doctor, index) => (
                            <div
                                key={doctor._id}
                                className="card overflow-hidden group animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={doctor.avatar}
                                        alt={doctor.name}
                                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=400&background=06b6d4&color=fff`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-dark-300/50 to-transparent" />

                                    {/* Overlay content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-xl font-bold text-[#1e293b] mb-1">{doctor.name}</h3>
                                        <p className="text-primary-400 font-medium">{doctor.specialization}</p>
                                    </div>

                                    {/* Rating badge */}
                                    <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1.5 rounded-full glass">
                                        <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-medium text-[#1e293b]">4.9</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <FiBriefcase className="w-4 h-4 text-primary-400" />
                                            <span className="text-sm">
                                                {doctor.experience} {language === 'en' ? 'years' : 'năm'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <FiClock className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-green-400">
                                                {language === 'en' ? 'Available' : 'Có mặt'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {doctor.bio}
                                    </p>

                                    {/* Certificates */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {doctor.certificates?.slice(0, 2).map((cert, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-2.5 py-1 bg-primary-500/10 text-primary-400 text-xs rounded-lg border border-primary-500/20"
                                            >
                                                <FiAward className="w-3 h-3 mr-1" />
                                                {cert.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Link
                                            to={`/booking?staff=${doctor._id}`}
                                            className="btn-primary flex-1 justify-center text-sm"
                                        >
                                            <FiCalendar className="mr-2" />
                                            {language === 'en' ? 'Book Now' : 'Đặt lịch'}
                                        </Link>
                                        <Link
                                            to={`/chat?doctor=${doctor._id}`}
                                            className="btn-glass flex-1 justify-center text-sm"
                                        >
                                            <FiMessageCircle className="mr-2" />
                                            {language === 'en' ? 'Chat' : 'Tư vấn'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA Section */}
                <div className="mt-20 animate-fade-in-up">
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Background */}
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-10"
                            style={{ backgroundImage: 'url("https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg")' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 via-secondary-900/40 to-accent-900/40 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-dark-500/20" />

                        <div className="relative p-8 md:p-16 text-center">
                            <span className="text-5xl mb-4 block">💬</span>
                            <h2 className="text-2xl md:text-4xl font-display font-bold text-[#1e293b] mb-4">
                                {language === 'en'
                                    ? 'Need Expert Consultation?'
                                    : 'Cần tư vấn chuyên gia?'
                                }
                            </h2>
                            <p className="text-lg text-[#1e293b]/80 mb-8 max-w-2xl mx-auto">
                                {language === 'en'
                                    ? 'Our doctors are available 24/7 for online consultation. Get expert advice for your pet today!'
                                    : 'Đội ngũ bác sĩ của chúng tôi sẵn sàng tư vấn trực tuyến 24/7. Nhận lời khuyên chuyên gia cho thú cưng ngay!'
                                }
                            </p>
                            <Link
                                to="/chat"
                                className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:-translate-y-1"
                            >
                                <FiMessageCircle className="mr-2 w-5 h-5" />
                                {language === 'en' ? 'Start Consultation' : 'Bắt đầu tư vấn'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorsPage;
