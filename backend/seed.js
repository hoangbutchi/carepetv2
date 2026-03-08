const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load models
const User = require('./models/User');
const Pet = require('./models/Pet');
const Product = require('./models/Product');
const Appointment = require('./models/Appointment');
const News = require('./models/News');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Pet.deleteMany({});
        await Product.deleteMany({});
        await Appointment.deleteMany({});
        await News.deleteMany({});

        // Create Users
        console.log('Creating users...');
        // Note: Don't hash password here - User model pre-save hook will handle it
        const plainPassword = '123456';

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@petcare.com',
            password: plainPassword,
            role: 'admin',
            phone: '0901234567',
            address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
            specialization: 'Quản lý hệ thống',
            experience: 10,
            bio: 'Quản trị viên hệ thống Pet Care Pro'
        });

        const doctor1 = await User.create({
            name: 'BS. Nguyễn Văn An',
            email: 'doctor1@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234568',
            address: '456 Đường Lê Lợi, Quận 1, TP.HCM',
            specialization: 'Nội khoa thú cưng',
            experience: 8,
            bio: 'Chuyên gia về nội khoa và chẩn đoán bệnh cho chó mèo',
            avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop'
        });

        const doctor2 = await User.create({
            name: 'BS. Trần Thị Bình',
            email: 'doctor2@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234569',
            address: '789 Đường Hai Bà Trưng, Quận 3, TP.HCM',
            specialization: 'Phẫu thuật thú cưng',
            experience: 12,
            bio: 'Chuyên gia phẫu thuật và chăm sóc sau phẫu thuật',
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop'
        });

        const doctor3 = await User.create({
            name: 'BS. Lê Minh Hoàng',
            email: 'doctor3@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234570',
            address: '101 Đường Cộng Hòa, Tân Bình, TP.HCM',
            specialization: 'Da liễu thú cưng',
            experience: 6,
            bio: 'Chuyên gia về các bệnh ngoài da và nấm rụng lông chi tiết ở thú cưng',
            avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop'
        });

        const doctor4 = await User.create({
            name: 'BS. Phạm Thị Dung',
            email: 'doctor4@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234571',
            address: '22 Thảo Điền, Quận 2, TP.HCM',
            specialization: 'Nha khoa thú cưng',
            experience: 9,
            bio: 'Chăm sóc răng miệng và làm sạch cao răng với kỹ thuật cao',
            avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop'
        });

        const doctor5 = await User.create({
            name: 'BS. Vũ Đức Khang',
            email: 'doctor5@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234572',
            address: '89 Phan Đăng Lưu, Phú Nhuận, TP.HCM',
            specialization: 'Cấp cứu & Hồi sức',
            experience: 15,
            bio: 'Giàu kinh nghiệm xử lý các ca cấp cứu và điều trị tích cực',
            avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop'
        });

        const doctor6 = await User.create({
            name: 'BS. Hồ Thanh Trúc',
            email: 'doctor6@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234573',
            address: '45 Lê Duẩn, Quận 1, TP.HCM',
            specialization: 'Dinh dưỡng & Tiêm phòng',
            experience: 5,
            bio: 'Tư vấn chế độ dinh dưỡng và lịch tiêm phòng khoa học cho từng giống thú cưng',
            avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop'
        });

        const doctor7 = await User.create({
            name: 'BS. Lê Thị Tú Anh',
            email: 'doctor7@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234574',
            address: '15 Nguyễn Ảnh Thủ, Hóc Môn, TP.HCM',
            specialization: 'Chăm sóc răng miệng',
            experience: 4,
            bio: 'Tư vấn nhiệt tình và tận tâm đối với sức khỏe vòm miệng của thú cưng',
            avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop'
        });

        const doctor8 = await User.create({
            name: 'BS. Ngô Minh Nhật',
            email: 'doctor8@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234575',
            address: '22 Trần Não, Quận 2, TP.HCM',
            specialization: 'Khám tổng quát',
            experience: 7,
            bio: 'Có nhiều năm kinh nghiệm khám bệnh và kê đơn thuốc an toàn',
            avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop'
        });

        const doctor9 = await User.create({
            name: 'BS. Trần Phúc',
            email: 'doctor9@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234576',
            address: '8B Điện Biên Phủ, Bình Thạnh, TP.HCM',
            specialization: 'Xét nghiệm thú y',
            experience: 11,
            bio: 'Chuyên khoa về các vấn đề nội tiết tố và xét nghiệm máu',
            avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop'
        });

        const doctor10 = await User.create({
            name: 'BS. Đào Thu Hương',
            email: 'doctor10@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234577',
            address: '77 Nguyễn Văn Cừ, Quận 5, TP.HCM',
            specialization: 'Nhãn khoa thú cưng',
            experience: 8,
            bio: 'Phục hồi và phẫu thuật các vấn đề nghiêm trọng ở mắt',
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop'
        });

        const doctor11 = await User.create({
            name: 'BS. Lương Tuấn Anh',
            email: 'doctor11@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234578',
            address: '9 Lãnh Binh Thăng, Quận 11, TP.HCM',
            specialization: 'Thú y chim cảnh',
            experience: 6,
            bio: 'Chăm sóc và điều trị chuyên biệt cho các dòng chim và vẹt',
            avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop'
        });

        const doctor12 = await User.create({
            name: 'BS. Nguyễn Bảo Ngọc',
            email: 'doctor12@petcare.com',
            password: plainPassword,
            role: 'staff',
            phone: '0901234579',
            address: '40 Hoàng Hoa Thám, Tân Bình, TP.HCM',
            specialization: 'Tai mũi họng',
            experience: 5,
            bio: 'Điều trị tận gốc các bệnh viêm nhiễm tai và các chứng ho sổ mũi',
            avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop'
        });

        const customer1 = await User.create({
            name: 'Nguyễn Minh Châu',
            email: 'customer1@gmail.com',
            password: plainPassword,
            role: 'customer',
            phone: '0909876543',
            address: '101 Đường CMT8, Quận 10, TP.HCM'
        });

        const customer2 = await User.create({
            name: 'Lê Hoàng Dũng',
            email: 'customer2@gmail.com',
            password: plainPassword,
            role: 'customer',
            phone: '0909876544',
            address: '202 Đường Cộng Hòa, Tân Bình, TP.HCM'
        });

        console.log('Users created!');

        // Create Pets
        console.log('Creating pets...');
        const pet1 = await Pet.create({
            owner: customer1._id,
            name: 'Lucky',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            weight: 28,
            gender: 'male',
            avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
            medicalHistory: [
                {
                    date: new Date('2025-12-15'),
                    type: 'vaccination',
                    description: 'Tiêm vaccine 5 bệnh',
                    veterinarian: 'BS. Nguyễn Văn An',
                    nextDueDate: new Date('2026-12-15')
                }
            ]
        });

        const pet2 = await Pet.create({
            owner: customer1._id,
            name: 'Miu',
            species: 'cat',
            breed: 'British Shorthair',
            age: 2,
            weight: 4.5,
            gender: 'female',
            avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop'
        });

        const pet3 = await Pet.create({
            owner: customer2._id,
            name: 'Buddy',
            species: 'dog',
            breed: 'Labrador',
            age: 5,
            weight: 32,
            gender: 'male',
            avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'
        });

        console.log('Pets created!');

        // Create Products
        console.log('Creating products...');
        const products = await Product.insertMany([
            {
                name: 'Thức ăn hạt cho chó Poodle trưởng thành 1.5kg',
                description: 'Thức ăn hạt dòng Poodle Adult cao cấp, kích thước hạt nhỏ dễ nhai.',
                price: 250000,
                originalPrice: 280000,
                category: 'food',
                stock: 45,
                isFeatured: true,
                images: ['https://loremflickr.com/400/400/dog,food,bowl?lock=1']
            },
            {
                name: 'Pate hỗn hợp cá mòi và cá ngừ cho mèo',
                description: 'Pate thịt thật mềm mịn, không độn tinh bột, dưỡng lông mượt mà.',
                price: 25000,
                category: 'food',
                stock: 120,
                images: ['https://loremflickr.com/400/400/cat,food,bowl?lock=2']
            },
            {
                name: 'Sữa bột bổ sung dinh dưỡng cho chó mèo sơ sinh',
                description: 'Công thức gần giống sữa mẹ, dễ tiêu hoá cho thú cưng dưới 1 tháng tuổi.',
                price: 180000,
                category: 'food',
                stock: 30,
                images: ['https://loremflickr.com/400/400/puppy,milk,bottle?lock=3']
            },
            {
                name: 'Vòng cổ da bò có khắc tên cho chó lớn',
                description: 'Da thật 100%, đinh tán chắc chắn, kèm dịch vụ khắc tên và số điện thoại.',
                price: 195000,
                category: 'accessory',
                stock: 25,
                isFeatured: true,
                images: ['https://loremflickr.com/400/400/dog,collar,leather?lock=4']
            },
            {
                name: 'Balo phi hành gia vận chuyển thú cưng',
                description: 'Balo mặt kính trong suốt, có lỗ thông hơi siêu thoáng mát.',
                price: 320000,
                originalPrice: 400000,
                category: 'accessory',
                stock: 15,
                images: ['https://loremflickr.com/400/400/cat,carrier,backpack?lock=5']
            },
            {
                name: 'Giường nệm oval lót lông cừu ấm áp',
                description: 'Nệm gòn dày dặn, có thể tháo rời vỏ để giặt giũ dễ dàng.',
                price: 260000,
                category: 'accessory',
                stock: 40,
                images: ['https://loremflickr.com/400/400/dog,bed,sleeping?lock=6']
            },
            {
                name: 'Nhà cây cào móng 3 tầng có võng cho mèo',
                description: 'Trụ cào móng bọc dây thừng gai, kết hợp võng nghỉ ngơi thoải mái.',
                price: 680000,
                originalPrice: 850000,
                category: 'accessory',
                stock: 10,
                isFeatured: true,
                images: ['https://loremflickr.com/400/400/cat,tree,scratch?lock=7']
            },
            {
                name: 'Đồ chơi cần câu mèo lông vũ gắn chuông',
                description: 'Cần câu dẻo dai kèm lông vũ và chuông bạc thu hút sự chú ý của mèo.',
                price: 45000,
                category: 'toy',
                stock: 80,
                images: ['https://loremflickr.com/400/400/cat,toy,feather?lock=8']
            },
            {
                name: 'Đồ chơi xương gặm cao su sạch răng chó',
                description: 'Xương cao su TPR siêu bền, có gai massage nướu và làm sạch mảng bám.',
                price: 85000,
                category: 'toy',
                stock: 60,
                isFeatured: true,
                images: ['https://loremflickr.com/400/400/bone,toy,dog?lock=9']
            },
            {
                name: 'Sữa tắm khử mùi chuyên dụng cho chó',
                description: 'Hương thơm dễ chịu lưu hương lâu, công thức dịu nhẹ làm mượt lông.',
                price: 150000,
                category: 'hygiene',
                stock: 35,
                images: ['https://loremflickr.com/400/400/dog,bath,shampoo?lock=10']
            },
            {
                name: 'Cát vệ sinh đất sét vón cục mạnh cho mèo 8L',
                description: 'Vón cục tức thì, khử mùi cực tốt với hương cà phê khử khuẩn.',
                price: 110000,
                category: 'hygiene',
                stock: 150,
                isFeatured: true,
                images: ['https://loremflickr.com/400/400/cat,litter,sand?lock=11']
            },
            {
                name: 'Lược chải lông rụng giảm gãy rụng tới 90%',
                description: 'Thiết kế thông minh loại bỏ lông tơ và lông chết một cách dễ dàng.',
                price: 140000,
                category: 'hygiene',
                stock: 50,
                images: ['https://loremflickr.com/400/400/dog,brush,grooming?lock=12']
            },
            {
                name: 'Bỉm tã lót siêu thấm hút size M (Bịch 10 miếng)',
                description: 'Bỉm mặc chống tràn dành cho chó đi dạo hoặc trong kỳ salo.',
                price: 90000,
                category: 'hygiene',
                stock: 80,
                images: ['https://loremflickr.com/400/400/puppy,diaper?lock=13']
            },
            {
                name: 'Thuốc nhỏ gáy đặc trị ve, rận rệp cho chó 10-20kg',
                description: 'Một tuýp hiệu quả kéo dài 30 ngày, an toàn khuếch tán qua da.',
                price: 185000,
                category: 'medicine',
                stock: 25,
                images: ['https://loremflickr.com/400/400/dog,flea,medicine?lock=14']
            },
            {
                name: 'Gel uống tiêu búi lông cho mèo',
                description: 'Gel bôi trơn hệ tiêu hoá, ngăn chặn tắc ruột do búi lông.',
                price: 160000,
                category: 'medicine',
                stock: 45,
                isFeatured: true,
                images: ['https://loremflickr.com/400/400/cat,medicine?lock=15']
            },
            {
                name: 'Khay vệ sinh có thành cao cho mèo lớn',
                description: 'Thành cao chống văng cát hiệu quả, kèm khay hứng cát rơi dãi.',
                price: 210000,
                originalPrice: 250000,
                category: 'hygiene',
                stock: 20,
                images: ['https://loremflickr.com/400/400/cat,litter,box?lock=16']
            }
        ]);

        console.log('Products created!');

        // Create Appointments
        console.log('Creating appointments...');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await Appointment.insertMany([
            {
                customer: customer1._id,
                pet: pet1._id,
                staff: doctor1._id,
                service: 'checkup',
                date: today,
                timeSlot: '09:00-10:00',
                status: 'confirmed',
                notes: 'Khám sức khỏe định kỳ'
            },
            {
                customer: customer1._id,
                pet: pet2._id,
                staff: doctor2._id,
                service: 'vaccination',
                date: today,
                timeSlot: '14:00-15:00',
                status: 'pending',
                notes: 'Tiêm vaccine cho mèo'
            },
            {
                customer: customer2._id,
                pet: pet3._id,
                staff: doctor1._id,
                service: 'grooming',
                date: tomorrow,
                timeSlot: '10:00-11:00',
                status: 'pending',
                notes: 'Tắm và cắt tỉa lông'
            }
        ]);

        console.log('Appointments created!');

        // Create News Articles
        console.log('Creating news articles...');
        await News.insertMany([
            {
                title: 'Cách chăm sóc thú cưng mùa đông',
                content: 'Mùa đông là thời điểm thú cưng cần được chăm sóc đặc biệt. Hãy đảm bảo chúng có chỗ ở ấm áp, chế độ ăn uống đầy đủ dinh dưỡng và được vận động hợp lý. Tránh để thú cưng ra ngoài quá lâu trong thời tiết lạnh.',
                summary: 'Những tips hữu ích giúp thú cưng của bạn khỏe mạnh trong mùa lạnh',
                image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop',
                author: doctor1._id,
                category: 'care',
                status: 'approved',
                isPublished: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                views: 1250
            },
            {
                title: 'Chế độ dinh dưỡng cho chó con',
                content: 'Chó con cần được cho ăn thức ăn chuyên dụng với hàm lượng protein và canxi cao để phát triển xương và cơ bắp. Nên cho ăn 3-4 bữa nhỏ mỗi ngày và luôn có nước sạch.',
                summary: 'Hướng dẫn chi tiết về chế độ ăn uống phù hợp cho chó con',
                image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&h=400&fit=crop',
                author: doctor2._id,
                category: 'nutrition',
                status: 'approved',
                isPublished: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                views: 890
            },
            {
                title: 'Phòng ngừa bệnh cho mèo',
                content: 'Để mèo luôn khỏe mạnh, cần tiêm vaccine định kỳ, tẩy giun thường xuyên và giữ môi trường sống sạch sẽ. Nếu mèo có dấu hiệu bất thường, hãy đưa đến bác sĩ thú y ngay.',
                summary: 'Các bệnh thường gặp ở mèo và cách phòng ngừa hiệu quả',
                image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=400&fit=crop',
                author: doctor1._id,
                category: 'health',
                status: 'approved',
                isPublished: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                views: 2100
            },
            {
                title: 'Huấn luyện chó cơ bản',
                content: 'Huấn luyện chó nên bắt đầu từ khi còn nhỏ với các lệnh cơ bản như ngồi, nằm, đứng yên. Sử dụng phương pháp khen thưởng tích cực và kiên nhẫn trong quá trình huấn luyện.',
                summary: 'Các kỹ thuật huấn luyện chó cơ bản cho người mới nuôi',
                image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=400&fit=crop',
                author: doctor2._id,
                category: 'training',
                status: 'approved',
                isPublished: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                views: 1560
            },
            {
                title: 'Khai trương chi nhánh mới tại Quận 7',
                content: 'Pet Care Pro vui mừng thông báo khai trương chi nhánh mới tại Quận 7 với đầy đủ dịch vụ khám chữa bệnh, spa và shop. Chương trình ưu đãi 20% cho 100 khách hàng đầu tiên.',
                summary: 'Pet Care Pro khai trương chi nhánh mới với nhiều ưu đãi',
                image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=400&fit=crop',
                author: admin._id,
                category: 'news',
                status: 'approved',
                isPublished: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                views: 3200
            }
        ]);

        console.log('News articles created!');

        console.log('\n========================================');
        console.log('✅ Seed data created successfully!');
        console.log('========================================');
        console.log('\n📧 Tài khoản đăng nhập:');
        console.log('  Admin: admin@petcare.com / 123456');
        console.log('  Bác sĩ 1: doctor1@petcare.com / 123456');
        console.log('  Bác sĩ 2: doctor2@petcare.com / 123456');
        console.log('  Bác sĩ 3: doctor3@petcare.com / 123456');
        console.log('  Bác sĩ 4: doctor4@petcare.com / 123456');
        console.log('  Bác sĩ 5: doctor5@petcare.com / 123456');
        console.log('  Bác sĩ 6: doctor6@petcare.com / 123456');
        console.log('  Bác sĩ 7: doctor7@petcare.com / 123456');
        console.log('  Bác sĩ 8: doctor8@petcare.com / 123456');
        console.log('  Bác sĩ 9: doctor9@petcare.com / 123456');
        console.log('  Bác sĩ 10: doctor10@petcare.com / 123456');
        console.log('  Bác sĩ 11: doctor11@petcare.com / 123456');
        console.log('  Bác sĩ 12: doctor12@petcare.com / 123456');
        console.log('  Khách hàng 1: customer1@gmail.com / 123456');
        console.log('  Khách hàng 2: customer2@gmail.com / 123456');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
