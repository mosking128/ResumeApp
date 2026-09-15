import type { DateRange, MonthYear } from '@/domain/types';
import styles from './DateRangeField.module.css';

interface Props {
  value: DateRange;
  onChange: (v: DateRange) => void;
  disabled?: boolean;
  allowPresent?: boolean;
}

// 过去 20 年 + 未来 2 年（含当前年）
const YEARS = Array.from(
  { length: 23 },
  (_, i) => new Date().getFullYear() + 2 - i,
);

export function DateRangeField({ value, onChange, disabled, allowPresent = true }: Props) {
  const start = value.start;
  const end = value.end;
  const isPresent = Boolean(value.isPresent);

  const setStartPart = (patch: Partial<MonthYear>) => {
    const base: MonthYear = start ?? { year: new Date().getFullYear(), month: 1 };
    onChange({ ...value, start: { ...base, ...patch } });
  };

  const setEndPart = (patch: Partial<MonthYear>) => {
    const base: MonthYear = end ?? { year: new Date().getFullYear(), month: 1 };
    onChange({ ...value, end: { ...base, ...patch } });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <label className={styles.col}>
          <span className={styles.label}>开始</span>
          <div className={styles.inputs}>
            <select
              disabled={disabled}
              value={start?.year ?? ''}
              onChange={(e) =>
                e.target.value
                  ? setStartPart({ year: Number(e.target.value) })
                  : onChange({ ...value, start: null })
              }
            >
              <option value="" disabled>
                年
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              disabled={disabled || !start}
              value={start?.month ?? ''}
              onChange={(e) => e.target.value && setStartPart({ month: Number(e.target.value) })}
            >
              <option value="" disabled>
                月
              </option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className={styles.col}>
          <span className={styles.label}>结束</span>
          <div className={styles.inputs}>
            <select
              disabled={disabled || isPresent}
              value={end?.year ?? ''}
              onChange={(e) =>
                e.target.value
                  ? setEndPart({ year: Number(e.target.value) })
                  : onChange({ ...value, end: null })
              }
            >
              <option value="" disabled>
                年
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              disabled={disabled || isPresent || !end}
              value={end?.month ?? ''}
              onChange={(e) => e.target.value && setEndPart({ month: Number(e.target.value) })}
            >
              <option value="" disabled>
                月
              </option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      {allowPresent ? (
        <label className={styles.present}>
          <input
            type="checkbox"
            disabled={disabled}
            checked={isPresent}
            onChange={(e) =>
              onChange({
                ...value,
                isPresent: e.target.checked,
                end: e.target.checked ? value.end : value.end,
              })
            }
          />
          至今
        </label>
      ) : null}
    </div>
  );
}
