import { useId } from 'react';
import { RadioButton } from '../RadioButton/RadioButton';
import styles from './RadioGroup.module.css';

export interface RadioOption {
  readonly value: string;
  readonly label: string;
  readonly accentColor?: string;
}

export interface RadioGroupProps {
  readonly name: string;
  readonly options: readonly RadioOption[];
  readonly selectedValue: string;
  readonly onChange: (value: string) => void;
  readonly label?: string;
  readonly direction?: 'vertical' | 'horizontal';
}

export const RadioGroup = ({
  name,
  options,
  selectedValue,
  onChange,
  label,
  direction = 'vertical',
}: RadioGroupProps) => {
  const groupId = useId();

  const optionsClasses = [
    styles.optionsList,
    direction === 'horizontal' ? styles.horizontal : styles.vertical,
  ].join(' ');

  return (
    <fieldset className={styles.radioGroup}>
      {label && <legend className={styles.legendElement}>{label}</legend>}

      <div className={optionsClasses}>
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const isSelected = option.value === selectedValue;

          return (
            <RadioButton
              key={option.value}
              id={optionId}
              name={name}
              value={option.value}
              label={option.label}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              accentColor={option.accentColor}
            />
          );
        })}
      </div>
    </fieldset>
  );
};

RadioGroup.displayName = 'RadioGroup';
