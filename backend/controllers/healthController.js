const HealthRecord = require('../models/HealthRecord');
const Pet = require('../models/Pet');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const QRCode = require('qrcode');

// @desc    Get health records for a pet
// @route   GET /api/health/:petId
// @access  Private
exports.getPetHealthHistory = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.petId);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Check ownership (unless admin/staff)
        if (req.user.role === 'customer' && pet.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this pet health data'
            });
        }

        const healthRecords = await HealthRecord.find({ pet: req.params.petId })
            .sort({ checkupDate: 1 });

        res.status(200).json({
            success: true,
            count: healthRecords.length,
            data: healthRecords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create health record
// @route   POST /api/health
// @access  Private
exports.createHealthRecord = async (req, res) => {
    try {
        const { petId, weight, checkupDate, vaccines, notes, vetName } = req.body;

        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Only owner, staff, or admin can add health records
        if (req.user.role === 'customer' && pet.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const healthRecord = await HealthRecord.create({
            pet: petId,
            weight,
            checkupDate: checkupDate || Date.now(),
            vaccines: vaccines || [],
            notes,
            vetName
        });

        // Optionally update pet's weight in Pet model
        if (weight) {
            pet.weight = weight;
            await pet.save();
        }

        res.status(201).json({
            success: true,
            data: healthRecord
        });
    } catch (error) {
        console.error('Create Health Record Error:', error.stack || error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Export health PDF
// @route   GET /api/health/export-pdf/:petId
// @access  Private
exports.exportHealthPDF = async (req, res) => {
    try {
        const petId = req.params.petId;
        const pet = await Pet.findById(petId).populate('owner', 'name email phone');

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Check ownership
        if (req.user.role === 'customer' && pet.owner._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const healthRecords = await HealthRecord.find({ pet: petId }).sort({ checkupDate: -1 });

        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4',
            info: {
                Title: `CarePet Health Report - ${pet.name}`,
                Author: 'CarePet System'
            }
        });

        let filename = `HealthReport_${pet.name}_${moment().format('YYYYMMDD')}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        // --- COLORS & STYLES ---
        const BRAND_COLOR = '#FF6B6B';
        const TEAL_COLOR = '#4ECDC4';
        const TEXT_DARK = '#2d3436';
        const TEXT_LIGHT = '#636e72';
        const BORDER_COLOR = '#dfe6e9';

        // --- FONTS ---
        const fontPath = 'C:\\Windows\\Fonts\\arial.ttf';
        const fontBoldPath = 'C:\\Windows\\Fonts\\arialbd.ttf';
        
        // --- HEADER ---
        // Brand logo (Text style)
        doc.fillColor(BRAND_COLOR).fontSize(24).font(fontBoldPath).text('CarePet', 50, 45);
        doc.fillColor(TEXT_LIGHT).fontSize(10).font(fontPath).text('CHĂM SÓC TỪ TRÁI TIM', 50, 72);
        
        doc.fillColor(TEXT_DARK).fontSize(16).text('CAREPET HEALTH REPORT', { align: 'right' });
        doc.fontSize(10).text(`Issued on: ${moment().format('DD/MM/YYYY HH:mm')}`, { align: 'right' });

        // Horizontal Line
        doc.moveTo(50, 100).lineTo(545, 100).strokeColor(BRAND_COLOR).lineWidth(2).stroke();
        doc.moveDown(2);

        // --- PET & OWNER INFORMATION ---
        doc.fillColor(BRAND_COLOR).fontSize(14).font(fontBoldPath).text('PET INFORMATION', 50, 120);
        doc.moveDown(0.5);

        const infoY = 140;
        doc.fillColor(TEXT_DARK).fontSize(10).font(fontBoldPath).text('Pet Name:', 50, infoY);
        doc.font(fontPath).text(pet.name, 120, infoY);
        
        doc.font(fontBoldPath).text('Species:', 50, infoY + 20);
        doc.font(fontPath).text(pet.species.toUpperCase(), 120, infoY + 20);

        doc.font(fontBoldPath).text('Breed:', 50, infoY + 40);
        doc.font(fontPath).text(pet.breed || 'Updating...', 120, infoY + 40);

        const ageText = (pet.age !== null && pet.age !== undefined) ? `${pet.age} years` : 'Updating...';
        doc.font(fontBoldPath).text('Age:', 300, infoY);
        doc.font(fontPath).text(ageText, 370, infoY);

        doc.font(fontBoldPath).text('Weight:', 300, infoY + 20);
        doc.font(fontPath).text(`${pet.weight || '--'} kg`, 370, infoY + 20);

        doc.font(fontBoldPath).text('Owner:', 300, infoY + 40);
        doc.font(fontPath).text(pet.owner.name, 370, infoY + 40);

        doc.moveDown(4);

        // --- VACCINATION TABLE ---
        doc.fillColor(BRAND_COLOR).fontSize(14).font(fontBoldPath).text('VACCINATION HISTORY');
        doc.moveDown(1);

        const tableTop = doc.y;
        const colWidths = [150, 100, 100, 145];
        const tableHeaders = ['Vaccine Name', 'Admin. Date', 'Next Due', 'Veterinarian'];

        // Table Header Background
        doc.rect(50, tableTop - 5, 495, 20).fill(BRAND_COLOR);
        doc.fillColor('#FFFFFF').fontSize(10).font(fontBoldPath);
        
        let headerX = 55;
        tableHeaders.forEach((header, i) => {
            doc.text(header, headerX, tableTop);
            headerX += colWidths[i];
        });

        // Table Rows
        doc.fillColor(TEXT_DARK).font(fontPath);
        let currentY = tableTop + 20;

        const allVaccines = [];
        healthRecords.forEach(record => {
            record.vaccines.forEach(v => {
                allVaccines.push({
                    name: v.name,
                    date: moment(v.dateAdministered).format('DD/MM/YYYY'),
                    next: v.nextDueDate ? moment(v.nextDueDate).format('DD/MM/YYYY') : 'N/A',
                    vet: record.vetName || 'N/A'
                });
            });
        });

        if (allVaccines.length > 0) {
            allVaccines.sort((a, b) => moment(b.date, 'DD/MM/YYYY') - moment(a.date, 'DD/MM/YYYY'));
            allVaccines.slice(0, 8).forEach(v => {
                let rowX = 55;
                doc.text(v.name, rowX, currentY);
                doc.text(v.date, rowX + colWidths[0], currentY);
                doc.text(v.next, rowX + colWidths[0] + colWidths[1], currentY);
                doc.text(v.vet, rowX + colWidths[0] + colWidths[1] + colWidths[2], currentY);
                
                doc.moveTo(50, currentY + 12).lineTo(545, currentY + 12).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
                currentY += 20;
            });
        } else {
            doc.font(fontPath).text('No vaccination records found.', 55, currentY);
            currentY += 20;
        }

        doc.y = currentY + 15;

        // --- CHECKUP LOG TABLE ---
        doc.fillColor(BRAND_COLOR).fontSize(14).font(fontBoldPath).text('CLINICAL CHECKUPS');
        doc.moveDown(1);

        const checkupTop = doc.y;
        const checkupHeaders = ['Date', 'Weight', 'Notes & Diagnosis'];
        const checkupWidths = [100, 80, 315];

        doc.rect(50, checkupTop - 5, 495, 20).fill(TEAL_COLOR);
        doc.fillColor('#FFFFFF').fontSize(10).font(fontBoldPath);
        
        let cHeaderX = 55;
        checkupHeaders.forEach((header, i) => {
            doc.text(header, cHeaderX, checkupTop);
            cHeaderX += checkupWidths[i];
        });

        doc.fillColor(TEXT_DARK).font(fontPath);
        let cCurrentY = checkupTop + 20;

        healthRecords.slice(0, 5).forEach(record => {
            let rowX = 55;
            doc.text(moment(record.checkupDate).format('DD/MM/YYYY'), rowX, cCurrentY);
            doc.text(`${record.weight} kg`, rowX + checkupWidths[0], cCurrentY);
            doc.text(record.notes || '--', rowX + checkupWidths[0] + checkupWidths[1], cCurrentY, { width: checkupWidths[2] - 10 });
            
            const noteHeight = doc.heightOfString(record.notes || '--', { width: checkupWidths[2] - 10 });
            const rowHeight = Math.max(20, noteHeight + 5);
            
            doc.moveTo(50, cCurrentY + rowHeight - 8).lineTo(545, cCurrentY + rowHeight - 8).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
            cCurrentY += rowHeight;
        });

        // --- FOOTER & QR CODE ---
        const footerY = 750;
        doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
        
        doc.fillColor(TEXT_LIGHT).fontSize(8).font(fontPath);
        doc.text('CarePet Pet Management System v2.0', 50, footerY);
        doc.text('Hotline: 0123 456 789 | Email: contact@carepet.vn', 50, footerY + 12);
        doc.text('Address: 123 Pets Road, Hoan Kiem Dist, Hanoi', 50, footerY + 24);

        // QR Code
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const qrData = `${frontendUrl}/my-pets`; // Scan to view pet dashboard
            const qrBuffer = await QRCode.toBuffer(qrData, { 
                width: 80,
                margin: 1,
                color: {
                    dark: '#2d3436',
                    light: '#FFFFFF'
                }
            });
            doc.image(qrBuffer, 465, footerY - 20, { width: 60 });
            doc.fontSize(7).text('Scan to view online profile', 450, footerY + 45, { width: 90, align: 'center' });
        } catch (err) {
            console.error('QR Generate Error:', err);
        }

        doc.end();

    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating PDF report: ' + error.message
        });
    }
};
