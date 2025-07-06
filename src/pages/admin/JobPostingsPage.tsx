import React, { useEffect, useState } from 'react';
import { JobPostingService } from '../../lib/database';

const defaultForm = {
  title: '',
  department: '',
  location: '',
  type: '',
  experience: '',
  salary: '',
  description: '',
  requirements: '',
  benefits: '',
  posted: '',
};

const JobPostingsPage: React.FC = () => {
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = JobPostingService.subscribe([], (data) => {
      setJobPostings(data);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (job: any) => {
    setEditingId(job.id);
    setForm({
      ...job,
      requirements: job.requirements ? job.requirements.join(', ') : '',
      benefits: job.benefits ? job.benefits.join(', ') : '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this job posting?')) return;
    setLoading(true);
    await JobPostingService.delete(id);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...form,
      requirements: form.requirements.split(',').map((s) => s.trim()).filter(Boolean),
      benefits: form.benefits.split(',').map((s) => s.trim()).filter(Boolean),
      posted: form.posted || new Date().toLocaleDateString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (editingId) {
      await JobPostingService.update(editingId, data);
      setEditingId(null);
    } else {
      await JobPostingService.create(data);
    }
    setForm(defaultForm);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Manage Job Postings</h1>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Job Title" className="border p-2 rounded" required />
            <input name="department" value={form.department} onChange={handleChange} placeholder="Department" className="border p-2 rounded" required />
            <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="border p-2 rounded" required />
            <input name="type" value={form.type} onChange={handleChange} placeholder="Type (Full-time, Contract, etc.)" className="border p-2 rounded" required />
            <input name="experience" value={form.experience} onChange={handleChange} placeholder="Experience" className="border p-2 rounded" required />
            <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" className="border p-2 rounded" required />
            <input name="posted" value={form.posted} onChange={handleChange} placeholder="Posted (e.g. 2 days ago)" className="border p-2 rounded" />
          </div>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded w-full" required />
          <input name="requirements" value={form.requirements} onChange={handleChange} placeholder="Requirements (comma separated)" className="border p-2 rounded w-full" />
          <input name="benefits" value={form.benefits} onChange={handleChange} placeholder="Benefits (comma separated)" className="border p-2 rounded w-full" />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded" disabled={loading}>{editingId ? 'Update' : 'Create'} Job Posting</button>
          {editingId && <button type="button" className="ml-4 text-gray-600 underline" onClick={() => { setEditingId(null); setForm(defaultForm); }}>Cancel</button>}
        </form>
        <h2 className="text-xl font-semibold mb-4">Current Job Postings</h2>
        <div className="space-y-4">
          {jobPostings.map((job) => (
            <div key={job.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-bold text-lg">{job.title}</div>
                <div className="text-gray-600">{job.department} • {job.location} • {job.type}</div>
                <div className="text-gray-500 text-sm">{job.experience} • {job.salary}</div>
                <div className="text-gray-700 mt-2">{job.description}</div>
                <div className="text-xs text-gray-500 mt-1">Posted: {job.posted}</div>
                <div className="text-xs text-gray-500 mt-1">Requirements: {Array.isArray(job.requirements) ? job.requirements.join(', ') : ''}</div>
                <div className="text-xs text-gray-500 mt-1">Benefits: {Array.isArray(job.benefits) ? job.benefits.join(', ') : ''}</div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button className="bg-yellow-500 text-white px-4 py-1 rounded" onClick={() => handleEdit(job)}>Edit</button>
                <button className="bg-red-500 text-white px-4 py-1 rounded" onClick={() => handleDelete(job.id)}>Delete</button>
              </div>
            </div>
          ))}
          {jobPostings.length === 0 && <div className="text-gray-500">No job postings found.</div>}
        </div>
      </div>
    </div>
  );
};

export default JobPostingsPage; 