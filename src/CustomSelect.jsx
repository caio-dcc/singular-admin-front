import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FONT = "'Domine', serif";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = '',
  style = {},
  th = {},
  mainTheme = 'dark',
  align = 'right',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value) || (placeholder ? { label: placeholder, value: '' } : options[0]);

  const dropdownBg =
    mainTheme === 'dark'
      ? '#08171b'
      : mainTheme === 'sepia'
      ? '#fbf5e8'
      : '#ffffff';

  const dropdownBorder =
    mainTheme === 'dark'
      ? 'rgba(79, 209, 222, 0.28)'
      : th.cardBorder || 'rgba(0,0,0,0.12)';

  const itemHoverBg =
    mainTheme === 'dark'
      ? 'rgba(79, 209, 222, 0.12)'
      : mainTheme === 'sepia'
      ? 'rgba(122, 91, 30, 0.12)'
      : 'rgba(0,0,0,0.06)';

  const activeItemBg =
    mainTheme === 'dark'
      ? 'rgba(79, 209, 222, 0.22)'
      : '#2a8c97';

  const activeItemColor =
    mainTheme === 'dark'
      ? '#4fd1de'
      : '#ffffff';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '8.5px 12px',
          borderRadius: 8,
          border: `1px solid ${open ? '#4fd1de' : (th.cardBorder || 'rgba(255,255,255,0.1)')}`,
          background: th.cardBg || 'rgba(255,255,255,0.05)',
          color: th.text || '#ffffff',
          fontSize: '12.5px',
          fontFamily: FONT,
          cursor: 'pointer',
          outline: 'none',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: open ? '0 0 0 2px rgba(79,209,222,0.2)' : 'none',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', fontWeight: 500 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            color: th.muted || 'rgba(255,255,255,0.6)',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            minWidth: '100%',
            width: 'max-content',
            maxWidth: 320,
            background: dropdownBg,
            border: `1px solid ${dropdownBorder}`,
            borderRadius: 10,
            padding: '6px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: 260,
            overflowY: 'auto',
            animation: 'fadeInSoft 0.15s ease both',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '7.5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: isSelected ? activeItemBg : 'transparent',
                  color: isSelected ? activeItemColor : (th.text || '#ffffff'),
                  fontSize: '12.5px',
                  fontFamily: FONT,
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = itemHoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {opt.label}
                </span>
                {isSelected && <Check size={13} style={{ flexShrink: 0, strokeWidth: 2.5 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
