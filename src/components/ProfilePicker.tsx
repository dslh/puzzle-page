import { useState } from 'react';
import type { FormEvent } from 'react';
import { AGE_BANDS, type AgeBand, type AgeSetting } from '../types/puzzle';
import { activeChild, newId, type Store } from '../profiles/store';
import type { StoreChange } from '../profiles/useStore';
import styles from './ProfilePicker.module.css';

interface ProfilePickerProps {
  store: Store;
  onChange: StoreChange;
}

type Editing = { mode: 'add' } | { mode: 'edit'; id: string } | null;

const ageLabel = (age: AgeBand) => AGE_BANDS.find(band => band.id === age)?.label ?? age;

/**
 * "Who is it for?": one button per child, plus Anyone. A child brings their
 * own page, age and settings; Anyone keeps the plain age switch.
 */
export default function ProfilePicker({ store, onChange }: ProfilePickerProps) {
  const child = activeChild(store);
  const [editing, setEditing] = useState<Editing>(null);

  const choose = (id: string | null) => {
    setEditing(null);
    onChange({ ...store, activeId: id });
  };

  // Anyone's settings start again from the new age, as the switch always did
  const handleAnyoneAge = (age: AgeSetting) => {
    onChange({ ...store, anyone: { ...store.anyone, age, settings: {} } });
  };

  const handleSave = (name: string, age: AgeBand) => {
    if (editing?.mode === 'edit') {
      onChange({
        ...store,
        children: store.children.map(c => c.id === editing.id ? { ...c, name, age } : c),
      });
    } else {
      // A page started under Anyone comes along to the new child
      const id = newId();
      const page = child ? [] : store.anyone.page;
      onChange({
        ...store,
        activeId: id,
        children: [...store.children, {
          id, name, age, settings: {}, page, favourites: [], notYet: [], history: [],
        }],
      });
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    const child = store.children.find(c => c.id === id);
    const name = child?.name ?? 'child';
    const printed = child?.history.length ?? 0;
    onChange({
      ...store,
      activeId: store.activeId === id ? null : store.activeId,
      children: store.children.filter(c => c.id !== id),
    }, printed > 0
      ? `Deleted ${name} and ${printed} printed page${printed === 1 ? '' : 's'}`
      : `Deleted ${name}`);
    setEditing(null);
  };

  const editingChild = editing?.mode === 'edit'
    ? store.children.find(c => c.id === editing.id)
    : undefined;

  return (
    <section className={styles.picker} aria-labelledby="who-label">
      <h2 id="who-label" className={styles.heading}>Who is it for?</h2>
      <div className={styles.chips}>
        {store.children.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.chip} ${c.id === store.activeId ? styles.selected : ''}`}
            aria-pressed={c.id === store.activeId}
            onClick={() => choose(c.id)}
          >
            <span className={styles.name}>{c.name}</span>
            <span className={styles.age}>{ageLabel(c.age)}</span>
          </button>
        ))}
        <button
          type="button"
          className={`${styles.chip} ${!child ? styles.selected : ''}`}
          aria-pressed={!child}
          onClick={() => choose(null)}
        >
          Anyone
        </button>
        <button
          type="button"
          className={`${styles.chip} ${styles.add}`}
          aria-expanded={editing?.mode === 'add'}
          onClick={() => setEditing(editing?.mode === 'add' ? null : { mode: 'add' })}
        >
          {store.children.length === 0 ? '+ Add a child' : '+'}
          {store.children.length > 0 && <span className={styles.visuallyHidden}> Add a child</span>}
        </button>
      </div>

      {editing ? (
        <ChildForm
          key={editing.mode === 'edit' ? editing.id : 'add'}
          initialName={editingChild?.name ?? ''}
          initialAge={editingChild?.age ?? '4-5'}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={editingChild && (() => handleDelete(editingChild.id))}
        />
      ) : child ? (
        <p className={styles.childLine}>
          Age {ageLabel(child.age)}. Settings you change are kept for {child.name}.{' '}
          <button type="button" className={styles.link} onClick={() => setEditing({ mode: 'edit', id: child.id })}>
            Change
          </button>
        </p>
      ) : (
        <div className={styles.ageSwitch} role="group" aria-labelledby="age-label">
          <span id="age-label" className={styles.ageLabel}>Child’s age</span>
          <div className={styles.ageButtons}>
            {[{ id: 'all', label: 'All' } as const, ...AGE_BANDS].map(option => (
              <button
                key={option.id}
                type="button"
                className={`${styles.ageButton} ${store.anyone.age === option.id ? styles.selected : ''}`}
                aria-pressed={store.anyone.age === option.id}
                onClick={() => handleAnyoneAge(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface ChildFormProps {
  initialName: string;
  initialAge: AgeBand;
  onSave: (name: string, age: AgeBand) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function ChildForm({ initialName, initialAge, onSave, onCancel, onDelete }: ChildFormProps) {
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState<AgeBand>(initialAge);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSave(trimmed, age);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.ageLabel}>Name</span>
        <input
          className={styles.input}
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
          autoComplete="off"
          autoFocus
          required
        />
      </label>
      <div className={styles.field} role="group" aria-labelledby="child-age-label">
        <span id="child-age-label" className={styles.ageLabel}>Age</span>
        <div className={styles.ageButtons}>
          {AGE_BANDS.map(band => (
            <button
              key={band.id}
              type="button"
              className={`${styles.ageButton} ${age === band.id ? styles.selected : ''}`}
              aria-pressed={age === band.id}
              onClick={() => setAge(band.id)}
            >
              {band.label}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.note}>Kept in this browser only.</p>
      <div className={styles.formActions}>
        <button type="submit" className={styles.save} disabled={!name.trim()}>
          {onDelete ? 'Save' : 'Add'}
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
        {onDelete && (
          <button type="button" className={`${styles.link} ${styles.delete}`} onClick={onDelete}>
            Delete {initialName}
          </button>
        )}
      </div>
    </form>
  );
}
