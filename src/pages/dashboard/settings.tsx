import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';

const SettingsPage: React.FC = () => {
  const [siteName, setSiteName] = useState('My Store');
  const [theme, setTheme] = useState('light');

  const handleSiteNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSiteName(event.target.value);
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value);
  };

  return (
    <PageLayout title="Settings">
      <div>
        <h1>Settings</h1>
        <form>
          <div>
            <label htmlFor="siteName">Site Name:</label>
            <input type="text" id="siteName" value={siteName} onChange={handleSiteNameChange} />
          </div>
          <div>
            <label htmlFor="theme">Theme:</label>
            <select id="theme" value={theme} onChange={handleThemeChange}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button type="submit">Save</button>
        </form>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
