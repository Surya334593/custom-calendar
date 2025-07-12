import React, { useState, useEffect } from 'react';

const AppointmentForm = ({
  date,
  onClose,
  onSave,
  onDelete,
  doctors,
  patients,
  existingAppointment,
}) => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    time: '',
    date,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingAppointment) {
      setFormData(existingAppointment);
    }
  }, [existingAppointment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // clear error on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.patient) newErrors.patient = 'Please select a patient';
    if (!formData.doctor) newErrors.doctor = 'Please select a doctor';
    if (!formData.time) newErrors.time = 'Please select a time';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData, existingAppointment);
  };

  const handleDelete = () => {
    if (existingAppointment && window.confirm("Delete this appointment?")) {
      onDelete(existingAppointment);
    }
  };

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <h3>{existingAppointment ? 'Edit Appointment' : 'New Appointment'}</h3>

      <label>Patient</label>
      <select name="patient" value={formData.patient} onChange={handleChange}>
        <option value="">Select</option>
        {patients.map((p, i) => (
          <option key={i}>{p}</option>
        ))}
      </select>
      {errors.patient && <span className="error">{errors.patient}</span>}

      <label>Doctor</label>
      <select name="doctor" value={formData.doctor} onChange={handleChange}>
        <option value="">Select</option>
        {doctors.map((d, i) => (
          <option key={i}>{d}</option>
        ))}
      </select>
      {errors.doctor && <span className="error">{errors.doctor}</span>}

      <label>Time</label>
      <input type="time" name="time" value={formData.time} onChange={handleChange} />
      {errors.time && <span className="error">{errors.time}</span>}

      <div className="form-buttons">
        {!existingAppointment && <button type="submit" className="save-btn">Save</button>}
        {existingAppointment && (
          <>
            <button type="submit" className="update-btn">Update</button>
            <button type="button" onClick={handleDelete} className="delete-btn">Delete</button>
          </>
        )}
        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
      </div>
    </form>
  );
};

export default AppointmentForm;
