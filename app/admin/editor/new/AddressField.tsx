'use client';

// Won Vision: Google Places (New) v1 autocomplete — AU-restricted.
// Proxy routes: /api/places/autocomplete and /api/places/details
// Debounced 250ms, B&W sharp-corner brand styling.

import { useEffect, useRef, useState } from 'react';

interface Prediction {
  description: string;
  place_id: string;
}

interface Props {
  value: string;
  onChange: (address: string, placeId?: string) => void;
}

// Exported so IntakeForm can reuse the same logic.
export function formatAddress(unit: string, base: string): string {
  const u = unit.trim();
  const b = base.trim();
  if (!u) return b;
  if (!b) return u;
  const wordPrefix = /^(unit|suite|apt|apartment)\b/i.test(u);
  return wordPrefix ? `${u}, ${b}` : `${u}/${b}`;
}

export function AddressField({ value, onChange }: Props) {
  const [text, setText] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = text.trim();
    if (q.length < 3 || q === value) {
      setPredictions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrMsg(null);
    const myReq = ++reqIdRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { predictions?: Prediction[]; error?: string };
        if (myReq !== reqIdRef.current) return;
        if (!res.ok) {
          setPredictions([]);
          setOpen(false);
          setErrMsg(data.error || `Autocomplete failed (HTTP ${res.status})`);
          return;
        }
        const list = data.predictions ?? [];
        setPredictions(list);
        setOpen(list.length > 0);
        if (list.length === 0) setErrMsg('No matches found');
      } catch (e) {
        if (myReq !== reqIdRef.current) return;
        setPredictions([]);
        setErrMsg(e instanceof Error ? e.message : 'Network error');
      } finally {
        if (myReq === reqIdRef.current) setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, value]);

  async function selectPrediction(p: Prediction) {
    setOpen(false);
    setPredictions([]);
    setText(p.description);
    setResolving(true);
    setErrMsg(null);
    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(p.place_id)}`);
      const data = (await res.json()) as { formatted_address?: string; lat?: number; lng?: number; error?: string };
      if (!res.ok) {
        setErrMsg(data.error || `Details failed (HTTP ${res.status})`);
        onChange(p.description, p.place_id);
        return;
      }
      const addr = data.formatted_address || p.description;
      setText(addr);
      onChange(addr, p.place_id);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Network error');
      onChange(p.description, p.place_id);
    } finally {
      setResolving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px 36px 10px 12px',
    border: '1px solid #000',
    borderRadius: 0,
    fontSize: '14px',
    color: '#000',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        id="address"
        value={text}
        autoComplete="off"
        placeholder="123 Collins St, Melbourne VIC 3000"
        onChange={(e) => setText(e.target.value)}
        onFocus={(e) => {
          e.currentTarget.style.border = '2px solid #000';
          e.currentTarget.style.padding = '9px 35px 9px 11px';
          if (predictions.length > 0) setOpen(true);
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid #000';
          e.currentTarget.style.padding = '10px 36px 10px 12px';
        }}
        style={inputStyle}
      />
      {/* Status indicator */}
      <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '11px', color: '#737373' }}>
        {(loading || resolving) ? '…' : null}
      </div>

      {/* Dropdown */}
      {open && predictions.length > 0 && (
        <ul style={{
          position: 'absolute',
          zIndex: 50,
          left: 0,
          right: 0,
          marginTop: '2px',
          maxHeight: '260px',
          overflowY: 'auto',
          background: '#fff',
          border: '1px solid #000',
          borderRadius: 0,
          listStyle: 'none',
          padding: 0,
        }}>
          {predictions.map((p, i) => (
            <li key={p.place_id}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); selectPrediction(p); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 12px',
                  fontSize: '13px',
                  color: '#000',
                  background: '#fff',
                  border: 'none',
                  borderBottom: i < predictions.length - 1 ? '1px solid #E5E5E5' : 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                {p.description}
              </button>
            </li>
          ))}
        </ul>
      )}

      {errMsg && (
        <p style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>{errMsg}</p>
      )}
    </div>
  );
}
