import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Plus, Users, Phone, Mail, Calendar,
  Briefcase, Search, ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCZK, formatDate, classNames } from '../utils/format';
import { EMPLOYEE_ROLES, CONTRACT_TYPES } from '../data/payroll';
import { aggregateTimeEntries, filterEntriesByMonth, formatHours } from '../utils/payrollCalc';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import EmployeeFormModal from '../components/EmployeeFormModal';

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function EmployeesPage() {
  const { employees, timeEntries } = useApp();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  const currentMonth = thisMonth();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees
      .filter((e) => e.active !== false)
      .filter((e) => {
        if (!q) return true;
        return `${e.name} ${e.nickname || ''} ${EMPLOYEE_ROLES[e.role]?.label || ''}`.toLowerCase().includes(q);
      });
  }, [employees, search]);

  return (
    <>
      <PageHeader
        breadcrumbs={
          <>
            <Link to="/mzdy" className="hover:text-ink-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Mzdy
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink-700">Zaměstnanci</span>
          </>
        }
        title="Zaměstnanci"
        subtitle={`${filtered.length} ${filtered.length === 1 ? 'aktivní zaměstnanec' : filtered.length <= 4 ? 'aktivní zaměstnanci' : 'aktivních zaměstnanců'}.`}
        actions={
          <button type="button" onClick={() => setCreating(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Přidat</span>
          </button>
        }
      />

      <div className="px-4 md:px-8 py-5 max-w-7xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat jméno nebo profesi…"
            className="input pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Users}
              title={search ? 'Nikdo neodpovídá hledání' : 'Žádní zaměstnanci'}
              description={search ? 'Zkuste jiné hledání.' : 'Začněte přidáním zaměstnance.'}
              action={!search && (
                <button onClick={() => setCreating(true)} className="btn btn-primary">
                  <Plus className="w-4 h-4" /> Přidat zaměstnance
                </button>
              )}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((emp) => {
              const monthEntries = filterEntriesByMonth(
                timeEntries.filter((te) => te.employeeId === emp.id),
                currentMonth
              );
              const wage = aggregateTimeEntries(monthEntries, emp);
              return <EmployeeCard key={emp.id} employee={emp} hoursThisMonth={wage.totalHours} />;
            })}
          </div>
        )}
      </div>

      <EmployeeFormModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

function EmployeeCard({ employee, hoursThisMonth }) {
  const role = EMPLOYEE_ROLES[employee.role] || EMPLOYEE_ROLES.helper;
  const contract = CONTRACT_TYPES[employee.contractType] || CONTRACT_TYPES.hpp;

  return (
    <Link
      to={`/mzdy/zamestnanci/${employee.id}`}
      className="card card-hover p-4 flex flex-col gap-3 group"
    >
      <div className="flex items-start gap-3">
        <Avatar employee={employee} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-ink-900 leading-tight">{employee.name}</p>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <Badge color={role.color}>{role.label}</Badge>
            <span className="text-xs text-ink-500 font-semibold">{contract.short}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-ink-100">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-500 font-bold">Sazba</p>
          <p className="font-mono tabular-nums font-bold text-ink-900 mt-0.5">
            {employee.hourlyRate} Kč/h
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-500 font-bold">Hodiny tento měsíc</p>
          <p className="font-mono tabular-nums font-bold text-ink-900 mt-0.5">
            {formatHours(hoursThisMonth)}
          </p>
        </div>
      </div>

      {(employee.phone || employee.email) && (
        <div className="flex items-center gap-3 text-xs text-ink-500 pt-1">
          {employee.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">{employee.phone}</span>
              <span className="sm:hidden">tel</span>
            </span>
          )}
          {employee.email && (
            <span className="inline-flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
