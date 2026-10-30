import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  TRAFFIC_POLICE: 'TRAFFIC_POLICE',
  DEPARTMENT_ADMIN: 'DEPARTMENT_ADMIN',
  DEPARTMENT_SUPERVISOR: 'DEPARTMENT_SUPERVISOR',
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('CURRENT_USER_SESSION');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activePortal, setActivePortal] = useState(() => {
    const saved = localStorage.getItem('ACTIVE_PORTAL');
    return saved || 'police'; // 'police' or 'department'
  });

  // Login with specific officer or admin
  const loginAsOfficer = (officerObj) => {
    const userSession = {
      ...officerObj,
      role: ROLES.TRAFFIC_POLICE,
      contact: officerObj.phone || officerObj.contact || '',
      department: officerObj.department || 'Traffic Zone Directorate',
    };
    setCurrentUser(userSession);
    setActivePortal('police');
    localStorage.setItem('CURRENT_USER_SESSION', JSON.stringify(userSession));
    localStorage.setItem('ACTIVE_PORTAL', 'police');
    localStorage.setItem('ACCESS_TOKEN', btoa(JSON.stringify({ sub: officerObj.id || 'officer', role: ROLES.TRAFFIC_POLICE, iat: Date.now() })));
    return userSession;
  };

  const loginAsAdmin = (customAdmin = null) => {
    const adminSession = customAdmin || {
      id: 'adm-command',
      name: 'Department Command Administrator',
      username: 'admin.traffic',
      badge: 'HQ-COMMAND',
      role: ROLES.DEPARTMENT_ADMIN,
      designation: 'Traffic Enforcement Administrator',
      department: 'Central Traffic Enforcement Command',
      jurisdiction: 'Metropolitan City Grid',
      contact: '',
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      avatar: 'HQ',
    };
    setCurrentUser(adminSession);
    setActivePortal('department');
    localStorage.setItem('CURRENT_USER_SESSION', JSON.stringify(adminSession));
    localStorage.setItem('ACTIVE_PORTAL', 'department');
    localStorage.setItem('ACCESS_TOKEN', btoa(JSON.stringify({ sub: adminSession.id, role: ROLES.DEPARTMENT_ADMIN, iat: Date.now() })));
    return adminSession;
  };

  const loginWithCredentials = (username, password, roleType = 'police') => {
    if (roleType === 'department') {
      const cleanUser = username ? username.trim() : 'admin.traffic';
      const formattedName = cleanUser.includes('admin')
        ? 'Department Command Administrator'
        : cleanUser.replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const customAdmin = {
        id: `adm-${cleanUser.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: formattedName,
        username: cleanUser,
        badge: `HQ-${cleanUser.slice(0, 4).toUpperCase()}`,
        role: ROLES.DEPARTMENT_ADMIN,
        designation: 'Traffic Enforcement Administrator',
        department: 'Central Traffic Enforcement Command',
        jurisdiction: 'Metropolitan City Grid',
        contact: '',
        joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Active',
        avatar: formattedName.slice(0, 2).toUpperCase() || 'HQ',
      };
      return loginAsAdmin(customAdmin);
    }

    // Lookup in registered officers list (Enrolled in Department Portal)
    let officersList = [];
    try {
      const saved = localStorage.getItem('POLICE_OFFICERS_LIST');
      if (saved) officersList = JSON.parse(saved);
    } catch {}

    const cleanUser = username ? username.trim().toLowerCase() : '';
    const matchedOfficer = officersList.find(
      (o) =>
        o.username?.toLowerCase() === cleanUser ||
        o.badge?.toLowerCase() === cleanUser ||
        o.email?.toLowerCase() === cleanUser ||
        o.name?.toLowerCase() === cleanUser
    );

    if (!matchedOfficer) {
      throw new Error(`Officer '${username}' is not registered. Please enroll this officer in Department Command.`);
    }

    if (matchedOfficer.password && password && matchedOfficer.password.trim() !== password.trim()) {
      throw new Error(`Incorrect password for officer ${matchedOfficer.badge || matchedOfficer.name}.`);
    }

    return loginAsOfficer(matchedOfficer);
  };

  const loginAsRole = (roleType = 'police') => {
    if (roleType === 'department') {
      return loginAsAdmin();
    }
    let officersList = [];
    try {
      const saved = localStorage.getItem('POLICE_OFFICERS_LIST');
      if (saved) officersList = JSON.parse(saved);
    } catch {}
    if (officersList.length > 0) {
      return loginAsOfficer(officersList[0]);
    }
    return loginAsOfficer({
      id: 'off-101',
      name: 'Inspector Vikram Singh',
      username: 'officer.vikram',
      badge: 'TP-8421',
      designation: 'Senior Traffic Sub-Inspector',
      department: 'North Traffic Zone Directorate',
      assignedArea: 'Zone A — Sector 4 Highway Corridor',
      phone: '+91 98765 43210',
      status: 'Active',
      avatar: 'VS',
    });
  };

  const switchPortal = (portal) => {
    setActivePortal(portal);
    if (portal === 'department') {
      loginAsAdmin();
    } else {
      let officersList = [];
      try {
        const saved = localStorage.getItem('POLICE_OFFICERS_LIST');
        if (saved) officersList = JSON.parse(saved);
      } catch {}
      if (officersList.length > 0) {
        loginAsOfficer(officersList[0]);
      }
    }
    localStorage.setItem('ACTIVE_PORTAL', portal);
  };

  const updateUserProfile = (updatedFields) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('CURRENT_USER_SESSION', JSON.stringify(updated));
      return updated;
    });

    // If officer, also sync in local officers cache
    if (currentUser?.id) {
      try {
        const saved = localStorage.getItem('POLICE_OFFICERS_LIST');
        if (saved) {
          const list = JSON.parse(saved);
          const updatedList = list.map((o) => (o.id === currentUser.id ? { ...o, ...updatedFields } : o));
          localStorage.setItem('POLICE_OFFICERS_LIST', JSON.stringify(updatedList));
        }
      } catch {}
    }
  };

  const changeUserPassword = (newPassword) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, password: newPassword };
      localStorage.setItem('CURRENT_USER_SESSION', JSON.stringify(updated));
      return updated;
    });

    if (currentUser?.id) {
      try {
        const saved = localStorage.getItem('POLICE_OFFICERS_LIST');
        if (saved) {
          const list = JSON.parse(saved);
          const updatedList = list.map((o) => (o.id === currentUser.id ? { ...o, password: newPassword } : o));
          localStorage.setItem('POLICE_OFFICERS_LIST', JSON.stringify(updatedList));
        }
      } catch {}
    }
  };

  const logout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('CURRENT_USER_SESSION');
    setCurrentUser(null);
  };

  const isPolice = activePortal === 'police' || currentUser?.role === ROLES.TRAFFIC_POLICE;
  const isDepartment = activePortal === 'department' || currentUser?.role === ROLES.DEPARTMENT_ADMIN || currentUser?.role === ROLES.DEPARTMENT_SUPERVISOR;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        activePortal,
        loginAsRole,
        loginAsOfficer,
        loginAsAdmin,
        loginWithCredentials,
        updateUserProfile,
        changeUserPassword,
        switchPortal,
        logout,
        isPolice,
        isDepartment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
