import React, { useState } from "react";
import Toast from "./Toast";
import LoadingOverlay from "./LoadingOverlay";
import { GROUPS_LIST } from "../utils/userData";
import { getUsers, setUsers, addUser, updateUser, deleteUser } from "../utils/userStore";
import './UserManager.css';

export default function UserManager() {
  const [users, setUsersState] = useState(getUsers());
  const [ldapSyncing, setLdapSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    group: GROUPS_LIST[0].id,
    status: "aktiv",
    mustChangePassword: false,
    cannotChangePassword: false,
    passwordNeverExpires: false,
    accountDisabled: false,
  });

  function handleEdit(user) {
    setEditing({ ...user });
    setShowEditModal(true);
  }
  function handleSaveEdit() {
    const updated = users.map(u => u.id === editing.id ? editing : u);
    setUsers(updated);
    setUsersState(updated);
    updateUser(editing);
    setEditing(null);
    setShowEditModal(false);
  }

  function handlePasswordReset(user) {
    setToast({ text: `Passwort für ${user.username} wurde zurückgesetzt.`, type: 'success' });
    setTimeout(() => setToast(null), 1800);
  }
  function handleDelete(id) {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    setUsersState(updated);
    deleteUser(id);
  }
  function handleNewUser() {
    const user = {
      ...newUser,
      id: Math.random().toString(36).slice(2, 10),
      groupName: GROUPS_LIST.find(g => g.id === newUser.group)?.name,
      permissions: newUser.group === 'admin' ? ['read', 'write', 'delete', 'manage'] : ['read', 'write'],
      created: new Date().toISOString().split('T')[0],
    };
    addUser(user);
    setUsersState(getUsers());
    setNewUser({
      name: "",
      username: "",
      email: "",
      password: "",
      group: GROUPS_LIST[0].id,
      status: "aktiv",
      mustChangePassword: false,
      cannotChangePassword: false,
      passwordNeverExpires: false,
      accountDisabled: false,
    });
    setShowNewUserModal(false);
  }

  function handleLdapSync() {
    // Simuliere: Nur wenn sich User geändert haben, lade neu
    // (hier: einfach alles überschreiben, außer manuell angelegte User)
    const { generateUserData } = require('../utils/userData');
    const synced = generateUserData(10);
    const all = [...synced];
    users.forEach(u => {
      if (!all.some(su => su.username === u.username)) all.push(u);
    });
    const changed = all.length !== users.length || all.some((u, i) => u.username !== users[i]?.username);
    if (changed) {
      setLdapSyncing(true);
      setTimeout(() => {
        setUsersState(all);
        setUsers(all);
        setLdapSyncing(false);
      }, 1800);
    } else {
      setToast({ text: 'Keine Änderungen gefunden.', type: 'info' });
      setTimeout(() => setToast(null), 1800);
    }
  }

  return (
    <div className="user-manager">
      <div className="user-list">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2>Benutzerverwaltung</h2>
          <div>
            <button onClick={() => setShowNewUserModal(true)} style={{marginRight:'0.7em'}}>Neuen Benutzer anlegen</button>
            <button style={{background:'#2a6baf',color:'#fff'}} onClick={handleLdapSync}>LDAP Sync</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Benutzername</th>
              <th>Gruppe</th>
              <th>Status</th>
              <th>Berechtigungen</th>
              <th>Optionen</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.groupName}</td>
                <td>{user.status}</td>
                <td>{(user.permissions || []).join(", ")}</td>
                <td>
                  <ul style={{margin:0,padding:0,listStyle:'none',fontSize:'0.95em'}}>
                    {user.mustChangePassword && <li>🔑 Passwort ändern</li>}
                    {user.cannotChangePassword && <li>🚫 Kein Passwortwechsel</li>}
                    {user.passwordNeverExpires && <li>♾️ Nie ablaufend</li>}
                    {user.accountDisabled && <li>⛔ Deaktiviert</li>}
                    {!(user.mustChangePassword||user.cannotChangePassword||user.passwordNeverExpires||user.accountDisabled) && <li>–</li>}
                  </ul>
                </td>
                <td>
                  <>
                    <button onClick={() => handleEdit(user)}>Bearbeiten</button>
                    <button onClick={() => handleDelete(user.id)}>Löschen</button>
                  </>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ldapSyncing && <LoadingOverlay text="LDAP Sync läuft..." />}
      {toast && <Toast text={toast.text} type={toast.type} />}
      {showEditModal && editing && (
        <div className="user-modal-bg">
          <div className="user-modal">
            <h3>Benutzer bearbeiten</h3>
            <input placeholder="Name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            <input placeholder="Benutzername" value={editing.username} onChange={e => setEditing({ ...editing, username: e.target.value })} />
            <input placeholder="E-Mail" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} />
            <input placeholder="Passwort" type="text" value={editing.password || ''} onChange={e => setEditing({ ...editing, password: e.target.value })} />
            <select value={editing.group} onChange={e => setEditing({ ...editing, group: e.target.value, groupName: GROUPS_LIST.find(g => g.id === e.target.value)?.name })}>
              {GROUPS_LIST.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
              <option value="aktiv">aktiv</option>
              <option value="gesperrt">gesperrt</option>
              <option value="in Prüfung">in Prüfung</option>
            </select>
            <div style={{marginTop:'0.5em',marginBottom:'0.5em',display:'flex',flexDirection:'column',gap:'2px'}}>
              <label><input type="checkbox" checked={editing.mustChangePassword} onChange={e => setEditing({ ...editing, mustChangePassword: e.target.checked })}/> Passwort bei nächster Anmeldung ändern</label>
              <label><input type="checkbox" checked={editing.cannotChangePassword} onChange={e => setEditing({ ...editing, cannotChangePassword: e.target.checked })}/> Benutzer kann Kennwort nicht ändern</label>
              <label><input type="checkbox" checked={editing.passwordNeverExpires} onChange={e => setEditing({ ...editing, passwordNeverExpires: e.target.checked })}/> Kennwort läuft nie ab</label>
              <label><input type="checkbox" checked={editing.accountDisabled} onChange={e => setEditing({ ...editing, accountDisabled: e.target.checked })}/> Konto ist deaktiviert</label>
            </div>
            <div style={{display:'flex',gap:'1em',marginTop:'1em'}}>
              <button onClick={handleSaveEdit} style={{background:'#2a6baf',color:'#fff'}}>Speichern</button>
              <button onClick={()=>{setShowEditModal(false);setEditing(null);}}>Abbrechen</button>
              <button style={{background:'#e6e6e6',color:'#2a6baf'}} onClick={() => handlePasswordReset(editing)}>Passwort zurücksetzen</button>
            </div>
          </div>
        </div>
      )}
      {showNewUserModal && (
        <div className="user-modal-bg">
          <div className="user-modal">
            <h3>Neuen Benutzer anlegen</h3>
            <input placeholder="Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
            <input placeholder="Benutzername" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
            <input placeholder="E-Mail" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            <input placeholder="Passwort" type="text" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <select value={newUser.group} onChange={e => setNewUser({ ...newUser, group: e.target.value })}>
              {GROUPS_LIST.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })}>
              <option value="aktiv">aktiv</option>
              <option value="gesperrt">gesperrt</option>
              <option value="in Prüfung">in Prüfung</option>
            </select>
            <div style={{marginTop:'0.5em',marginBottom:'0.5em',display:'flex',flexDirection:'column',gap:'2px'}}>
              <label><input type="checkbox" checked={newUser.mustChangePassword} onChange={e => setNewUser({ ...newUser, mustChangePassword: e.target.checked })}/> Passwort bei nächster Anmeldung ändern</label>
              <label><input type="checkbox" checked={newUser.cannotChangePassword} onChange={e => setNewUser({ ...newUser, cannotChangePassword: e.target.checked })} /> Benutzer kann Kennwort nicht ändern</label>
              <label><input type="checkbox" checked={newUser.passwordNeverExpires} onChange={e => setNewUser({ ...newUser, passwordNeverExpires: e.target.checked })}/> Kennwort läuft nie ab</label>
              <label><input type="checkbox" checked={newUser.accountDisabled} onChange={e => setNewUser({ ...newUser, accountDisabled: e.target.checked })}/> Konto ist deaktiviert</label>
            </div>
            <div style={{display:'flex',gap:'1em',marginTop:'1em'}}>
              <button onClick={handleNewUser} style={{background:'#2a6baf',color:'#fff'}}>Übernehmen</button>
              <button onClick={()=>setShowNewUserModal(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
