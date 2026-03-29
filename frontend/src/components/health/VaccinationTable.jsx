import React from 'react';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const VaccinationTable = ({ vaccines }) => {
  if (!vaccines || vaccines.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-500 italic">No vaccination records found for this pet.</p>
      </div>
    );
  }

  const getStatusBadge = (nextDueDate) => {
    if (!nextDueDate) return null;
    const now = new Date();
    const dueDate = new Date(nextDueDate);
    const in7Days = addDays(now, 7);

    // Past due
    if (isBefore(dueDate, now)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" /> Overdue
        </span>
      );
    }
    
    // Within 7 days
    if (isBefore(dueDate, in7Days)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" /> Upcoming
        </span>
      );
    }

    // Still far off
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" /> Valid
      </span>
    );
  };

  const addToGoogleCalendar = (vaccine) => {
    const title = `Pet Vaccination reminder: ${vaccine.name}`;
    const start = format(new Date(vaccine.nextDueDate), "yyyyMMdd'T'HHmmss'Z'");
    const end = format(addDays(new Date(vaccine.nextDueDate), 1), "yyyyMMdd'T'HHmmss'Z'");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent('CarePet reminder: Time for next pet vaccination.')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200 text-left">
        <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-500 tracking-wider">
          <tr>
            <th className="px-6 py-4">Vaccine Name</th>
            <th className="px-6 py-4">Administered Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Next Due Date</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {vaccines.map((v, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{v.name}</td>
              <td className="px-6 py-4 text-gray-600">
                {format(new Date(v.dateAdministered), 'dd/MM/yyyy')}
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(v.nextDueDate)}
              </td>
              <td className="px-6 py-4 text-gray-600 font-medium">
                {v.nextDueDate ? format(new Date(v.nextDueDate), 'dd/MM/yyyy') : 'N/A'}
              </td>
              <td className="px-6 py-4">
                {v.nextDueDate && (
                  <button
                    onClick={() => addToGoogleCalendar(v)}
                    className="flex items-center text-sm font-semibold text-[#ff4d4d] hover:text-[#e03a3a] transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-1.5" />
                    <span>Add to Calendar</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VaccinationTable;
