export function canCreateProducts(profile) {
  return profile?.role === 'admin'
}

export function isAdmin(profile) {
  return profile?.role === 'admin'
}
