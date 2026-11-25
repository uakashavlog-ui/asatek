import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { ServiceCenter } from '../../types/asatek';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export const AdminServiceCentersPage: React.FC = () => {
  const { serviceCenters, saveServiceCenter, deleteServiceCenter } = useStore();
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceCenter>({
    id: '',
    hubCode: 'Regional Hub',
    city: '',
    province: 'Punjab',
    facilityType: 'Warranty Claim',
    name: '',
    address: '',
    leadEngineer: '',
    specialization: 'PWM & MPPT Solar Controllers',
    diagnostics: 'Bench Load Rig',
    hours: 'Mon - Sat: 10:00 AM - 7:00 PM',
    phone: '',
    whatsapp: '',
    active: true,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return serviceCenters.filter((c) => {
      if (provinceFilter !== 'All' && c.province !== provinceFilter) return false;
      if (q) {
        const hay = `${c.city} ${c.name} ${c.address} ${c.leadEngineer}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [serviceCenters, search, provinceFilter]);

  const openNew = () => {
    setForm({
      id: `sc-${Date.now().toString().slice(-4)}`,
      hubCode: `Hub · ${Date.now().toString().slice(-2)}`,
      city: '',
      province: 'Punjab',
      facilityType: 'Warranty Claim',
      name: '',
      address: '',
      leadEngineer: '',
      specialization: 'Solar Charge Controllers & UPS',
      diagnostics: 'Same-Day Bench Testing',
      hours: 'Mon - Sat: 10:00 AM - 7:00 PM',
      phone: '',
      whatsapp: '',
      active: true,
    });
    setDrawerOpen(true);
  };

  const openEdit = (center: ServiceCenter) => {
    setForm({ ...center });
    setDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city.trim() || !form.name.trim()) return;
    saveServiceCenter(form);
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-extrabold text-on-surface">Service Centers Directory Manager</h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage authorized regional warranty depots across Punjab, Sindh, KPK, and Balochistan.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-bold self-start"
        >
          + Add Service Center Hub
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search city, market, or lead engineer..."
          className="flex-1 rounded-lg border border-outline-variant px-3.5 py-2 text-sm"
        />
        <select
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
          aria-label="Filter province"
          className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
        >
          <option value="All">All Provinces ({serviceCenters.length})</option>
          <option value="Punjab">Punjab</option>
          <option value="Sindh">Sindh</option>
          <option value="KPK">KPK</option>
          <option value="Balochistan">Balochistan</option>
          <option value="Islamabad / Northern">Islamabad / Northern</option>
        </select>
      </div>

      {/* Centers Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low text-xs font-semibold uppercase text-on-surface-variant border-b border-surface-container">
                <th className="py-3 px-4">City &amp; Hub</th>
                <th className="py-3 px-4">Province / Type</th>
                <th className="py-3 px-4">Lead Engineer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.map((center) => (
                <tr key={center.id} className="hover:bg-surface-container-low/60">
                  <td className="py-3 px-4">
                    <div className="font-bold text-primary">{center.city}</div>
                    <div className="text-xs font-semibold text-on-surface">{center.name}</div>
                    <div className="text-[11px] text-on-surface-variant truncate max-w-xs">{center.address}</div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="font-semibold">{center.province}</div>
                    <div className="text-on-surface-variant">{center.facilityType}</div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="font-semibold">{center.leadEngineer}</div>
                    <div className="text-on-surface-variant">{center.specialization}</div>
                  </td>
                  <td className="py-3 px-4 font-spec-code text-xs">
                    <div>{center.phone}</div>
                    <div className="text-tertiary">{center.whatsapp}</div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => saveServiceCenter({ ...center, active: !center.active })}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        center.active
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {center.active ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(center)}
                        className="px-2.5 py-1 rounded bg-surface-container text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(center.id)}
                        className="px-2.5 py-1 rounded bg-error-container text-on-error-container text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-xl bg-surface-container-lowest border border-surface-container p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface">Service Center Details</h2>
              <button type="button" onClick={() => setDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                type="text"
                placeholder="City (e.g. Gujranwala)"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value as ServiceCenter['province'] })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              >
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="KPK">KPK</option>
                <option value="Balochistan">Balochistan</option>
                <option value="Islamabad / Northern">Islamabad / Northern</option>
              </select>
              <input
                required
                type="text"
                placeholder="Hub / Market Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="sm:col-span-2 rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <input
                required
                type="text"
                placeholder="Full Shop Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="sm:col-span-2 rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Lead Engineer"
                value={form.leadEngineer}
                onChange={(e) => setForm({ ...form, leadEngineer: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <select
                value={form.facilityType}
                onChange={(e) => setForm({ ...form, facilityType: e.target.value as ServiceCenter['facilityType'] })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              >
                <option value="Warranty Claim">Warranty Claim</option>
                <option value="Regional Hub">Regional Hub</option>
                <option value="Central Depot">Central Depot</option>
              </select>
              <input
                type="tel"
                placeholder="Phone (e.g. 055-3214567)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
              />
              <input
                type="tel"
                placeholder="WhatsApp (e.g. 0300-1234567)"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
              />
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">
                  Save Service Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Remove Service Center?"
        description="This center will be removed from the public Authorized Service Centers directory."
        confirmLabel="Remove Hub"
        variant="danger"
        onConfirm={() => {
          if (deleteId) deleteServiceCenter(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
