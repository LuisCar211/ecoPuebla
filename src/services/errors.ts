export function errorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  const detail = error instanceof Error ? error.message : '';
  if (/Database ['"]?\(default\)['"]? not found/i.test(detail)) {
    return 'La base de Firestore (default) no existe. Escribe el ID real de tu base en EXPO_PUBLIC_FIRESTORE_DATABASE_ID y reinicia Expo.';
  }
  const messages: Record<string, string> = {
    'auth/invalid-email': 'El correo electrónico no es válido.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/email-already-in-use': 'La cuenta ya se creó. Inicia sesión con ese correo y completa tu perfil.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/operation-not-allowed': 'Activa el acceso con correo y contraseña en Firebase Authentication.',
    'permission-denied': 'Firestore rechazó la operación. Revisa sus reglas de acceso.',
  };
  return (code && messages[code]) || (error instanceof Error ? error.message : 'Ocurrió un error. Inténtalo de nuevo.');
}
