import React, { useEffect, useState } from 'react';
import { EmailTemplateService } from '../../lib/database';

const SettingsPage: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ subject: '', html: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', subject: '', html: '' });

  useEffect(() => {
    const unsubscribe = EmailTemplateService.subscribe([], (data) => {
      setTemplates(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSelect = (template: any) => {
    setSelected(template);
    setForm({ subject: template.subject, html: template.html });
    setSuccess(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    await EmailTemplateService.update(selected.id, { ...selected, ...form, updatedAt: new Date() });
    setLoading(false);
    setSuccess(true);
  };

  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    setLoading(true);
    await EmailTemplateService.create({ ...newForm, updatedAt: new Date() });
    setShowNew(false);
    setNewForm({ name: '', subject: '', html: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Settings</h1>
        <p className="text-gray-600 mb-4">Manage system settings and email templates below.</p>
        <h2 className="text-xl font-semibold mb-2">Email Templates</h2>
        <button onClick={() => setShowNew((v) => !v)} className="mb-4 bg-green-600 text-white px-4 py-2 rounded">
          {showNew ? 'Cancel' : 'Add New Template'}
        </button>
        {showNew && (
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input name="name" value={newForm.name} onChange={handleNewChange} className="border p-2 rounded w-full" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input name="subject" value={newForm.subject} onChange={handleNewChange} className="border p-2 rounded w-full" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">HTML Content</label>
              <textarea name="html" value={newForm.html} onChange={handleNewChange} className="border p-2 rounded w-full h-32 font-mono" />
            </div>
            <button onClick={handleCreate} className="bg-blue-600 text-white px-6 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Create Template'}</button>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <ul className="border rounded divide-y">
              {templates.map((tpl) => (
                <li key={tpl.id} className={`p-3 cursor-pointer hover:bg-blue-50 ${selected?.id === tpl.id ? 'bg-blue-100' : ''}`} onClick={() => handleSelect(tpl)}>
                  <div className="font-medium">{tpl.name}</div>
                  <div className="text-xs text-gray-500 truncate">{tpl.subject}</div>
                </li>
              ))}
              {templates.length === 0 && <li className="p-3 text-gray-400">No templates found.</li>}
            </ul>
          </div>
          <div className="md:w-2/3">
            {selected ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange} className="border p-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HTML Content</label>
                  <textarea name="html" value={form.html} onChange={handleChange} className="border p-2 rounded w-full h-40 font-mono" />
                </div>
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                {success && <div className="text-green-600 mt-2">Template updated!</div>}
              </div>
            ) : (
              <div className="text-gray-500">Select a template to edit.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 