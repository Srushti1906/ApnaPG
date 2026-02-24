import React, { useState, useEffect } from 'react';
import { enquiryService, pgService } from '../services';

export default function BookingModal() {
  const [open, setOpen] = useState(false);
  const [pg, setPg] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', altPhone: '', collegeName: '', age: '', occupation: ''});
  const [message, setMessage] = useState(null);
  const [durationType, setDurationType] = useState('custom');
  const [days, setDays] = useState(1);

  useEffect(() => {
    const handler = async (e) => {
      console.log('BookingModal received openBooking event', e);
      const { pgId } = (e && e.detail) ? e.detail : {};
      if (!pgId) return;
      try {
        const res = await pgService.getPGById(pgId);
        setPg(res.data.pg);
        setOpen(true);
      } catch (err) {
        console.error('Error fetching PG for booking modal', err);
      }
    };
    window.addEventListener('openBooking', handler);
    return () => window.removeEventListener('openBooking', handler);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await enquiryService.createEnquiry({
        pgId: pg?._id,
        name: form.name,
        phone: form.phone,
        altPhone: form.altPhone,
        collegeName: form.collegeName,
        age: form.age,
        occupation: form.occupation,
        durationType,
        days: durationType === 'oneDay' ? 1 : durationType === 'oneMonth' ? 30 : days,
      });
      setMessage('Your booking request is sent');
      setForm({ name: '', phone: '', altPhone: '', collegeName: '', age: '', occupation: '' });
      setTimeout(() => { setMessage(null); setOpen(false); }, 2500);
    } catch (err) {
      console.error('Enquiry submit failed', err);
      const errMsg = err?.response?.data?.message || 'Failed to send request';
      setMessage(errMsg);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Book: {pg?.name}</h3>
          <button onClick={() => setOpen(false)} className="text-xl">×</button>
        </div>
        {message && <div className="mb-3 text-green-600">{message}</div>}
          <form onSubmit={handleSubmit}>
            <label className="label">Booking Type</label>
            <select value={durationType} onChange={(e) => setDurationType(e.target.value)} className="input-field mb-2">
              <option value="oneDay">1 Day</option>
              <option value="custom">Custom Days</option>
              <option value="oneMonth">1 Month</option>
            </select>
            {durationType === 'custom' && (
              <>
                <label className="label">Number of Days</label>
                <input name="days" type="number" min="1" value={days} onChange={(e) => setDays(parseInt(e.target.value || '1'))} className="input-field mb-2" />
              </>
            )}
          <label className="label">Name</label>
          <input name="name" required value={form.name} onChange={handleChange} className="input-field" />

          <label className="label">Contact No</label>
          <input name="phone" required value={form.phone} onChange={handleChange} className="input-field" />

          <label className="label">Alternate Contact No</label>
          <input name="altPhone" value={form.altPhone} onChange={handleChange} className="input-field" />

          <label className="label">College Name</label>
          <input name="collegeName" value={form.collegeName} onChange={handleChange} className="input-field" />

          <label className="label">Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} className="input-field" />

          <label className="label">Occupation</label>
          <input name="occupation" value={form.occupation} onChange={handleChange} className="input-field" />

          <div className="flex gap-2 mt-3">
            <button type="submit" className="btn-primary w-full">Send Booking Request</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary w-full">Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}
