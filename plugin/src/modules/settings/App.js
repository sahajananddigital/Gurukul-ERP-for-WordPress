import { Routes, Route, Navigate } from 'react-router-dom';
import GeneralSettings from './GeneralSettings';
import UserAccess from './UserAccess';
import ImportExport from './ImportExport';

const SettingsApp = () => {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="general" replace />} />
			<Route path="general" element={<GeneralSettings />} />
			<Route path="user-access" element={<UserAccess />} />
			<Route path="import-export" element={<ImportExport />} />
		</Routes>
	);
};

export default SettingsApp;
