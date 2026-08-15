import { genderLabel } from '../data';
import type { Gender } from '../types';

export function PersonFields({
  name,
  phone,
  age,
  gender,
  city,
  jobTitle,
  password,
  onName,
  onPhone,
  onAge,
  onGender,
  onCity,
  onJobTitle,
  onPassword,
}: {
  name: string;
  phone: string;
  age: string;
  gender: Gender;
  city: string;
  jobTitle?: string;
  password?: string;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onAge: (v: string) => void;
  onGender: (v: Gender) => void;
  onCity: (v: string) => void;
  onJobTitle?: (v: string) => void;
  onPassword?: (v: string) => void;
}) {
  return (
    <>
      <div className="profile-row">
        <span>Имя</span>
        <input value={name} onChange={(e) => onName(e.target.value)} autoComplete="name" />
      </div>
      <div className="profile-row">
        <span>Телефон</span>
        <input value={phone} onChange={(e) => onPhone(e.target.value)} autoComplete="tel" />
      </div>
      <div className="profile-row">
        <span>Возраст</span>
        <input
          type="number"
          min={16}
          max={80}
          inputMode="numeric"
          value={age}
          onChange={(e) => onAge(e.target.value)}
          placeholder="29"
        />
      </div>
      <div className="profile-row">
        <span>Пол</span>
        <select value={gender} onChange={(e) => onGender(e.target.value as Gender)}>
          <option value="unspecified">{genderLabel.unspecified}</option>
          <option value="female">{genderLabel.female}</option>
          <option value="male">{genderLabel.male}</option>
        </select>
      </div>
      <div className="profile-row">
        <span>Город</span>
        <input value={city} onChange={(e) => onCity(e.target.value)} placeholder="Ташкент" autoComplete="address-level2" />
      </div>
      {onJobTitle && jobTitle !== undefined ? (
        <div className="profile-row">
          <span>Должность</span>
          <input value={jobTitle} onChange={(e) => onJobTitle(e.target.value)} placeholder="Сотрудник" />
        </div>
      ) : null}
      {onPassword && password !== undefined ? (
        <div className="profile-row">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => onPassword(e.target.value)}
            placeholder="пусто — не менять"
            autoComplete="new-password"
          />
        </div>
      ) : null}
    </>
  );
}

export function parseAge(value: string): number | null {
  const n = Number(value);
  if (!value.trim() || Number.isNaN(n)) return null;
  return n;
}
