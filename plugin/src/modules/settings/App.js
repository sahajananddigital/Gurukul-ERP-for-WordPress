import { Routes, Route, Navigate } from 'react-router-dom';
import GeneralSettings from './GeneralSettings';
import UserAccess from './UserAccess';

const SettingsApp = () => {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="general" replace />} />
			<Route path="general" element={<GeneralSettings />} />
			<Route path="user-access" element={<UserAccess />} />
		</Routes>
	);
};

export default SettingsApp;
