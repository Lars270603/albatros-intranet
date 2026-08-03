export function canCreateProducts(profile) {
  if (!profile) return false
  return profile.department === 'vertrieb' || profile.department === 'geschaeftsfuehrung' || profile.role === 'admin'
}

export function isAdmin(profile) {
  return profile?.role === 'admin'
}
